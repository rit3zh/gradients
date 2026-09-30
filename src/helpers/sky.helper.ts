import type { TSkyPreset } from '../interfaces';
import type { ISkyPreset } from '../interfaces/presets.interface';

function getSkyPreset<P extends TSkyPreset = 'clear'>(preset: P = 'clear' as P): ISkyPreset<P> {
  switch (preset as TSkyPreset) {
    case 'clear':
      return { preset, extinction: [0.1, 0.3, 0.6], tint: '#FFFFFF' };
    case 'overcast':
      return { preset, extinction: [0.18, 0.2, 0.28], tint: '#FFF2CC' };
    case 'dusk':
      return { preset, extinction: [0.1, 0.2, 0.8], tint: '#FFBF80' };
    case 'tropical':
      return { preset, extinction: [0.03, 0.2, 0.9], tint: '#FFFFFF' };
    case 'ember':
      return { preset, extinction: [0.4, 0.06, 0.01], tint: '#FFFFFF' };
    case 'verdant':
      return { preset, extinction: [0.1, 0.2, 0.01], tint: '#FFFFFF' };
  }
}

export { getSkyPreset };
