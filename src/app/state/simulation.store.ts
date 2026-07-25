import { computed, Injectable, signal } from '@angular/core';
import {
  MUTATION_RATE_DEFAULT,
  SELECTION_PRESSURE_DEFAULT,
} from '../core/constants/genetics.constants';
import { SIM_SPEED_DEFAULT } from '../core/constants/simulation.constants';
import {
  INITIAL_PREDATORS,
  INITIAL_PREY,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../core/constants/world.constants';
import { Agent } from '../core/models/agent.model';
import { LotkaVolterraState } from '../core/models/lotka-volterra.model';
import { Plant } from '../core/models/plant.model';
import { SimulationSettings } from '../core/models/simulation-settings.model';
import { WorldConfig } from '../core/models/world-config.model';
import { createDefaultLvState } from '../domain/math/lotka-volterra';
import { clamp } from '../domain/math/clamp';
import { SIM_SPEED_MAX, SIM_SPEED_MIN } from '../core/constants/simulation.constants';

export interface EngineSnapshot {
  plants: Plant[];
  agents: Agent[];
  lvState: LotkaVolterraState;
  tick: number;
  simulationTime: number;
}

export const DEFAULT_SETTINGS: SimulationSettings = {
  mutationRate: MUTATION_RATE_DEFAULT,
  selectionPressure: SELECTION_PRESSURE_DEFAULT,
  simSpeed: SIM_SPEED_DEFAULT,
};

export const DEFAULT_WORLD: WorldConfig = {
  width: WORLD_WIDTH,
  height: WORLD_HEIGHT,
};

@Injectable({ providedIn: 'root' })
export class SimulationStore {
  readonly isPlaying = signal(true);
  readonly tick = signal(0);
  readonly simulationTime = signal(0);
  readonly settings = signal<SimulationSettings>({ ...DEFAULT_SETTINGS });
  readonly world = signal<WorldConfig>({ ...DEFAULT_WORLD });
  readonly plants = signal<Plant[]>([]);
  readonly agents = signal<Agent[]>([]);
  readonly selectedAgentId = signal<string | null>(null);
  readonly lvState = signal<LotkaVolterraState>(
    createDefaultLvState(INITIAL_PREY, INITIAL_PREDATORS),
  );

  readonly selectedAgent = computed(() => {
    const id = this.selectedAgentId();
    if (!id) {
      return null;
    }
    return this.agents().find((a) => a.id === id && a.alive) ?? null;
  });

  readonly counts = computed(() => {
    const agents = this.agents();
    let prey = 0;
    let predators = 0;
    for (const a of agents) {
      if (!a.alive) {
        continue;
      }
      if (a.kind === 'prey') {
        prey++;
      } else {
        predators++;
      }
    }
    return {
      plants: this.plants().filter((p) => p.alive).length,
      prey,
      predators,
    };
  });

  readonly preyAgents = computed(() =>
    this.agents().filter((a) => a.alive && a.kind === 'prey'),
  );

  readonly predatorAgents = computed(() =>
    this.agents().filter((a) => a.alive && a.kind === 'predator'),
  );

  readonly isExtinct = computed(() => {
    const c = this.counts();
    return c.prey === 0 && c.predators === 0;
  });

  play(): void {
    this.isPlaying.set(true);
  }

  pause(): void {
    this.isPlaying.set(false);
  }

  togglePlay(): void {
    this.isPlaying.update((v) => !v);
  }

  setSettings(partial: Partial<SimulationSettings>): void {
    this.settings.update((s) => ({
      ...s,
      ...partial,
      mutationRate:
        partial.mutationRate !== undefined
          ? clamp(partial.mutationRate, 0, 1)
          : s.mutationRate,
      selectionPressure:
        partial.selectionPressure !== undefined
          ? clamp(partial.selectionPressure, 0, 1)
          : s.selectionPressure,
      simSpeed:
        partial.simSpeed !== undefined
          ? clamp(partial.simSpeed, SIM_SPEED_MIN, SIM_SPEED_MAX)
          : s.simSpeed,
    }));
  }

  setMutationRate(v: number): void {
    this.setSettings({ mutationRate: v });
  }

  setSelectionPressure(v: number): void {
    this.setSettings({ selectionPressure: v });
  }

  setSimSpeed(v: number): void {
    this.setSettings({ simSpeed: v });
  }

  replaceWorld(plants: Plant[], agents: Agent[]): void {
    this.plants.set(plants);
    this.agents.set(agents);
  }

  selectAgent(id: string): void {
    this.selectedAgentId.set(id);
  }

  clearSelection(): void {
    this.selectedAgentId.set(null);
  }

  applyEngineSnapshot(snapshot: EngineSnapshot): void {
    this.plants.set(snapshot.plants);
    this.agents.set(snapshot.agents);
    this.lvState.set(snapshot.lvState);
    this.tick.set(snapshot.tick);
    this.simulationTime.set(snapshot.simulationTime);

    const selected = this.selectedAgentId();
    if (selected && !snapshot.agents.some((a) => a.id === selected && a.alive)) {
      this.selectedAgentId.set(null);
    }
  }

  resetCounters(): void {
    this.tick.set(0);
    this.simulationTime.set(0);
  }

  setLvState(state: LotkaVolterraState): void {
    this.lvState.set(state);
  }

  /**
   * Full world reset is orchestrated by SpawnService.resetWorld()
   * (avoids circular DI). This helper clears selection/time flags only.
   */
  resetToDefaults(): void {
    this.clearSelection();
    this.resetCounters();
    this.settings.set({ ...DEFAULT_SETTINGS });
    this.world.set({ ...DEFAULT_WORLD });
    this.play();
  }
}
