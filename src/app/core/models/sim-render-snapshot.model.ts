import { Agent } from './agent.model';
import { Plant } from './plant.model';
import { WorldConfig } from './world-config.model';

export interface SimRenderSnapshot {
  world: WorldConfig;
  plants: readonly Plant[];
  agents: readonly Agent[];
  selectedAgentId: string | null;
  tick: number;
  simulationTime: number;
  isPlaying: boolean;
}
