type TPerformancePlatform = 'ios' | 'android';

interface IPerformanceSummary {
  mean: number;
  p50: number;
  p95: number;
  max: number;
  samples: number;
}

interface IGradientPerformanceReport {
  platform: TPerformancePlatform;
  device: string;
  gpuName: string;
  simulator: boolean;
  duration: number;
  frames: number;
  renders: number;
  views: number;
  fps: number;
  droppedFrames: number;
  cpu: IPerformanceSummary;
  gpu: IPerformanceSummary | null;
  gpuUtilization: number | null;
  processCpu: number;
  memory: number;
}

export type { TPerformancePlatform, IPerformanceSummary, IGradientPerformanceReport };
