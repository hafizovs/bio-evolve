import { inject, Injectable } from '@angular/core';
import { DT_CLAMP_SECONDS } from '../constants/simulation.constants';
import { SimRenderSnapshot } from '../models/sim-render-snapshot.model';
import { CanvasRenderer } from '../../features/sim-canvas/canvas-renderer';
import { CameraStore } from '../../features/sim-canvas/camera.store';
import { SimulationStore } from '../../features/sim-canvas/simulation.store';
import { SimulationEngineService } from '../../features/sim-canvas/simulation-engine.service';

@Injectable({ providedIn: 'root' })
export class RenderLoopService {
  private readonly simulation = inject(SimulationStore);
  private readonly camera = inject(CameraStore);
  private readonly engine = inject(SimulationEngineService);

  private rafId: number | null = null;
  private lastTs = 0;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private renderer: CanvasRenderer | null = null;
  private cssWidth = 0;
  private cssHeight = 0;
  private dpr = 1;

  attach(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    renderer: CanvasRenderer,
  ): void {
    this.canvas = canvas;
    this.ctx = ctx;
    this.renderer = renderer;
  }

  setViewport(cssWidth: number, cssHeight: number, dpr: number): void {
    this.cssWidth = cssWidth;
    this.cssHeight = cssHeight;
    this.dpr = dpr;
    this.camera.setViewSize(cssWidth, cssHeight);
  }

  start(): void {
    this.engine.ensureInitialized();
    this.lastTs = performance.now();
    const loop = (now: number): void => {
      const rawDt = (now - this.lastTs) / 1000;
      this.lastTs = now;
      const dt = Math.min(rawDt, DT_CLAMP_SECONDS);

      if (this.simulation.isPlaying()) {
        this.engine.step(dt);
      }

      if (this.camera.followEnabled()) {
        const id = this.camera.focusAgentId();
        const agent = this.simulation
          .agents()
          .find((a) => a.id === id && a.alive);
        if (agent) {
          this.camera.centerOn(agent.position.x, agent.position.y);
        } else {
          this.camera.disableFollow();
          this.simulation.clearSelection();
        }
      }

      if (this.ctx && this.renderer) {
        const snapshot: SimRenderSnapshot = {
          world: this.simulation.world(),
          plants: this.simulation.plants(),
          agents: this.simulation.agents(),
          selectedAgentId: this.simulation.selectedAgentId(),
          tick: this.simulation.tick(),
          simulationTime: this.simulation.simulationTime(),
          isPlaying: this.simulation.isPlaying(),
        };
        this.renderer.draw(
          this.ctx,
          snapshot,
          {
            offsetX: this.camera.offsetX(),
            offsetY: this.camera.offsetY(),
            zoom: this.camera.zoom(),
            followEnabled: this.camera.followEnabled(),
            focusAgentId: this.camera.focusAgentId(),
          },
          this.cssWidth,
          this.cssHeight,
          this.dpr,
        );
      }

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
