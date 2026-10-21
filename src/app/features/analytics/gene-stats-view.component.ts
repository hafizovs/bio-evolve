import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KindGeneAverages } from '../../core/models/gene-stats.model';
import { I18nService } from '../../core/services/i18n.service';
import { AnalyticsStore } from './analytics.store';

@Component({
  selector: 'bev-gene-stats-view',
  standalone: true,
  templateUrl: './gene-stats-view.component.html',
  styleUrl: './gene-stats-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneStatsViewComponent {
  readonly analytics = inject(AnalyticsStore);
  readonly i18n = inject(I18nService);

  fmt(stats: KindGeneAverages, field: keyof Omit<KindGeneAverages, 'count'>): string {
    if (stats.count === 0) {
      return this.i18n.t('analytics.na');
    }
    return stats[field].toFixed(2);
  }
}
