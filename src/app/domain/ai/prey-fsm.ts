import { Agent } from '../../core/models/agent.model';
import { PreyFsmState } from '../../core/models/agent-fsm-state.model';
import { Plant } from '../../core/models/plant.model';
import { Vec2 } from '../../core/models/vec2.model';
import { flee, seek, wander } from './steering';

export interface PreyFsmContext {
  agent: Agent;
  nearestPredator: Agent | null;
  nearestPlant: Plant | null;
  nearestMate: Agent | null;
  mateInRange: boolean;
}

export interface PreyFsmResult {
  state: PreyFsmState;
  steerDir: Vec2;
}

export function decidePreyFsm(ctx: PreyFsmContext): PreyFsmResult {
  const { agent, nearestPredator, nearestPlant, nearestMate, mateInRange } = ctx;

  if (nearestPredator) {
    return {
      state: 'panic',
      steerDir: flee(agent.position, nearestPredator.position),
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

  if (agent.energy < 0.7 * agent.genes.maxEnergy && nearestPlant) {
    return {
      state: 'seekFood',
      steerDir: seek(agent.position, nearestPlant.position),
    };
  }

  return {
    state: 'wander',
    steerDir: wander(agent.heading),
  };
}
