import { Injectable, signal } from '@angular/core';
import { ZOOM_MAX, ZOOM_MIN } from '../core/constants/render.constants';
import { WorldConfig } from '../core/models/world-config.model';
import { clamp } from '../domain/math/clamp';

@Injectable({ providedIn: 'root' })
export class CameraStore {
  readonly offsetX = signal(0);
  readonly offsetY = signal(0);
  readonly zoom = signal(1);
  readonly followEnabled = signal(false);
  readonly focusAgentId = signal<string | null>(null);
  readonly viewWidth = signal(800);
  readonly viewHeight = signal(600);

  setViewSize(width: number, height: number): void {
    this.viewWidth.set(Math.max(1, width));
    this.viewHeight.set(Math.max(1, height));
  }

  panBy(dxWorld: number, dyWorld: number): void {
    this.offsetX.update((x) => x + dxWorld);
    this.offsetY.update((y) => y + dyWorld);
  }

  setOffset(x: number, y: number): void {
    this.offsetX.set(x);
    this.offsetY.set(y);
  }

  zoomAt(screenX: number, screenY: number, factor: number): void {
    const oldZoom = this.zoom();
    const nextZoom = clamp(oldZoom * factor, ZOOM_MIN, ZOOM_MAX);
    if (Math.abs(nextZoom - oldZoom) < 1e-9) {
      return;
    }

    const worldX = this.offsetX() + screenX / oldZoom;
    const worldY = this.offsetY() + screenY / oldZoom;
    this.zoom.set(nextZoom);
    this.offsetX.set(worldX - screenX / nextZoom);
    this.offsetY.set(worldY - screenY / nextZoom);
  }

  enableFollow(id: string): void {
    this.followEnabled.set(true);
    this.focusAgentId.set(id);
  }

  disableFollow(): void {
    this.followEnabled.set(false);
    this.focusAgentId.set(null);
  }

  centerOn(worldX: number, worldY: number): void {
    const z = this.zoom();
    this.offsetX.set(worldX - this.viewWidth() / z / 2);
    this.offsetY.set(worldY - this.viewHeight() / z / 2);
  }

  fitWorld(world: WorldConfig): void {
    const vw = this.viewWidth();
    const vh = this.viewHeight();
    const zoom = Math.min(vw / world.width, vh / world.height) * 0.96;
    this.zoom.set(clamp(zoom, ZOOM_MIN, ZOOM_MAX));
    this.offsetX.set((world.width - vw / this.zoom()) / 2);
    this.offsetY.set((world.height - vh / this.zoom()) / 2);
    this.disableFollow();
  }
}
