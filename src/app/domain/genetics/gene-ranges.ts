import { DnaGenes } from '../../core/models/dna-genes.model';
import { AgentKind } from '../../core/models/agent-kind.model';

export interface GeneRange {
  min: number;
  max: number;
}

export type GeneRanges = Record<keyof DnaGenes, GeneRange>;

export const PREY_GENE_RANGES: GeneRanges = {
  visionRange: { min: 40, max: 160 },
  maxSpeed: { min: 35, max: 110 },
  maxEnergy: { min: 80, max: 160 },
  metabolism: { min: 1.5, max: 5.0 },
  reproductiveAge: { min: 6, max: 20 },
  reproductionEnergyThreshold: { min: 45, max: 100 },
  bodySize: { min: 4, max: 9 },
};

export const PREDATOR_GENE_RANGES: GeneRanges = {
  visionRange: { min: 50, max: 200 },
  maxSpeed: { min: 40, max: 130 },
  maxEnergy: { min: 100, max: 200 },
  metabolism: { min: 2.0, max: 6.5 },
  reproductiveAge: { min: 8, max: 24 },
  reproductionEnergyThreshold: { min: 55, max: 120 },
  bodySize: { min: 6, max: 12 },
};

export function geneRangesFor(kind: AgentKind): GeneRanges {
  return kind === 'prey' ? PREY_GENE_RANGES : PREDATOR_GENE_RANGES;
}
