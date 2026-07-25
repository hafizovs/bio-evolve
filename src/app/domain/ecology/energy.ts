import {
  METABOLISM_SELECTION_COEFF,
  METABOLISM_SPEED_COEFF,
  PANIC_ENERGY_MULT,
  REST_METABOLISM_MULT,
} from '../../core/constants/ecology.constants';
import { Agent } from '../../core/models/agent.model';
import { vecLength } from '../ai/steering';

export function applyMetabolism(
  agent: Agent,
  selectionPressure: number,
  dt: number,
): void {
  const speed = vecLength(agent.velocity);
  let stateMult = 1;
  if (agent.fsmState === 'panic') {
    stateMult = PANIC_ENERGY_MULT;
  } else if (agent.fsmState === 'rest') {
    stateMult = REST_METABOLISM_MULT;
  }

  const drain =
    (agent.genes.metabolism +
      METABOLISM_SPEED_COEFF * speed +
      METABOLISM_SELECTION_COEFF * selectionPressure * agent.genes.metabolism) *
    stateMult *
    dt;

  agent.energy -= drain;
  if (agent.energy <= 0) {
    agent.energy = 0;
    agent.alive = false;
  }
}

export function clampEnergy(agent: Agent): void {
  if (agent.energy > agent.genes.maxEnergy) {
    agent.energy = agent.genes.maxEnergy;
  }
  if (agent.energy < 0) {
    agent.energy = 0;
  }
}
