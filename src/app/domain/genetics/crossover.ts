import { DnaGenes } from '../../core/models/dna-genes.model';
import { random } from '../math/rng';

const GENE_KEYS: (keyof DnaGenes)[] = [
  'visionRange',
  'maxSpeed',
  'maxEnergy',
  'metabolism',
  'reproductiveAge',
  'reproductionEnergyThreshold',
  'bodySize',
];

/**
 * Per-gene uniform blend: λ ~ U(0,1) for each gene independently.
 * CROSSOVER_BLEND is documented as mean / fallback reference (appendix B.4).
 */
export function crossover(a: DnaGenes, b: DnaGenes): DnaGenes {
  const out = {} as DnaGenes;
  for (const key of GENE_KEYS) {
    const lam = random();
    out[key] = (1 - lam) * a[key] + lam * b[key];
  }
  return out;
}
