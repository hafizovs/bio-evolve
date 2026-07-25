import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { AnalyticsPanelComponent } from './features/analytics/analytics-panel.component';
import { GodPanelComponent } from './features/god-panel/god-panel.component';
import { HotkeysHelpComponent } from './features/hotkeys-help/hotkeys-help.component';
import { GeneticPassportComponent } from './features/passport/genetic-passport.component';
import { SimCanvasComponent } from './features/sim-canvas/sim-canvas.component';
import { StatusBarComponent } from './features/status-bar/status-bar.component';
import { ToolbarComponent } from './features/toolbar/toolbar.component';
import { HotkeysService } from './services/hotkeys.service';
import { I18nService } from './services/i18n.service';
import { SpawnService } from './services/spawn.service';
import { SimulationStore } from './state/simulation.store';
import { UiStore } from './state/ui.store';

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
