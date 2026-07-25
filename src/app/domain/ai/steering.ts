import { Vec2 } from '../../core/models/vec2.model';
import { random } from '../math/rng';
import { WANDER_STRENGTH } from '../../core/constants/ecology.constants';

export function vecLength(v: Vec2): number {
  return Math.hypot(v.x, v.y);
}

export function normalize(v: Vec2): Vec2 {
  const len = vecLength(v);
  if (len < 1e-8) {
    return { x: 0, y: 0 };
  }
  return { x: v.x / len, y: v.y / len };
}

export function seek(from: Vec2, to: Vec2): Vec2 {
  return normalize({ x: to.x - from.x, y: to.y - from.y });
}

export function flee(from: Vec2, threat: Vec2): Vec2 {
  return normalize({ x: from.x - threat.x, y: from.y - threat.y });
}

export function wander(heading: number, wanderStrength = WANDER_STRENGTH): Vec2 {
  const base: Vec2 = { x: Math.cos(heading), y: Math.sin(heading) };
  const angle = random() * Math.PI * 2;
  const jitter: Vec2 = {
    x: Math.cos(angle) * wanderStrength,
    y: Math.sin(angle) * wanderStrength,
  };
  return normalize({ x: base.x + jitter.x, y: base.y + jitter.y });
}

export function scale(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s };
}
