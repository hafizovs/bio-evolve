import { COLOR_SELECTION } from '../../../core/constants/render.constants';
import { Agent } from '../../../core/models/agent.model';
import { CameraState } from '../../../core/models/camera-state.model';
import {
  MAX_AGENT_SCREEN_RADIUS_PX,
  MIN_AGENT_SCREEN_RADIUS_PX,
} from '../../../core/constants/render.constants';
import { clamp } from '../../../domain/math/clamp';
import { worldToScreen } from '../canvas-camera';

export function drawSelection(
  ctx: CanvasRenderingContext2D,
  agents: readonly Agent[],
  selectedAgentId: string | null,
  camera: CameraState,
): void {
  if (!selectedAgentId) {
    return;
  }
  const agent = agents.find((a) => a.id === selectedAgentId && a.alive);
  if (!agent) {
    return;
  }

  const p = worldToScreen(agent.position.x, agent.position.y, camera);
  const r = clamp(
    agent.genes.bodySize * camera.zoom,
    MIN_AGENT_SCREEN_RADIUS_PX,
    MAX_AGENT_SCREEN_RADIUS_PX,
  );

  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = COLOR_SELECTION;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = 'rgba(61, 214, 198, 0.45)';
  ctx.shadowBlur = 8;
  ctx.arc(p.x, p.y, r + 3, 0, Math.PI * 2);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(61, 214, 198, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.arc(p.x, p.y, agent.genes.visionRange * camera.zoom, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
