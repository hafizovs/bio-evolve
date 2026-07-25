import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../../services/i18n.service';
import { SimulationStore } from '../../state/simulation.store';
import { GeneStatsViewComponent } from './gene-stats-view.component';
import { LvCompareChartComponent } from './lv-compare-chart.component';
import { PopulationChartComponent } from './population-chart.component';

@Component({
  selector: 'bev-analytics-panel',
  standalone: true,
  imports: [
    PopulationChartComponent,
    GeneStatsViewComponent,
    LvCompareChartComponent,
  ],
  templateUrl: './analytics-panel.component.html',
  styleUrl: './analytics-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsPanelComponent {
  readonly i18n = inject(I18nService);
  readonly simulation = inject(SimulationStore);
}
