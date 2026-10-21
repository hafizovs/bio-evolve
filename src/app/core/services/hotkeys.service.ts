import { DestroyRef, inject, Injectable } from '@angular/core';
import { SEED_PLANTS_BATCH } from '../constants/ecology.constants';
import { CameraStore } from '../../features/sim-canvas/camera.store';
import { SimulationStore } from '../../features/sim-canvas/simulation.store';
import { UiStore } from '../ui/ui.store';
import { ScreenshotService } from './screenshot.service';
import { SpawnService } from '../../features/sim-canvas/spawn.service';
import { I18nService } from './i18n.service';
import { SimulationEngineService } from '../../features/sim-canvas/simulation-engine.service';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    return true;
  }
  return target.isContentEditable;
}

@Injectable({ providedIn: 'root' })
export class HotkeysService {
  private readonly simulation = inject(SimulationStore);
  private readonly camera = inject(CameraStore);
  private readonly ui = inject(UiStore);
  private readonly spawn = inject(SpawnService);
  private readonly screenshot = inject(ScreenshotService);
  private readonly i18n = inject(I18nService);
  private readonly engine = inject(SimulationEngineService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (isEditableTarget(event.target)) {
      return;
    }

    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

    if (key === ' ' || event.code === 'Space') {
      event.preventDefault();
      this.simulation.togglePlay();
      return;
    }

    if (key === 'Escape') {
      if (this.ui.hotkeysHelpOpen()) {
        this.ui.setHotkeysHelpOpen(false);
        return;
      }
      this.simulation.clearSelection();
      this.camera.disableFollow();
      return;
    }

    if (key === 'h') {
      this.ui.toggleHotkeysHelp();
      return;
    }

    if (key === 'r') {
      this.spawn.resetWorld();
      this.engine.notifyReset();
      return;
    }

    if (key === 's') {
      this.screenshot.capture();
      return;
    }

    if (key === 't') {
      this.ui.toggleTheme();
      return;
    }

    if (key === 'g') {
      this.ui.toggleLocale();
      this.i18n.notifyLocaleChanged();
      return;
    }

    if (key === '1') {
      this.spawn.spawnPreyBatch(50);
      return;
    }

    if (key === '2') {
      this.spawn.spawnPredatorBatch(10);
      return;
    }

    if (key === '3') {
      this.spawn.seedPlants(SEED_PLANTS_BATCH);
    }
  };

  init(): void {
    window.addEventListener('keydown', this.onKeyDown);
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('keydown', this.onKeyDown);
    });
  }
}
