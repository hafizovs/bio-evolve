import { Vec2 } from './vec2.model';

export interface Plant {
  id: string;
  position: Vec2;
  energyValue: number;
  radius: number;
  alive: boolean;
}
