import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../../services/i18n.service';
import { UiStore } from '../../state/ui.store';

@Component({
  selector: 'bev-hotkeys-help',
  standalone: true,
  templateUrl: './hotkeys-help.component.html',
  styleUrl: './hotkeys-help.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotkeysHelpComponent {
  readonly i18n = inject(I18nService);
  private readonly ui = inject(UiStore);

  readonly rows: { key: string; labelKey: 'hotkeys.space' | 'hotkeys.esc' | 'hotkeys.r' | 'hotkeys.s' | 'hotkeys.t' | 'hotkeys.g' | 'hotkeys.1' | 'hotkeys.2' | 'hotkeys.3' | 'hotkeys.h' }[] = [
    { key: 'Space', labelKey: 'hotkeys.space' },
    { key: 'Esc', labelKey: 'hotkeys.esc' },
    { key: 'R', labelKey: 'hotkeys.r' },
    { key: 'S', labelKey: 'hotkeys.s' },
    { key: 'T', labelKey: 'hotkeys.t' },
    { key: 'G', labelKey: 'hotkeys.g' },
    { key: '1', labelKey: 'hotkeys.1' },
    { key: '2', labelKey: 'hotkeys.2' },
    { key: '3', labelKey: 'hotkeys.3' },
    { key: 'H', labelKey: 'hotkeys.h' },
  ];

  close(): void {
    this.ui.setHotkeysHelpOpen(false);
  }
}
