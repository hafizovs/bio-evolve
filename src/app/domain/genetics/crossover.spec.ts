import { describe, expect, it } from 'vitest';
import { DnaGenes } from '../../core/models/dna-genes.model';
import { withSeededRng } from '../math/rng';
import { crossover } from './crossover';
import { PREY_GENE_RANGES } from './gene-ranges';

function sampleGenes(a: number, b: number): DnaGenes {
  return {
    visionRange: a,
    maxSpeed: b,
    maxEnergy: 100,
    metabolism: 3,
    reproductiveAge: 10,
    reproductionEnergyThreshold: 70,
    bodySize: 6,
  };
}

describe('crossover', () => {
  it('produces genes within parent extremes for each blended gene', () => {
    const parentA = sampleGenes(40, 35);
    const parentB = sampleGenes(160, 110);

    const child = withSeededRng(42, () => crossover(parentA, parentB));

    expect(child.visionRange).toBeGreaterThanOrEqual(
      Math.min(parentA.visionRange, parentB.visionRange),
    );
    expect(child.visionRange).toBeLessThanOrEqual(
      Math.max(parentA.visionRange, parentB.visionRange),
    );
    expect(child.maxSpeed).toBeGreaterThanOrEqual(
      Math.min(parentA.maxSpeed, parentB.maxSpeed),
    );
    expect(child.maxSpeed).toBeLessThanOrEqual(
      Math.max(parentA.maxSpeed, parentB.maxSpeed),
    );
  });

  it('keeps child genes inside prey ranges when parents are in range', () => {
    const parentA = sampleGenes(50, 40);
    const parentB = sampleGenes(120, 90);
    const child = withSeededRng(7, () => crossover(parentA, parentB));

    expect(child.visionRange).toBeGreaterThanOrEqual(PREY_GENE_RANGES.visionRange.min);
    expect(child.visionRange).toBeLessThanOrEqual(PREY_GENE_RANGES.visionRange.max);
    expect(child.maxSpeed).toBeGreaterThanOrEqual(PREY_GENE_RANGES.maxSpeed.min);
    expect(child.maxSpeed).toBeLessThanOrEqual(PREY_GENE_RANGES.maxSpeed.max);
  });
});
