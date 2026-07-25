import { DnaGenes } from '../../core/models/dna-genes.model';
import { AgentKind } from '../../core/models/agent-kind.model';
import { clamp } from '../math/clamp';
import { random } from '../math/rng';
import { geneRangesFor } from './gene-ranges';

const GENE_KEYS: (keyof DnaGenes)[] = [
  'visionRange',
  'maxSpeed',
  'maxEnergy',
  'metabolism',
  'reproductiveAge',
  'reproductionEnergyThreshold',
  'bodySize',
];

export function mutate(
  genes: DnaGenes,
  mutationRate: number,
  strength: number,
  kind: AgentKind,
): DnaGenes {
  const ranges = geneRangesFor(kind);
  const out = { ...genes };

  for (const key of GENE_KEYS) {
    if (random() < mutationRate) {
      const delta = out[key] * strength * (2 * random() - 1);
      out[key] = out[key] + delta;
    }
    const range = ranges[key];
    out[key] = clamp(out[key], range.min, range.max);
  }

  return out;
}
