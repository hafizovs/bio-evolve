import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AgentFsmState } from '../../core/models/agent-fsm-state.model';
import { I18nKey } from '../../core/i18n/i18n.keys';
import { I18nService } from '../../core/services/i18n.service';
import { SimulationStore } from '../sim-canvas/simulation.store';

@Component({
  selector: 'bev-genetic-passport',
  standalone: true,
  templateUrl: './genetic-passport.component.html',
  styleUrl: './genetic-passport.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneticPassportComponent {
  readonly simulation = inject(SimulationStore);
  readonly i18n = inject(I18nService);

  readonly agent = this.simulation.selectedAgent;

  readonly energyRatio = computed(() => {
    const a = this.agent();
    if (!a) {
      return 0;
    }
    return a.energy / a.genes.maxEnergy;
  });

  kindLabel(kind: 'prey' | 'predator'): string {
    return this.i18n.t(kind === 'prey' ? 'kind.prey' : 'kind.predator');
  }

  fsmLabel(state: AgentFsmState): string {
    return this.i18n.t(`fsm.${state}` as I18nKey);
  }

  fmt(n: number, digits = 2): string {
    return n.toFixed(digits);
  }

  parentsLabel(parentIds: [string | null, string | null]): string {
    const [a, b] = parentIds;
    if (!a && !b) {
      return this.i18n.t('analytics.na');
    }
    return `${a ?? this.i18n.t('analytics.na')} / ${b ?? this.i18n.t('analytics.na')}`;
  }
}
