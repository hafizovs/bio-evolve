export interface KindGeneAverages {
  count: number;
  avgVisionRange: number;
  avgMaxSpeed: number;
  avgMetabolism: number;
  avgBodySize: number;
  avgGeneration: number;
}

export interface GeneStatsSnapshot {
  prey: KindGeneAverages;
  predators: KindGeneAverages;
}
