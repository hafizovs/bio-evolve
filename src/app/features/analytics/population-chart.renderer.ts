import {
  COLOR_PLANT,
  COLOR_PREDATOR,
  COLOR_PREY,
} from '../../core/constants/render.constants';
import { PopulationSample } from '../../core/models/population-sample.model';

export interface ChartSize {
  width: number;
  height: number;
}

export function drawPopulationChart(
  ctx: CanvasRenderingContext2D,
  series: readonly PopulationSample[],
  size: ChartSize,
): void {
  const { width, height } = size;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#0a121c';
  ctx.fillRect(0, 0, width, height);

  const pad = { l: 28, r: 8, t: 10, b: 18 };
  const plotW = Math.max(1, width - pad.l - pad.r);
  const plotH = Math.max(1, height - pad.t - pad.b);

  ctx.strokeStyle = 'rgba(61,214,198,0.12)';
  ctx.strokeRect(pad.l, pad.t, plotW, plotH);

  if (series.length < 2) {
    return;
  }

  let maxY = 1;
  for (const s of series) {
    maxY = Math.max(maxY, s.plants, s.prey, s.predators);
  }
  maxY *= 1.1;

  const xAt = (i: number) => pad.l + (i / (series.length - 1)) * plotW;
  const yAt = (v: number) => pad.t + plotH - (v / maxY) * plotH;

  const drawLine = (
    color: string,
    getter: (s: PopulationSample) => number,
  ): void => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    series.forEach((s, i) => {
      const x = xAt(i);
      const y = yAt(getter(s));
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  };

  drawLine(COLOR_PLANT, (s) => s.plants);
  drawLine(COLOR_PREY, (s) => s.prey);
  drawLine(COLOR_PREDATOR, (s) => s.predators);

  ctx.fillStyle = '#8aa0b8';
  ctx.font = '10px IBM Plex Mono, monospace';
  ctx.fillText(String(Math.round(maxY)), 2, pad.t + 8);
  ctx.fillText('0', 10, pad.t + plotH);
}
