import { Agent } from '../../core/models/agent.model';
import {
  GeneStatsSnapshot,
  KindGeneAverages,
} from '../../core/models/gene-stats.model';
import { AgentKind } from '../../core/models/agent-kind.model';

function emptyAverages(): KindGeneAverages {
  return {
    count: 0,
    avgVisionRange: 0,
    avgMaxSpeed: 0,
    avgMetabolism: 0,
    avgBodySize: 0,
    avgGeneration: 0,
  };
}

function averagesFor(agents: readonly Agent[], kind: AgentKind): KindGeneAverages {
  const subset = agents.filter((a) => a.alive && a.kind === kind);
  const count = subset.length;
  if (count === 0) {
    return emptyAverages();
  }

  let vision = 0;
  let speed = 0;
  let metabolism = 0;
  let body = 0;
  let generation = 0;

  for (const agent of subset) {
    vision += agent.genes.visionRange;
    speed += agent.genes.maxSpeed;
    metabolism += agent.genes.metabolism;
    body += agent.genes.bodySize;
    generation += agent.generation;
  }

  return {
    count,
    avgVisionRange: vision / count,
    avgMaxSpeed: speed / count,
    avgMetabolism: metabolism / count,
    avgBodySize: body / count,
    avgGeneration: generation / count,
  };
}

export function computeGeneStats(agents: readonly Agent[]): GeneStatsSnapshot {
  return {
    prey: averagesFor(agents, 'prey'),
    predators: averagesFor(agents, 'predator'),
  };
}
