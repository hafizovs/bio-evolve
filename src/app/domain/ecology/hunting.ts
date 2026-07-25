import {
  PREDATION_ENERGY_GAIN,
  PREDATOR_KILL_RADIUS_FACTOR,
} from '../../core/constants/ecology.constants';
import { Agent } from '../../core/models/agent.model';
import { clampEnergy } from './energy';

export function tryHuntPrey(predator: Agent, prey: Agent | null): boolean {
  if (
    !prey ||
    !prey.alive ||
    !predator.alive ||
    predator.kind !== 'predator' ||
    prey.kind !== 'prey'
  ) {
    return false;
  }

  const dist = Math.hypot(
    predator.position.x - prey.position.x,
    predator.position.y - prey.position.y,
  );
  const radius =
    ((predator.genes.bodySize + prey.genes.bodySize) * 0.5) *
    PREDATOR_KILL_RADIUS_FACTOR;

  if (dist > radius) {
    return false;
  }

  prey.alive = false;
  predator.energy = Math.min(
    predator.genes.maxEnergy,
    predator.energy + PREDATION_ENERGY_GAIN,
  );
  clampEnergy(predator);
  return true;
}
