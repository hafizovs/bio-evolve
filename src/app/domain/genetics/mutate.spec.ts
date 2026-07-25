import { describe, expect, it } from 'vitest';
import { DnaGenes } from '../../core/models/dna-genes.model';
import { withSeededRng } from '../math/rng';
import { PREY_GENE_RANGES } from './gene-ranges';
import { mutate } from './mutate';

const baseGenes: DnaGenes = {
  visionRange: 90,
  maxSpeed: 60,
  maxEnergy: 110,
  metabolism: 2.8,
  reproductiveAge: 10,
  reproductionEnergyThreshold: 70,
  bodySize: 6,
};

describe('mutate', () => {
  it('returns identical genes when mutationRate is 0', () => {
    const result = withSeededRng(1, () =>
      mutate(baseGenes, 0, 0.12, 'prey'),
    );
    expect(result).toEqual(baseGenes);
  });

  it('can change at least one gene when rate=1 and strength>0', () => {
    const result = withSeededRng(99, () =>
      mutate(baseGenes, 1, 0.12, 'prey'),
    );
    const changed =
      result.visionRange !== baseGenes.visionRange ||
      result.maxSpeed !== baseGenes.maxSpeed ||
      result.maxEnergy !== baseGenes.maxEnergy ||
      result.metabolism !== baseGenes.metabolism ||
      result.reproductiveAge !== baseGenes.reproductiveAge ||
      result.reproductionEnergyThreshold !==
        baseGenes.reproductionEnergyThreshold ||
      result.bodySize !== baseGenes.bodySize;
    expect(changed).toBe(true);
  });

  it('clamps mutated genes to prey ranges', () => {
    const extreme: DnaGenes = {
      ...baseGenes,
      visionRange: PREY_GENE_RANGES.visionRange.max,
      maxSpeed: PREY_GENE_RANGES.maxSpeed.min,
    };
    const result = withSeededRng(3, () => mutate(extreme, 1, 0.5, 'prey'));
    expect(result.visionRange).toBeGreaterThanOrEqual(
      PREY_GENE_RANGES.visionRange.min,
    );
    expect(result.visionRange).toBeLessThanOrEqual(
      PREY_GENE_RANGES.visionRange.max,
    );
    expect(result.maxSpeed).toBeGreaterThanOrEqual(PREY_GENE_RANGES.maxSpeed.min);
    expect(result.maxSpeed).toBeLessThanOrEqual(PREY_GENE_RANGES.maxSpeed.max);
  });
});
