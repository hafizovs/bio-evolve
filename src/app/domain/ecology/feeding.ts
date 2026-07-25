import { PREY_EAT_RADIUS_FACTOR } from '../../core/constants/ecology.constants';
import { Agent } from '../../core/models/agent.model';
import { Plant } from '../../core/models/plant.model';
import { clampEnergy } from './energy';

export function tryFeedPrey(prey: Agent, plant: Plant | null): boolean {
  if (!plant || !plant.alive || !prey.alive || prey.kind !== 'prey') {
    return false;
  }

  const dist = Math.hypot(
    prey.position.x - plant.position.x,
    prey.position.y - plant.position.y,
  );
  const radius =
    prey.genes.bodySize * PREY_EAT_RADIUS_FACTOR + plant.radius;

  if (dist > radius) {
    return false;
  }

  plant.alive = false;
  prey.energy = Math.min(
    prey.genes.maxEnergy,
    prey.energy + plant.energyValue,
  );
  clampEnergy(prey);
  return true;
}
