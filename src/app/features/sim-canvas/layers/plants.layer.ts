import { COLOR_PLANT } from '../../../core/constants/render.constants';
import { CameraState } from '../../../core/models/camera-state.model';
import { Plant } from '../../../core/models/plant.model';
import { worldToScreen } from '../canvas-camera';

export function drawPlants(
  ctx: CanvasRenderingContext2D,
  plants: readonly Plant[],
  camera: CameraState,
): void {
  ctx.save();
  for (const plant of plants) {
    if (!plant.alive) {
      continue;
    }
    const p = worldToScreen(plant.position.x, plant.position.y, camera);
    const r = Math.max(2, plant.radius * camera.zoom);
    ctx.beginPath();
    ctx.fillStyle = COLOR_PLANT;
    ctx.globalAlpha = 0.85;
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
