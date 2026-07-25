export type PreyFsmState =
  | 'wander'
  | 'seekFood'
  | 'panic'
  | 'seekMate'
  | 'reproduce';

export type PredatorFsmState =
  | 'wander'
  | 'hunt'
  | 'seekMate'
  | 'reproduce'
  | 'rest';

export type AgentFsmState = PreyFsmState | PredatorFsmState;
