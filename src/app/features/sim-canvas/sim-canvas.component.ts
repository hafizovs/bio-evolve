import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { MAX_DPR } from '../../core/constants/render.constants';
import { RenderLoopService } from '../../services/render-loop.service';
import { ScreenshotService } from '../../services/screenshot.service';
import { CameraStore } from '../../state/camera.store';
import { SimulationStore } from '../../state/simulation.store';
import { CanvasPointerController } from './canvas-pointer.controller';
import { CanvasRenderer } from './canvas-renderer';

@Component({
  selector: 'bev-sim-canvas',
  standalone: true,
  templateUrl: './sim-canvas.component.html',
  styleUrl: './sim-canvas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimCanvasComponent {
  private readonly sceneRef = viewChild.required<ElementRef<HTMLCanvasElement>>('scene');
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly renderLoop = inject(RenderLoopService);
  private readonly screenshot = inject(ScreenshotService);
  private readonly camera = inject(CameraStore);
  private readonly simulation = inject(SimulationStore);

  private pointer: CanvasPointerController | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private readonly renderer = new CanvasRenderer();
  private fittedOnce = false;

  constructor() {
    afterNextRender(() => {
      const canvas = this.sceneRef().nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }

      this.screenshot.setCanvas(canvas);
      this.renderLoop.attach(canvas, ctx, this.renderer);
      this.pointer = new CanvasPointerController(
        canvas,
        this.camera,
        this.simulation,
      );
      this.pointer.attach();

      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.host.nativeElement);
      this.resize();
      this.renderLoop.start();

      this.destroyRef.onDestroy(() => {
        this.renderLoop.stop();
        this.pointer?.detach();
        this.resizeObserver?.disconnect();
        this.screenshot.setCanvas(null);
      });
    });
  }

  private resize(): void {
    const canvas = this.sceneRef().nativeElement;
    const hostEl = this.host.nativeElement;
    const cssWidth = Math.max(1, hostEl.clientWidth);
    const cssHeight = Math.max(1, hostEl.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    this.renderLoop.setViewport(cssWidth, cssHeight, dpr);

    if (!this.fittedOnce) {
      this.camera.fitWorld(this.simulation.world());
      this.fittedOnce = true;
    }
  }
}
