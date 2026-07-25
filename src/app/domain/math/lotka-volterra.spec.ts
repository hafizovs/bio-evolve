import { describe, expect, it } from 'vitest';
import {
  createDefaultLvState,
  stepLotkaVolterra,
} from './lotka-volterra';

describe('lotka-volterra', () => {
  it('grows prey when predators are zero', () => {
    const state = createDefaultLvState(40, 0);
    const next = stepLotkaVolterra(state, 0.05);
    expect(next.prey).toBeGreaterThan(state.prey);
    expect(next.predators).toBe(0);
  });

  it('shrinks predators when prey are zero', () => {
    const state = createDefaultLvState(0, 10);
    const next = stepLotkaVolterra(state, 0.05);
    expect(next.predators).toBeLessThan(state.predators);
    expect(next.prey).toBe(0);
  });

  it('produces finite values over many steps', () => {
    let state = createDefaultLvState(40, 10);
    for (let i = 0; i < 1000; i++) {
      state = stepLotkaVolterra(state, 0.05);
    }
    expect(Number.isFinite(state.prey)).toBe(true);
    expect(Number.isFinite(state.predators)).toBe(true);
    expect(state.prey).toBeGreaterThanOrEqual(0);
    expect(state.predators).toBeGreaterThanOrEqual(0);
  });
});
