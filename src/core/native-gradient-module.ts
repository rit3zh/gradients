import { requireNativeModule } from 'expo';
import type { IGradientPerformanceReport } from '../interfaces/performance.interface';

interface INativeGradientModule {
  startProfiling(): void;
  stopProfiling(): IGradientPerformanceReport;
}

const NativeGradientModule = requireNativeModule<INativeGradientModule>('ExpoGradients');

export { NativeGradientModule };
