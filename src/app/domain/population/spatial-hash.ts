import { SPATIAL_CELL_SIZE } from '../../core/constants/simulation.constants';

export type SpatialKind = 'plant' | 'prey' | 'predator';

export interface SpatialEntry {
  id: string;
  x: number;
  y: number;
  kind: SpatialKind;
}

export class SpatialHash {
  private readonly cellSize: number;
  private readonly cells = new Map<string, SpatialEntry[]>();

  constructor(cellSize = SPATIAL_CELL_SIZE) {
    this.cellSize = cellSize;
  }

  clear(): void {
    this.cells.clear();
  }

  private key(cx: number, cy: number): string {
    return `${cx},${cy}`;
  }

  private cellCoords(x: number, y: number): { cx: number; cy: number } {
    return {
      cx: Math.floor(x / this.cellSize),
      cy: Math.floor(y / this.cellSize),
    };
  }

  insert(id: string, x: number, y: number, kind: SpatialKind): void {
    const { cx, cy } = this.cellCoords(x, y);
    const key = this.key(cx, cy);
    let bucket = this.cells.get(key);
    if (!bucket) {
      bucket = [];
      this.cells.set(key, bucket);
    }
    bucket.push({ id, x, y, kind });
  }

  queryRadius(x: number, y: number, radius: number): SpatialEntry[] {
    const minCx = Math.floor((x - radius) / this.cellSize);
    const maxCx = Math.floor((x + radius) / this.cellSize);
    const minCy = Math.floor((y - radius) / this.cellSize);
    const maxCy = Math.floor((y + radius) / this.cellSize);
    const result: SpatialEntry[] = [];

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const bucket = this.cells.get(this.key(cx, cy));
        if (!bucket) {
          continue;
        }
        for (const entry of bucket) {
          result.push(entry);
        }
      }
    }
    return result;
  }
}
