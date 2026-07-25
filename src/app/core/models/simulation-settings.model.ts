export interface SimulationSettings {
  /** 0..1 */
  mutationRate: number;
  /** 0..1 — amplifies metabolism cost / selection (appendix B) */
  selectionPressure: number;
  /** dt multiplier for simulation speed */
  simSpeed: number;
}
