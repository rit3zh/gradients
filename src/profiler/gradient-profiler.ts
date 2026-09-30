import { NativeGradientModule } from '../core/native-gradient-module';
import type { IGradientPerformanceReport } from '../interfaces/performance.interface';

let active = false;

function start(): void {
  NativeGradientModule.startProfiling();
  active = true;
}

function stop(): IGradientPerformanceReport {
  active = false;
  return NativeGradientModule.stopProfiling();
}

function isActive(): boolean {
  return active;
}

async function measure(duration: number): Promise<IGradientPerformanceReport> {
  start();
  await new Promise<void>((resolve) => setTimeout(resolve, Math.max(duration, 0)));
  return stop();
}

const GradientProfiler = { start, stop, isActive, measure };

export { GradientProfiler };
