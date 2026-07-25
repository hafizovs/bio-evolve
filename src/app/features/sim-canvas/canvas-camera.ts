import { CameraState } from '../../core/models/camera-state.model';
import { Vec2 } from '../../core/models/vec2.model';

export function worldToScreen(
  worldX: number,
  worldY: number,
  camera: CameraState,
): Vec2 {
  return {
    x: (worldX - camera.offsetX) * camera.zoom,
    y: (worldY - camera.offsetY) * camera.zoom,
  };
}

export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: CameraState,
): Vec2 {
  return {
    x: camera.offsetX + screenX / camera.zoom,
    y: camera.offsetY + screenY / camera.zoom,
  };
}
