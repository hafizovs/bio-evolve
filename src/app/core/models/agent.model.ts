import { AgentFsmState } from './agent-fsm-state.model';
import { AgentKind } from './agent-kind.model';
import { DnaGenes } from './dna-genes.model';
import { Vec2 } from './vec2.model';

export interface Agent {
  id: string;
  kind: AgentKind;
  genes: DnaGenes;
  position: Vec2;
  velocity: Vec2;
  heading: number;
  energy: number;
  age: number;
  generation: number;
  fsmState: AgentFsmState;
  reproductionCooldown: number;
  alive: boolean;
  parentIds: [string | null, string | null];
}
