import { REST_ENERGY_THRESHOLD } from '../../core/constants/ecology.constants';
import { Agent } from '../../core/models/agent.model';
import { PredatorFsmState } from '../../core/models/agent-fsm-state.model';
import { Vec2 } from '../../core/models/vec2.model';
import { seek, wander } from './steering';

export interface PredatorFsmContext {
  agent: Agent;
  nearestPrey: Agent | null;
  nearestMate: Agent | null;
  mateInRange: boolean;
}

export interface PredatorFsmResult {
  state: PredatorFsmState;
  steerDir: Vec2;
}

export function decidePredatorFsm(ctx: PredatorFsmContext): PredatorFsmResult {
  const { agent, nearestPrey, nearestMate, mateInRange } = ctx;
  const energyRatio = agent.energy / agent.genes.maxEnergy;

  if (energyRatio < REST_ENERGY_THRESHOLD && !nearestPrey) {
    return {
      state: 'rest',
      steerDir: { x: 0, y: 0 },
    };
  }

  const readyToMate =
    agent.age >= agent.genes.reproductiveAge &&
    agent.energy >= agent.genes.reproductionEnergyThreshold &&
    agent.reproductionCooldown <= 0 &&
    nearestMate !== null;

  if (readyToMate && mateInRange) {
    return {
      state: 'reproduce',
      steerDir: seek(agent.position, nearestMate!.position),
    };
  }

  if (readyToMate && nearestMate) {
    return {
      state: 'seekMate',
      steerDir: seek(agent.position, nearestMate.position),
    };
  }

  if (nearestPrey) {
    return {
      state: 'hunt',
      steerDir: seek(agent.position, nearestPrey.position),
    };
  }

  return {
    state: 'wander',
    steerDir: wander(agent.heading),
  };
}
