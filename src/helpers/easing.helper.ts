import type { TEasing, TEasingName } from '../interfaces';
import type { TBezier } from '../interfaces/presets.interface';

function getEasing<N extends TEasingName>(name: N): TBezier {
  switch (name as TEasingName) {
    case 'linear':
      return [0, 0, 1, 1];
    case 'ease':
      return [0.25, 0.1, 0.25, 1];
    case 'easeIn':
      return [0.42, 0, 1, 1];
    case 'easeOut':
      return [0, 0, 0.58, 1];
    case 'easeInOut':
      return [0.42, 0, 0.58, 1];
    case 'smooth':
      return [0.65, 0, 0.35, 1];
  }
}

function toBezier(easing: TEasing): number[] {
  return typeof easing === 'string' ? [...getEasing(easing)] : [...easing];
}

export { getEasing, toBezier };
