/**
 * Agent genome. Continuous gene values within appendix A ranges.
 */
export interface DnaGenes {
  /** Vision radius, world units */
  visionRange: number;
  /** Maximum speed, wu/s */
  maxSpeed: number;
  /** Maximum energy capacity */
  maxEnergy: number;
  /** Base energy drain per second (rest metabolism) */
  metabolism: number;
  /** Age (sim-seconds) from which reproduction is allowed */
  reproductiveAge: number;
  /** Energy threshold to enter seekMate */
  reproductionEnergyThreshold: number;
  /** Body size — collisions, capacity, and rendering */
  bodySize: number;
}
