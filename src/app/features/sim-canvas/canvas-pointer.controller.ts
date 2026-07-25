import { PICK_RADIUS_PX, ZOOM_WHEEL_SENSITIVITY } from '../../core/constants/render.constants';
import { Agent } from '../../core/models/agent.model';
import { CameraStore } from '../../state/camera.store';
import { SimulationStore } from '../../state/simulation.store';
import { screenToWorld } from './canvas-camera';

export class CanvasPointerController {
  private dragging = false;
  private moved = false;
  private lastX = 0;
  private lastY = 0;
  private pointerId: number | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly camera: CameraStore,
    private readonly simulation: SimulationStore,
  ) {}

  attach(): void {
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('pointercancel', this.onPointerUp);
    this.canvas.addEventListener('pointerleave', this.onPointerUp);
  }

  detach(): void {
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointercancel', this.onPointerUp);
    this.canvas.removeEventListener('pointerleave', this.onPointerUp);
  }

  private readonly onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const sx = event.clientX - rect.left;
    const sy = event.clientY - rect.top;
    const factor = Math.exp(-event.deltaY * ZOOM_WHEEL_SENSITIVITY);
    this.camera.zoomAt(sx, sy, factor);
  };

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) {
      return;
    }
    this.dragging = true;
    this.moved = false;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.pointerId = event.pointerId;
    this.canvas.setPointerCapture(event.pointerId);
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (!this.dragging || this.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - this.lastX;
    const dy = event.clientY - this.lastY;
    if (Math.hypot(dx, dy) > 2) {
      this.moved = true;
    }
    const zoom = this.camera.zoom();
    this.camera.panBy(-dx / zoom, -dy / zoom);
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (this.pointerId !== null && event.pointerId !== this.pointerId) {
      return;
    }
    const wasClick = this.dragging && !this.moved;
    this.dragging = false;
    this.pointerId = null;

    if (!wasClick) {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const sx = event.clientX - rect.left;
    const sy = event.clientY - rect.top;
    this.pick(sx, sy);
  };

  private pick(screenX: number, screenY: number): void {
    const camera = {
      offsetX: this.camera.offsetX(),
      offsetY: this.camera.offsetY(),
      zoom: this.camera.zoom(),
      followEnabled: this.camera.followEnabled(),
      focusAgentId: this.camera.focusAgentId(),
    };
    const world = screenToWorld(screenX, screenY, camera);
    const agents = this.simulation.agents();
    let best: Agent | null = null;
    let bestDist = Number.POSITIVE_INFINITY;

    for (const agent of agents) {
      if (!agent.alive) {
        continue;
      }
      const d = Math.hypot(
        agent.position.x - world.x,
        agent.position.y - world.y,
      );
      const screenDist = d * camera.zoom;
      if (screenDist <= PICK_RADIUS_PX && d < bestDist) {
        bestDist = d;
        best = agent;
      }
    }

    if (best) {
      this.simulation.selectAgent(best.id);
      this.camera.enableFollow(best.id);
    }
  }
}
