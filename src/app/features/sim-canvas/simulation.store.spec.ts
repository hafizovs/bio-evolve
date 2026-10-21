import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { SimulationStore } from './simulation.store';

describe('SimulationStore', () => {
  let store: SimulationStore;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), SimulationStore],
    });
    store = TestBed.inject(SimulationStore);
  });

  it('toggles play state', () => {
    expect(store.isPlaying()).toBe(true);
    store.togglePlay();
    expect(store.isPlaying()).toBe(false);
    store.togglePlay();
    expect(store.isPlaying()).toBe(true);
  });

  it('clamps mutation rate to 0..1', () => {
    store.setMutationRate(1.5);
    expect(store.settings().mutationRate).toBe(1);
    store.setMutationRate(-0.2);
    expect(store.settings().mutationRate).toBe(0);
    store.setMutationRate(0.42);
    expect(store.settings().mutationRate).toBeCloseTo(0.42);
  });
});
