import { describe, expect, it } from 'vitest';
import { Agent } from '../../core/models/agent.model';
import { decidePreyFsm } from './prey-fsm';

function makePrey(overrides: Partial<Agent> = {}): Agent {
  return {
    id: 'prey-1',
    kind: 'prey',
    genes: {
      visionRange: 100,
      maxSpeed: 60,
      maxEnergy: 100,
      metabolism: 2,
      reproductiveAge: 10,
      reproductionEnergyThreshold: 70,
      bodySize: 6,
    },
    position: { x: 100, y: 100 },
    velocity: { x: 0, y: 0 },
    heading: 0,
    energy: 90,
    age: 5,
    generation: 0,
    fsmState: 'wander',
    reproductionCooldown: 0,
    alive: true,
    parentIds: [null, null],
    ...overrides,
  };
}

describe('prey-fsm', () => {
  it('enters panic when a predator is in vision', () => {
    const prey = makePrey();
    const predator = makePrey({
      id: 'pred-1',
      kind: 'predator',
      position: { x: 110, y: 100 },
    });
    const result = decidePreyFsm({
      agent: prey,
      nearestPredator: predator,
      nearestPlant: null,
      nearestMate: null,
      mateInRange: false,
    });
    expect(result.state).toBe('panic');
    expect(result.steerDir.x).toBeLessThan(0);
  });

  it('seeks food when energy is low and no predator', () => {
    const prey = makePrey({ energy: 40 });
    const plant = {
      id: 'plant-1',
      position: { x: 150, y: 100 },
      energyValue: 25,
      radius: 4,
      alive: true,
    };
    const result = decidePreyFsm({
      agent: prey,
      nearestPredator: null,
      nearestPlant: plant,
      nearestMate: null,
      mateInRange: false,
    });
    expect(result.state).toBe('seekFood');
    expect(result.steerDir.x).toBeGreaterThan(0);
  });
});
