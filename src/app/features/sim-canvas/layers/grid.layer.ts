import {
  COLOR_GRID,
  COLOR_WORLD_BG,
  GRID_STEP_WU,
} from '../../../core/constants/render.constants';
import { CameraState } from '../../../core/models/camera-state.model';
import { WorldConfig } from '../../../core/models/world-config.model';
import { worldToScreen } from '../canvas-camera';

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  world: WorldConfig,
  camera: CameraState,
): void {
  ctx.save();
  ctx.strokeStyle = COLOR_GRID;
  ctx.lineWidth = 1;

  const startX = Math.floor(0 / GRID_STEP_WU) * GRID_STEP_WU;
  const startY = Math.floor(0 / GRID_STEP_WU) * GRID_STEP_WU;

  for (let x = startX; x <= world.width; x += GRID_STEP_WU) {
    const a = worldToScreen(x, 0, camera);
    const b = worldToScreen(x, world.height, camera);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  for (let y = startY; y <= world.height; y += GRID_STEP_WU) {
    const a = worldToScreen(0, y, camera);
    const b = worldToScreen(world.width, y, camera);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  ctx.restore();
  void COLOR_WORLD_BG;
}
