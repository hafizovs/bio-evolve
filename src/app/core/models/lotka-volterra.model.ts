export interface LotkaVolterraParams {
  /** prey growth rate */
  alpha: number;
  /** predation rate */
  beta: number;
  /** predator death rate */
  gamma: number;
  /** predator growth from predation */
  delta: number;
}

export interface LotkaVolterraState {
  prey: number;
  predators: number;
  params: LotkaVolterraParams;
}

export interface LotkaVolterraSample {
  t: number;
  prey: number;
  predators: number;
  agentPrey: number;
  agentPredators: number;
}
