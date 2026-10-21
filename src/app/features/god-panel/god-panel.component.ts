import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SEED_PLANTS_BATCH } from '../../core/constants/ecology.constants';
import {
  MAX_PLANTS,
  MAX_PREDATORS,
  MAX_PREY,
  MAX_TOTAL_AGENTS,
} from '../../core/constants/world.constants';
import {
  SIM_SPEED_MAX,
  SIM_SPEED_MIN,
} from '../../core/constants/simulation.constants';
import { I18nService } from '../../core/services/i18n.service';
import { SpawnService } from '../sim-canvas/spawn.service';
import { CameraStore } from '../sim-canvas/camera.store';
import { SimulationStore } from '../sim-canvas/simulation.store';

@Component({
  selector: 'bev-god-panel',
  standalone: true,
  templateUrl: './god-panel.component.html',
  styleUrl: './god-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GodPanelComponent {
  readonly simulation = inject(SimulationStore);
  readonly i18n = inject(I18nService);
  private readonly spawn = inject(SpawnService);
  private readonly camera = inject(CameraStore);

  readonly counts = this.simulation.counts;
  readonly settings = this.simulation.settings;
  readonly isPlaying = this.simulation.isPlaying;

  readonly preyDisabled = computed(() => {
    const c = this.counts();
    return c.prey >= MAX_PREY || c.prey + c.predators >= MAX_TOTAL_AGENTS;
  });

  readonly predatorDisabled = computed(() => {
    const c = this.counts();
    return (
      c.predators >= MAX_PREDATORS ||
      c.prey + c.predators >= MAX_TOTAL_AGENTS
    );
  });

  readonly plantsDisabled = computed(() => this.counts().plants >= MAX_PLANTS);

  readonly mutationPct = computed(() =>
    Math.round(this.settings().mutationRate * 100),
  );
  readonly selectionPct = computed(() =>
    Math.round(this.settings().selectionPressure * 100),
  );

  readonly speedMin = SIM_SPEED_MIN;
  readonly speedMax = SIM_SPEED_MAX;

  spawnPrey(): void {
    this.spawn.spawnPreyBatch(50);
  }

  spawnPredators(): void {
    this.spawn.spawnPredatorBatch(10);
  }

  seedPlants(): void {
    this.spawn.seedPlants(SEED_PLANTS_BATCH);
  }

  onMutation(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.simulation.setMutationRate(value / 100);
  }

  onSelection(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.simulation.setSelectionPressure(value / 100);
  }

  onSpeed(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.simulation.setSimSpeed(value);
  }

  togglePlay(): void {
    this.simulation.togglePlay();
  }

  clearFocus(): void {
    this.simulation.clearSelection();
    this.camera.disableFollow();
  }
}
