import {
  LV_ALPHA,
  LV_BETA,
  LV_DELTA,
  LV_GAMMA,
} from '../../core/constants/ecology.constants';
import { MAX_PREDATORS, MAX_PREY } from '../../core/constants/world.constants';
import {
  LotkaVolterraParams,
  LotkaVolterraState,
} from '../../core/models/lotka-volterra.model';

function derivatives(
  N: number,
  P: number,
  p: LotkaVolterraParams,
): { dN: number; dP: number } {
  const dN = p.alpha * N - p.beta * N * P;
  const dP = p.delta * N * P - p.gamma * P;
  return { dN, dP };
}

/**
 * Heun (RK2) step for classical Lotka–Volterra ODEs.
 */
export function stepLotkaVolterra(
  state: LotkaVolterraState,
  dt: number,
): LotkaVolterraState {
  const N = state.prey;
  const P = state.predators;
  const p = state.params;

  const { dN: dN1, dP: dP1 } = derivatives(N, P, p);
  const NPred = Math.max(0, N + dN1 * dt);
  const PPred = Math.max(0, P + dP1 * dt);

  const { dN: dN2, dP: dP2 } = derivatives(NPred, PPred, p);
  let NNext = Math.max(0, N + 0.5 * (dN1 + dN2) * dt);
  let PNext = Math.max(0, P + 0.5 * (dP1 + dP2) * dt);

  NNext = Math.min(NNext, MAX_PREY * 2);
  PNext = Math.min(PNext, MAX_PREDATORS * 2);

  return {
    prey: NNext,
    predators: PNext,
    params: p,
  };
}

export function createDefaultLvState(
  initialPrey: number,
  initialPredators: number,
  params?: Partial<LotkaVolterraParams>,
): LotkaVolterraState {
  return {
    prey: initialPrey,
    predators: initialPredators,
    params: {
      alpha: params?.alpha ?? LV_ALPHA,
      beta: params?.beta ?? LV_BETA,
      gamma: params?.gamma ?? LV_GAMMA,
      delta: params?.delta ?? LV_DELTA,
    },
  };
}
