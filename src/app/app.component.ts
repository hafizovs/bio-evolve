import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { AnalyticsPanelComponent } from './features/analytics/analytics-panel.component';
import { GodPanelComponent } from './features/god-panel/god-panel.component';
import { HotkeysHelpComponent } from './shared/hotkeys-help/hotkeys-help.component';
import { GeneticPassportComponent } from './features/passport/genetic-passport.component';
import { SimCanvasComponent } from './features/sim-canvas/sim-canvas.component';
import { StatusBarComponent } from './core/layout/status-bar/status-bar.component';
import { ToolbarComponent } from './core/layout/toolbar/toolbar.component';
import { HotkeysService } from './core/services/hotkeys.service';
import { I18nService } from './core/services/i18n.service';
import { SpawnService } from './features/sim-canvas/spawn.service';
import { SimulationStore } from './features/sim-canvas/simulation.store';
import { UiStore } from './core/ui/ui.store';

@Component({
  selector: 'bev-root',
  standalone: true,
  imports: [
    ToolbarComponent,
    SimCanvasComponent,
    GodPanelComponent,
    GeneticPassportComponent,
    AnalyticsPanelComponent,
    StatusBarComponent,
    HotkeysHelpComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly ui = inject(UiStore);
  readonly simulation = inject(SimulationStore);
  readonly i18n = inject(I18nService);
  private readonly spawn = inject(SpawnService);
  private readonly hotkeys = inject(HotkeysService);

  constructor() {
    this.hotkeys.init();

    effect(() => {
      const theme = this.ui.theme();
      document.documentElement.dataset['theme'] = theme;
    });
  }

  closeDrawer(): void {
    this.ui.setMobileDrawerOpen(false);
  }

  bannerSpawnPrey(): void {
    this.spawn.spawnPreyBatch(50);
  }

  bannerSpawnPredators(): void {
    this.spawn.spawnPredatorBatch(10);
  }

  bannerSeedPlants(): void {
    this.spawn.seedPlants();
  }
}
