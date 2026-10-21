import { Injectable, signal } from '@angular/core';
import { HISTORY_MAX_SAMPLES } from '../../core/constants/simulation.constants';
import { Agent } from '../../core/models/agent.model';
import { GeneStatsSnapshot } from '../../core/models/gene-stats.model';
import { LotkaVolterraSample } from '../../core/models/lotka-volterra.model';
import { PopulationSample } from '../../core/models/population-sample.model';
import { computeGeneStats } from '../../domain/genetics/gene-stats';

function emptyGeneStats(): GeneStatsSnapshot {
  return {
    prey: {
      count: 0,
      avgVisionRange: 0,
      avgMaxSpeed: 0,
      avgMetabolism: 0,
      avgBodySize: 0,
      avgGeneration: 0,
    },
    predators: {
      count: 0,
      avgVisionRange: 0,
      avgMaxSpeed: 0,
      avgMetabolism: 0,
      avgBodySize: 0,
      avgGeneration: 0,
    },
  };
}

@Injectable({ providedIn: 'root' })
export class AnalyticsStore {
  readonly populationHistory = signal<PopulationSample[]>([]);
  readonly lvHistory = signal<LotkaVolterraSample[]>([]);
  readonly geneStats = signal<GeneStatsSnapshot>(emptyGeneStats());

  pushSample(
    population: PopulationSample,
    lv: LotkaVolterraSample,
  ): void {
    this.populationHistory.update((hist) => {
      const next = [...hist, population];
      if (next.length > HISTORY_MAX_SAMPLES) {
        next.splice(0, next.length - HISTORY_MAX_SAMPLES);
      }
      return next;
    });
    this.lvHistory.update((hist) => {
      const next = [...hist, lv];
      if (next.length > HISTORY_MAX_SAMPLES) {
        next.splice(0, next.length - HISTORY_MAX_SAMPLES);
      }
      return next;
    });
  }

  recomputeGeneStats(agents: readonly Agent[]): void {
    this.geneStats.set(computeGeneStats(agents));
  }

  clear(): void {
    this.populationHistory.set([]);
    this.lvHistory.set([]);
    this.geneStats.set(emptyGeneStats());
  }
}
