import { inject, Injectable } from '@angular/core';
import {
  LOW_ENERGY_SPEED_MULT,
  LOW_ENERGY_THRESHOLD,
  PANIC_SPEED_MULT,
  TURN_RATE,
} from '../core/constants/ecology.constants';
import { DT_CLAMP_SECONDS, HISTORY_SAMPLE_EVERY_TICKS } from '../core/constants/simulation.constants';
import { Agent } from '../core/models/agent.model';
import { Plant } from '../core/models/plant.model';
import { WorldConfig } from '../core/models/world-config.model';
import { decidePredatorFsm } from '../domain/ai/predator-fsm';
import { decidePreyFsm } from '../domain/ai/prey-fsm';
import { scale, vecLength } from '../domain/ai/steering';
import { applyMetabolism } from '../domain/ecology/energy';
import { tryFeedPrey } from '../domain/ecology/feeding';
import { tryHuntPrey } from '../domain/ecology/hunting';
import { regrowPlants } from '../domain/ecology/plant-growth';
import {
  isMateInRange,
  tryReproducePair,
} from '../domain/ecology/reproduction';
import { clamp, lerp, normalizeAngle } from '../domain/math/clamp';
import { stepLotkaVolterra } from '../domain/math/lotka-volterra';
import { nearestAgent, nearestPlant } from '../domain/population/nearest';
import { SpatialHash } from '../domain/population/spatial-hash';
import { AnalyticsStore } from '../state/analytics.store';
import { SimulationStore } from '../state/simulation.store';
import { SpawnService } from './spawn.service';

@Injectable({ providedIn: 'root' })
export class SimulationEngineService {
  private readonly simulation = inject(SimulationStore);
  private readonly analytics = inject(AnalyticsStore);
  private readonly spawn = inject(SpawnService);

  private readonly spatial = new SpatialHash();
  private workingPlants: Plant[] = [];
  private workingAgents: Agent[] = [];
  private initialized = false;

  ensureInitialized(): void {
    if (this.initialized) {
      return;
    }
    this.spawn.resetWorld();
    this.syncFromStore();
    this.initialized = true;
  }

  private syncFromStore(): void {
    this.workingPlants = this.simulation.plants().map((p) => ({
      ...p,
      position: { ...p.position },
    }));
    this.workingAgents = this.simulation.agents().map((a) => ({
      ...a,
      genes: { ...a.genes },
      position: { ...a.position },
      velocity: { ...a.velocity },
      parentIds: [...a.parentIds] as [string | null, string | null],
    }));
  }

  /**
   * Advance the world by real-frame dt; applies simSpeed and clamps internally.
   */
  step(dtRealSeconds: number): void {
    this.ensureInitialized();

    const settings = this.simulation.settings();
    const world = this.simulation.world();
    let dt = dtRealSeconds * settings.simSpeed;
    dt = Math.min(dt, DT_CLAMP_SECONDS * settings.simSpeed);
    if (dt <= 0) {
      return;
    }

    // Keep working buffers in sync if spawn mutated store arrays externally.
    if (
      this.workingAgents.length !== this.simulation.agents().length ||
      this.workingPlants.length !== this.simulation.plants().length
    ) {
      this.syncFromStore();
    }

    this.rebuildSpatial(world);

    const plantsById = new Map(this.workingPlants.map((p) => [p.id, p]));
    const agentsById = new Map(this.workingAgents.map((a) => [a.id, a]));

    const preyList = this.workingAgents.filter(
      (a) => a.alive && a.kind === 'prey',
    );
    const predatorList = this.workingAgents.filter(
      (a) => a.alive && a.kind === 'predator',
    );

    for (const prey of preyList) {
      this.stepPrey(prey, plantsById, agentsById, settings.selectionPressure, dt, world);
    }
    for (const predator of predatorList) {
      this.stepPredator(predator, agentsById, settings.selectionPressure, dt, world);
    }

    for (const prey of preyList) {
      if (!prey.alive) {
        continue;
      }
      const plant = nearestPlant(
        this.spatial,
        plantsById,
        prey.position.x,
        prey.position.y,
        prey.genes.bodySize + 20,
      );
      tryFeedPrey(prey, plant);
    }

    for (const predator of predatorList) {
      if (!predator.alive) {
        continue;
      }
      const prey = nearestAgent(
        this.spatial,
        agentsById,
        predator.position.x,
        predator.position.y,
        predator.genes.bodySize + 30,
        'prey',
      );
      tryHuntPrey(predator, prey);
    }

    this.runReproduction(settings.mutationRate, settings.selectionPressure);

    this.workingPlants = regrowPlants(
      this.workingPlants,
      world,
      dt,
      () => this.spawn.createPlant(),
    );

    this.workingPlants = this.workingPlants.filter((p) => p.alive);
    this.workingAgents = this.workingAgents.filter((a) => a.alive);

    for (const agent of this.workingAgents) {
      agent.age += dt;
      agent.reproductionCooldown = Math.max(0, agent.reproductionCooldown - dt);
    }

    const lvNext = stepLotkaVolterra(this.simulation.lvState(), dt);
    const tick = this.simulation.tick() + 1;
    const simulationTime = this.simulation.simulationTime() + dt;

    let preyCount = 0;
    let predatorCount = 0;
    for (const a of this.workingAgents) {
      if (a.kind === 'prey') {
        preyCount++;
      } else {
        predatorCount++;
      }
    }
    const plantCount = this.workingPlants.length;

    if (tick % HISTORY_SAMPLE_EVERY_TICKS === 0) {
      this.analytics.pushSample(
        {
          t: simulationTime,
          plants: plantCount,
          prey: preyCount,
          predators: predatorCount,
        },
        {
          t: simulationTime,
          prey: lvNext.prey,
          predators: lvNext.predators,
          agentPrey: preyCount,
          agentPredators: predatorCount,
        },
      );
      this.analytics.recomputeGeneStats(this.workingAgents);
    }

    const plantsSnapshot = this.workingPlants.map((p) => ({
      ...p,
      position: { ...p.position },
    }));
    const agentsSnapshot = this.workingAgents.map((a) => ({
      ...a,
      genes: { ...a.genes },
      position: { ...a.position },
      velocity: { ...a.velocity },
      parentIds: [...a.parentIds] as [string | null, string | null],
    }));

    this.simulation.applyEngineSnapshot({
      plants: plantsSnapshot,
      agents: agentsSnapshot,
      lvState: lvNext,
      tick,
      simulationTime,
    });
  }

  private rebuildSpatial(world: WorldConfig): void {
    void world;
    this.spatial.clear();
    for (const plant of this.workingPlants) {
      if (!plant.alive) {
        continue;
      }
      this.spatial.insert(plant.id, plant.position.x, plant.position.y, 'plant');
    }
    for (const agent of this.workingAgents) {
      if (!agent.alive) {
        continue;
      }
      this.spatial.insert(
        agent.id,
        agent.position.x,
        agent.position.y,
        agent.kind,
      );
    }
  }

  private effectiveMaxSpeed(agent: Agent): number {
    let eff = agent.genes.maxSpeed;
    if (agent.energy / agent.genes.maxEnergy < LOW_ENERGY_THRESHOLD) {
      eff *= LOW_ENERGY_SPEED_MULT;
    }
    if (agent.fsmState === 'panic') {
      eff *= PANIC_SPEED_MULT;
    }
    return eff;
  }

  private integrateMotion(
    agent: Agent,
    steerDir: { x: number; y: number },
    dt: number,
    world: WorldConfig,
  ): void {
    const eff = this.effectiveMaxSpeed(agent);
    const desired =
      vecLength(steerDir) < 1e-8
        ? { x: 0, y: 0 }
        : scale(steerDir, eff);
    const t = clamp(TURN_RATE * dt, 0, 1);
    agent.velocity = {
      x: lerp(agent.velocity.x, desired.x, t),
      y: lerp(agent.velocity.y, desired.y, t),
    };
    agent.position.x += agent.velocity.x * dt;
    agent.position.y += agent.velocity.y * dt;

    if (agent.position.x < 0) {
      agent.position.x = 0;
      agent.velocity.x = Math.max(0, agent.velocity.x);
    } else if (agent.position.x > world.width) {
      agent.position.x = world.width;
      agent.velocity.x = Math.min(0, agent.velocity.x);
    }
    if (agent.position.y < 0) {
      agent.position.y = 0;
      agent.velocity.y = Math.max(0, agent.velocity.y);
    } else if (agent.position.y > world.height) {
      agent.position.y = world.height;
      agent.velocity.y = Math.min(0, agent.velocity.y);
    }

    if (vecLength(agent.velocity) > 1e-4) {
      agent.heading = normalizeAngle(
        Math.atan2(agent.velocity.y, agent.velocity.x),
      );
    }
  }

  private stepPrey(
    prey: Agent,
    plantsById: Map<string, Plant>,
    agentsById: Map<string, Agent>,
    selectionPressure: number,
    dt: number,
    world: WorldConfig,
  ): void {
    const nearestPredator = nearestAgent(
      this.spatial,
      agentsById,
      prey.position.x,
      prey.position.y,
      prey.genes.visionRange,
      'predator',
    );
    const nearestFood = nearestPlant(
      this.spatial,
      plantsById,
      prey.position.x,
      prey.position.y,
      prey.genes.visionRange,
    );
    const nearestMate = nearestAgent(
      this.spatial,
      agentsById,
      prey.position.x,
      prey.position.y,
      prey.genes.visionRange,
      'prey',
      prey.id,
    );
    const mateInRange =
      nearestMate !== null && isMateInRange(prey, nearestMate);

    const decision = decidePreyFsm({
      agent: prey,
      nearestPredator,
      nearestPlant: nearestFood,
      nearestMate,
      mateInRange,
    });
    prey.fsmState = decision.state;
    this.integrateMotion(prey, decision.steerDir, dt, world);
    applyMetabolism(prey, selectionPressure, dt);
  }

  private stepPredator(
    predator: Agent,
    agentsById: Map<string, Agent>,
    selectionPressure: number,
    dt: number,
    world: WorldConfig,
  ): void {
    const nearestPrey = nearestAgent(
      this.spatial,
      agentsById,
      predator.position.x,
      predator.position.y,
      predator.genes.visionRange,
      'prey',
    );
    const nearestMate = nearestAgent(
      this.spatial,
      agentsById,
      predator.position.x,
      predator.position.y,
      predator.genes.visionRange,
      'predator',
      predator.id,
    );
    const mateInRange =
      nearestMate !== null && isMateInRange(predator, nearestMate);

    const decision = decidePredatorFsm({
      agent: predator,
      nearestPrey,
      nearestMate,
      mateInRange,
    });
    predator.fsmState = decision.state;
    this.integrateMotion(predator, decision.steerDir, dt, world);
    applyMetabolism(predator, selectionPressure, dt);
  }

  private runReproduction(
    mutationRate: number,
    selectionPressure: number,
  ): void {
    const used = new Set<string>();
    const newborns: Agent[] = [];
    const byKind = {
      prey: this.workingAgents.filter((a) => a.alive && a.kind === 'prey'),
      predator: this.workingAgents.filter(
        (a) => a.alive && a.kind === 'predator',
      ),
    };

    for (const kind of ['prey', 'predator'] as const) {
      const list = byKind[kind];
      for (let i = 0; i < list.length; i++) {
        const a = list[i];
        if (used.has(a.id) || !a.alive) {
          continue;
        }
        if (a.fsmState !== 'seekMate' && a.fsmState !== 'reproduce') {
          continue;
        }
        for (let j = i + 1; j < list.length; j++) {
          const b = list[j];
          if (used.has(b.id) || !b.alive) {
            continue;
          }
          if (b.fsmState !== 'seekMate' && b.fsmState !== 'reproduce') {
            continue;
          }
          const child = tryReproducePair(
            a,
            b,
            [...this.workingAgents, ...newborns],
            mutationRate,
            selectionPressure,
            {
              nextPreyId: () => this.spawn.nextPreyId(),
              nextPredatorId: () => this.spawn.nextPredatorId(),
            },
          );
          if (child) {
            used.add(a.id);
            used.add(b.id);
            newborns.push(child);
            break;
          }
        }
      }
    }

    if (newborns.length > 0) {
      this.workingAgents.push(...newborns);
    }
  }

  /** Called after external reset so working buffers reload. */
  notifyReset(): void {
    this.syncFromStore();
    this.initialized = true;
  }
}
