import { DnaGenes } from '../../core/models/dna-genes.model';
import { AgentKind } from '../../core/models/agent-kind.model';
import { randomRange } from '../math/rng';
import { geneRangesFor } from './gene-ranges';

export function createRandomGenes(kind: AgentKind): DnaGenes {
  const ranges = geneRangesFor(kind);
  return {
    visionRange: randomRange(ranges.visionRange.min, ranges.visionRange.max),
    maxSpeed: randomRange(ranges.maxSpeed.min, ranges.maxSpeed.max),
    maxEnergy: randomRange(ranges.maxEnergy.min, ranges.maxEnergy.max),
    metabolism: randomRange(ranges.metabolism.min, ranges.metabolism.max),
    reproductiveAge: randomRange(
      ranges.reproductiveAge.min,
      ranges.reproductiveAge.max,
    ),
    reproductionEnergyThreshold: randomRange(
      ranges.reproductionEnergyThreshold.min,
      ranges.reproductionEnergyThreshold.max,
    ),
    bodySize: randomRange(ranges.bodySize.min, ranges.bodySize.max),
  };
}
