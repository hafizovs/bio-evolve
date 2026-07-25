import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { MAX_DPR } from '../../core/constants/render.constants';
import { AnalyticsStore } from '../../state/analytics.store';
import { drawLvCompareChart } from './lv-compare-chart.renderer';

@Component({
  selector: 'bev-lv-compare-chart',
  standalone: true,
  templateUrl: './lv-compare-chart.component.html',
  styleUrl: './lv-compare-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LvCompareChartComponent {
  private readonly canvasRef =
    viewChild.required<ElementRef<HTMLCanvasElement>>('chart');
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly analytics = inject(AnalyticsStore);

  private cssW = 0;
  private cssH = 0;

  constructor() {
    afterNextRender(() => {
      const ro = new ResizeObserver(() => this.resize());
      ro.observe(this.host.nativeElement);
      this.resize();
      this.destroyRef.onDestroy(() => ro.disconnect());
    });

    effect(() => {
      const series = this.analytics.lvHistory();
      this.redraw(series);
    });
  }

  private resize(): void {
    const canvas = this.canvasRef().nativeElement;
    const rect = this.host.nativeElement.getBoundingClientRect();
    this.cssW = Math.max(1, rect.width);
    this.cssH = Math.max(120, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.floor(this.cssW * dpr);
    canvas.height = Math.floor(this.cssH * dpr);
    canvas.style.width = `${this.cssW}px`;
    canvas.style.height = `${this.cssH}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    this.redraw(this.analytics.lvHistory());
  }

  private redraw(series: ReturnType<AnalyticsStore['lvHistory']>): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas || this.cssW <= 0) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    drawLvCompareChart(ctx, series, { width: this.cssW, height: this.cssH });
  }
}
