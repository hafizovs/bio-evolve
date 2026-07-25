import {
  OFFSPRING_ENERGY_FRACTION,
  PARENT_ENERGY_COST_FRACTION,
  REPRODUCTION_COOLDOWN,
} from '../../core/constants/ecology.constants';
import { MUTATION_STRENGTH } from '../../core/constants/genetics.constants';
import {
  MAX_PREDATORS,
  MAX_PREY,
  MAX_TOTAL_AGENTS,
} from '../../core/constants/world.constants';
import { Agent } from '../../core/models/agent.model';
import { AgentKind } from '../../core/models/agent-kind.model';
import { DnaGenes } from '../../core/models/dna-genes.model';
import { crossover } from '../genetics/crossover';
import { geneRangesFor } from '../genetics/gene-ranges';
import { mutate } from '../genetics/mutate';
import { clamp } from '../math/clamp';
import { randomRange } from '../math/rng';
import { clampEnergy } from './energy';

export interface ReproductionFactories {
  nextPreyId: () => string;
  nextPredatorId: () => string;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.max(
    0,
    Math.min(sorted.length - 1, Math.floor((p / 100) * (sorted.length - 1))),
  );
  return sorted[idx];
}

function applySoftSelection(
  childGenes: DnaGenes,
  kind: AgentKind,
  population: readonly Agent[],
  selectionPressure: number,
): DnaGenes {
  if (selectionPressure <= 0.7) {
    return childGenes;
  }

  const peers = population.filter((a) => a.alive && a.kind === kind);
  if (peers.length < 10) {
    return childGenes;
  }

  const speeds = peers.map((a) => a.genes.maxSpeed);
  const visions = peers.map((a) => a.genes.visionRange);
  const p15Speed = percentile(speeds, 15);
  const p15Vision = percentile(visions, 15);

  if (
    childGenes.maxSpeed < p15Speed &&
    childGenes.visionRange < p15Vision
  ) {
    const ranges = geneRangesFor(kind);
    const next = { ...childGenes };
    next.metabolism = clamp(
      next.metabolism * 1.1,
      ranges.metabolism.min,
      ranges.metabolism.max,
    );
    return next;
  }

  return childGenes;
}

function canReproduce(agent: Agent): boolean {
  return (
    agent.alive &&
    agent.reproductionCooldown <= 0 &&
    agent.age >= agent.genes.reproductiveAge &&
    agent.energy >= agent.genes.reproductionEnergyThreshold
  );
}

export function mateDistance(a: Agent, b: Agent): number {
  return Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y);
}

export function isMateInRange(a: Agent, b: Agent): boolean {
  const limit = (a.genes.bodySize + b.genes.bodySize) * 0.75;
  return mateDistance(a, b) <= limit;
}

export function tryReproducePair(
  parentA: Agent,
  parentB: Agent,
  allAgents: readonly Agent[],
  mutationRate: number,
  selectionPressure: number,
  factories: ReproductionFactories,
): Agent | null {
  if (parentA.kind !== parentB.kind) {
    return null;
  }
  if (!canReproduce(parentA) || !canReproduce(parentB)) {
    return null;
  }
  if (!isMateInRange(parentA, parentB)) {
    return null;
  }

  const kind = parentA.kind;
  const preyCount = allAgents.filter((a) => a.alive && a.kind === 'prey').length;
  const predCount = allAgents.filter(
    (a) => a.alive && a.kind === 'predator',
  ).length;
  const total = preyCount + predCount;

  if (total >= MAX_TOTAL_AGENTS) {
    return null;
  }
  if (kind === 'prey' && preyCount >= MAX_PREY) {
    return null;
  }
  if (kind === 'predator' && predCount >= MAX_PREDATORS) {
    return null;
  }

  let childGenes = crossover(parentA.genes, parentB.genes);
  childGenes = mutate(childGenes, mutationRate, MUTATION_STRENGTH, kind);
  childGenes = applySoftSelection(
    childGenes,
    kind,
    allAgents,
    selectionPressure,
  );

  const midX = (parentA.position.x + parentB.position.x) * 0.5;
  const midY = (parentA.position.y + parentB.position.y) * 0.5;
  const jitter = 4;
  const childEnergy = clamp(
    ((parentA.energy + parentB.energy) * 0.5) * OFFSPRING_ENERGY_FRACTION,
    1,
    childGenes.maxEnergy,
  );

  const child: Agent = {
    id: kind === 'prey' ? factories.nextPreyId() : factories.nextPredatorId(),
    kind,
    genes: childGenes,
    position: {
      x: midX + randomRange(-jitter, jitter),
      y: midY + randomRange(-jitter, jitter),
    },
    velocity: { x: 0, y: 0 },
    heading: randomRange(0, Math.PI * 2),
    energy: childEnergy,
    age: 0,
    generation: Math.max(parentA.generation, parentB.generation) + 1,
    fsmState: 'wander',
    reproductionCooldown: 0,
    alive: true,
    parentIds: [parentA.id, parentB.id],
  };

  parentA.energy *= 1 - PARENT_ENERGY_COST_FRACTION;
  parentB.energy *= 1 - PARENT_ENERGY_COST_FRACTION;
  clampEnergy(parentA);
  clampEnergy(parentB);
  parentA.reproductionCooldown = REPRODUCTION_COOLDOWN;
  parentB.reproductionCooldown = REPRODUCTION_COOLDOWN;
  parentA.fsmState = 'wander';
  parentB.fsmState = 'wander';

  return child;
}
