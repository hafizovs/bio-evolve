export type RngFn = () => number;

let activeRng: RngFn = Math.random;

export function setRng(rng: RngFn): void {
  activeRng = rng;
}

export function resetRng(): void {
  activeRng = Math.random;
}

export function random(): number {
  return activeRng();
}

export function randomRange(min: number, max: number): number {
  return min + random() * (max - min);
}

export function createSeededRng(seed: number): RngFn {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function withSeededRng<T>(seed: number, fn: () => T): T {
  const previous = activeRng;
  activeRng = createSeededRng(seed);
  try {
    return fn();
  } finally {
    activeRng = previous;
  }
}
