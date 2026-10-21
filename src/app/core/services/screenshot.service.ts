import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScreenshotService {
  private canvas: HTMLCanvasElement | null = null;

  setCanvas(canvas: HTMLCanvasElement | null): void {
    this.canvas = canvas;
  }

  capture(): void {
    const canvas = this.canvas;
    if (!canvas) {
      return;
    }

    const url = canvas.toDataURL('image/png');
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const stamp =
      `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
      `-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const filename = `bio-evolve-${stamp}.png`;

    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
  }
}
