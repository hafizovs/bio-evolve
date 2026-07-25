import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../../services/i18n.service';
import { SimulationStore } from '../../state/simulation.store';

@Component({
  selector: 'bev-status-bar',
  standalone: true,
  templateUrl: './status-bar.component.html',
  styleUrl: './status-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBarComponent {
  readonly simulation = inject(SimulationStore);
  readonly i18n = inject(I18nService);
}
