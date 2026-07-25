import {
  COLOR_PANIC,
  COLOR_PREDATOR,
  COLOR_PREY,
  DIRECTION_VECTOR_LENGTH_PX,
  MAX_AGENT_SCREEN_RADIUS_PX,
  MIN_AGENT_SCREEN_RADIUS_PX,
} from '../../../core/constants/render.constants';
import { Agent } from '../../../core/models/agent.model';
import { CameraState } from '../../../core/models/camera-state.model';
import { clamp } from '../../../domain/math/clamp';
import { worldToScreen } from '../canvas-camera';

export function drawAgents(
  ctx: CanvasRenderingContext2D,
  agents: readonly Agent[],
  camera: CameraState,
): void {
  ctx.save();
  for (const agent of agents) {
    if (!agent.alive) {
      continue;
    }
    const p = worldToScreen(agent.position.x, agent.position.y, camera);
    const r = clamp(
      agent.genes.bodySize * camera.zoom,
      MIN_AGENT_SCREEN_RADIUS_PX,
      MAX_AGENT_SCREEN_RADIUS_PX,
    );

    let fill = agent.kind === 'prey' ? COLOR_PREY : COLOR_PREDATOR;
    if (agent.kind === 'prey' && agent.fsmState === 'panic') {
      fill = COLOR_PANIC;
    }

    ctx.beginPath();
    ctx.fillStyle = fill;
    ctx.globalAlpha = 1;
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const dx = Math.cos(agent.heading) * DIRECTION_VECTOR_LENGTH_PX;
    const dy = Math.sin(agent.heading) * DIRECTION_VECTOR_LENGTH_PX;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + dx, p.y + dy);
    ctx.stroke();
  }
  ctx.restore();
}
