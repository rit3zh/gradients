import { toBezier } from '../../helpers/easing.helper';
import type { TGradientTransition } from '../../interfaces';
import type { TNativeTransition } from '../../interfaces/native.interface';
import { compact } from '../props/compact.util';

function toNativeTransition<T extends boolean>(
  transition?: T | TGradientTransition
): TNativeTransition | null {
  if (!transition) {
    return null;
  }
  if (transition === true) {
    return { type: 'timing', duration: 600, easing: toBezier('easeInOut') };
  }
  if (transition.type === 'spring') {
    return compact({
      type: 'spring' as const,
      damping: transition.damping,
      stiffness: transition.stiffness,
      mass: transition.mass,
      delay: transition.delay,
    });
  }
  return compact({
    type: 'timing' as const,
    duration: transition.duration ?? 600,
    delay: transition.delay,
    easing: toBezier(transition.easing ?? 'easeInOut'),
  });
}

export { toNativeTransition };
