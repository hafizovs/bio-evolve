import { Agent } from '../../core/models/agent.model';
import { Plant } from '../../core/models/plant.model';
import { SpatialHash, SpatialKind } from './spatial-hash';

function distance(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

export function nearestPlant(
  hash: SpatialHash,
  plantsById: Map<string, Plant>,
  x: number,
  y: number,
  range: number,
): Plant | null {
  const candidates = hash.queryRadius(x, y, range);
  let best: Plant | null = null;
  let bestDist = Number.POSITIVE_INFINITY;

  for (const c of candidates) {
    if (c.kind !== 'plant') {
      continue;
    }
    const plant = plantsById.get(c.id);
    if (!plant || !plant.alive) {
      continue;
    }
    const d = distance(x, y, plant.position.x, plant.position.y);
    if (d <= range && d < bestDist) {
      bestDist = d;
      best = plant;
    }
  }
  return best;
}

export function nearestAgent(
  hash: SpatialHash,
  agentsById: Map<string, Agent>,
  x: number,
  y: number,
  range: number,
  kind: SpatialKind,
  excludeId?: string,
): Agent | null {
  const candidates = hash.queryRadius(x, y, range);
  let best: Agent | null = null;
  let bestDist = Number.POSITIVE_INFINITY;

  for (const c of candidates) {
    if (c.kind !== kind) {
      continue;
    }
    if (excludeId && c.id === excludeId) {
      continue;
    }
    const agent = agentsById.get(c.id);
    if (!agent || !agent.alive) {
      continue;
    }
    const d = distance(x, y, agent.position.x, agent.position.y);
    if (d <= range && d < bestDist) {
      bestDist = d;
      best = agent;
    }
  }
  return best;
}
