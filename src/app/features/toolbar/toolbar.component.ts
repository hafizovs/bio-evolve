import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../../services/i18n.service';
import { ScreenshotService } from '../../services/screenshot.service';
import { SimulationEngineService } from '../../services/simulation-engine.service';
import { SpawnService } from '../../services/spawn.service';
import { UiStore } from '../../state/ui.store';

@Component({
  selector: 'bev-toolbar',
  standalone: true,
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {
  readonly ui = inject(UiStore);
  readonly i18n = inject(I18nService);
  private readonly spawn = inject(SpawnService);
  private readonly screenshot = inject(ScreenshotService);
  private readonly engine = inject(SimulationEngineService);

  reset(): void {
    this.spawn.resetWorld();
    this.engine.notifyReset();
  }

  capture(): void {
    this.screenshot.capture();
  }

  toggleTheme(): void {
    this.ui.toggleTheme();
  }

  toggleLang(): void {
    this.ui.toggleLocale();
    this.i18n.notifyLocaleChanged();
  }

  toggleHotkeys(): void {
    this.ui.toggleHotkeysHelp();
  }

  togglePanels(): void {
    this.ui.toggleMobileDrawer();
  }
}
