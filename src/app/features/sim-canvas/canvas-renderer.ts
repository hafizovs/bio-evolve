import { COLOR_WORLD_BG } from '../../core/constants/render.constants';
import { CameraState } from '../../core/models/camera-state.model';
import { SimRenderSnapshot } from '../../core/models/sim-render-snapshot.model';
import { drawAgents } from './layers/agents.layer';
import { drawGrid } from './layers/grid.layer';
import { drawPlants } from './layers/plants.layer';
import { drawSelection } from './layers/selection.layer';

export class CanvasRenderer {
  draw(
    ctx: CanvasRenderingContext2D,
    snapshot: SimRenderSnapshot,
    camera: CameraState,
    cssWidth: number,
    cssHeight: number,
    _dpr: number,
  ): void {
    void _dpr;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();

    // Drawing in CSS pixel space (transform set by host to dpr).
    ctx.fillStyle = COLOR_WORLD_BG;
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    drawGrid(ctx, snapshot.world, camera);
    drawPlants(ctx, snapshot.plants, camera);
    drawAgents(ctx, snapshot.agents, camera);
    drawSelection(ctx, snapshot.agents, snapshot.selectedAgentId, camera);
  }
}
