import { PLANT_REGROW_CHANCE_PER_SECOND } from '../../core/constants/ecology.constants';
import { MAX_PLANTS } from '../../core/constants/world.constants';
import { Plant } from '../../core/models/plant.model';
import { WorldConfig } from '../../core/models/world-config.model';
import { random } from '../math/rng';

/**
 * Stochastic plant regrowth (appendix B.6):
 * expected = PLANT_REGROW_CHANCE_PER_SECOND * dt * max(livingPlants, 1)
 * Spawn floor(expected) plants plus one extra with probability frac(expected),
 * capped by available MAX_PLANTS slots.
 */
export function regrowPlants(
  plants: Plant[],
  world: WorldConfig,
  dt: number,
  createPlant: () => Plant,
): Plant[] {
  const living = plants.filter((p) => p.alive);
  if (living.length >= MAX_PLANTS) {
    return living;
  }

  const expected =
    PLANT_REGROW_CHANCE_PER_SECOND * dt * Math.max(living.length, 1);
  const whole = Math.floor(expected);
  const frac = expected - whole;
  let toSpawn = whole + (random() < frac ? 1 : 0);
  const available = MAX_PLANTS - living.length;
  toSpawn = Math.min(toSpawn, available);

  const next = [...living];
  for (let i = 0; i < toSpawn; i++) {
    const plant = createPlant();
    plant.position.x = Math.max(
      0,
      Math.min(world.width - 1, plant.position.x),
    );
    plant.position.y = Math.max(
      0,
      Math.min(world.height - 1, plant.position.y),
    );
    next.push(plant);
  }
  return next;
}
