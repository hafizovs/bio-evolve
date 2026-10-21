import { inject, Injectable } from '@angular/core';
import {
  PLANT_ENERGY_VALUE,
  PLANT_RADIUS,
  SEED_PLANTS_BATCH,
} from '../../core/constants/ecology.constants';
import {
  INITIAL_PLANTS,
  INITIAL_PREDATORS,
  INITIAL_PREY,
  MAX_PLANTS,
  MAX_PREDATORS,
  MAX_PREY,
  MAX_TOTAL_AGENTS,
  WORLD_HEIGHT,
  WORLD_SPAWN_MARGIN,
  WORLD_WIDTH,
} from '../../core/constants/world.constants';
import { Agent } from '../../core/models/agent.model';
import { Plant } from '../../core/models/plant.model';
import { Vec2 } from '../../core/models/vec2.model';
import { createRandomGenes } from '../../domain/genetics/random-dna';
import { randomRange } from '../../domain/math/rng';
import { CameraStore } from './camera.store';
import { AnalyticsStore } from '../analytics/analytics.store';
import { SimulationStore } from './simulation.store';
import { createDefaultLvState } from '../../domain/math/lotka-volterra';

@Injectable({ providedIn: 'root' })
export class SpawnService {
  private readonly simulation = inject(SimulationStore);
  private readonly camera = inject(CameraStore);
  private readonly analytics = inject(AnalyticsStore);

  private plantCounter = 0;
  private preyCounter = 0;
  private predatorCounter = 0;

  nextPlantId(): string {
    this.plantCounter += 1;
    return `plant-${this.plantCounter}`;
  }

  nextPreyId(): string {
    this.preyCounter += 1;
    return `prey-${this.preyCounter}`;
  }

  nextPredatorId(): string {
    this.predatorCounter += 1;
    return `pred-${this.predatorCounter}`;
  }

  resetIdCounters(): void {
    this.plantCounter = 0;
    this.preyCounter = 0;
    this.predatorCounter = 0;
  }

  private randomPosition(worldW = WORLD_WIDTH, worldH = WORLD_HEIGHT): Vec2 {
    const m = WORLD_SPAWN_MARGIN;
    return {
      x: randomRange(m, worldW - m),
      y: randomRange(m, worldH - m),
    };
  }

  createPlant(position?: Vec2): Plant {
    return {
      id: this.nextPlantId(),
      position: position ?? this.randomPosition(),
      energyValue: PLANT_ENERGY_VALUE,
      radius: PLANT_RADIUS,
      alive: true,
    };
  }

  createRandomPrey(position?: Vec2): Agent {
    const genes = createRandomGenes('prey');
    return {
      id: this.nextPreyId(),
      kind: 'prey',
      genes,
      position: position ?? this.randomPosition(),
      velocity: { x: 0, y: 0 },
      heading: randomRange(0, Math.PI * 2),
      energy: genes.maxEnergy * 0.7,
      age: 0,
      generation: 0,
      fsmState: 'wander',
      reproductionCooldown: 0,
      alive: true,
      parentIds: [null, null],
    };
  }

  createRandomPredator(position?: Vec2): Agent {
    const genes = createRandomGenes('predator');
    return {
      id: this.nextPredatorId(),
      kind: 'predator',
      genes,
      position: position ?? this.randomPosition(),
      velocity: { x: 0, y: 0 },
      heading: randomRange(0, Math.PI * 2),
      energy: genes.maxEnergy * 0.7,
      age: 0,
      generation: 0,
      fsmState: 'wander',
      reproductionCooldown: 0,
      alive: true,
      parentIds: [null, null],
    };
  }

  seedInitialWorld(): { plants: Plant[]; agents: Agent[] } {
    const plants: Plant[] = [];
    for (let i = 0; i < INITIAL_PLANTS; i++) {
      plants.push(this.createPlant());
    }
    const agents: Agent[] = [];
    for (let i = 0; i < INITIAL_PREY; i++) {
      agents.push(this.createRandomPrey());
    }
    for (let i = 0; i < INITIAL_PREDATORS; i++) {
      agents.push(this.createRandomPredator());
    }
    return { plants, agents };
  }

  private livingCounts(): {
    plants: number;
    prey: number;
    predators: number;
    totalAgents: number;
  } {
    const plants = this.simulation.plants().filter((p) => p.alive).length;
    const agents = this.simulation.agents().filter((a) => a.alive);
    let prey = 0;
    let predators = 0;
    for (const a of agents) {
      if (a.kind === 'prey') {
        prey++;
      } else {
        predators++;
      }
    }
    return { plants, prey, predators, totalAgents: prey + predators };
  }

  spawnPreyBatch(n: number): void {
    const counts = this.livingCounts();
    const roomKind = MAX_PREY - counts.prey;
    const roomTotal = MAX_TOTAL_AGENTS - counts.totalAgents;
    const toAdd = Math.max(0, Math.min(n, roomKind, roomTotal));
    if (toAdd === 0) {
      return;
    }
    const next = [...this.simulation.agents()];
    for (let i = 0; i < toAdd; i++) {
      next.push(this.createRandomPrey());
    }
    this.simulation.agents.set(next);
  }

  spawnPredatorBatch(n: number): void {
    const counts = this.livingCounts();
    const roomKind = MAX_PREDATORS - counts.predators;
    const roomTotal = MAX_TOTAL_AGENTS - counts.totalAgents;
    const toAdd = Math.max(0, Math.min(n, roomKind, roomTotal));
    if (toAdd === 0) {
      return;
    }
    const next = [...this.simulation.agents()];
    for (let i = 0; i < toAdd; i++) {
      next.push(this.createRandomPredator());
    }
    this.simulation.agents.set(next);
  }

  seedPlants(n: number = SEED_PLANTS_BATCH): void {
    const counts = this.livingCounts();
    const toAdd = Math.max(0, Math.min(n, MAX_PLANTS - counts.plants));
    if (toAdd === 0) {
      return;
    }
    const next = [...this.simulation.plants()];
    for (let i = 0; i < toAdd; i++) {
      next.push(this.createPlant());
    }
    this.simulation.plants.set(next);
  }

  resetWorld(): void {
    this.resetIdCounters();
    this.analytics.clear();
    this.camera.disableFollow();
    this.simulation.resetToDefaults();
    const seeded = this.seedInitialWorld();
    this.simulation.replaceWorld(seeded.plants, seeded.agents);
    this.simulation.setLvState(
      createDefaultLvState(INITIAL_PREY, INITIAL_PREDATORS),
    );
    this.camera.fitWorld(this.simulation.world());
    this.analytics.recomputeGeneStats(seeded.agents);
    this.analytics.pushSample(
      {
        t: 0,
        plants: INITIAL_PLANTS,
        prey: INITIAL_PREY,
        predators: INITIAL_PREDATORS,
      },
      {
        t: 0,
        prey: INITIAL_PREY,
        predators: INITIAL_PREDATORS,
        agentPrey: INITIAL_PREY,
        agentPredators: INITIAL_PREDATORS,
      },
    );
  }
}
