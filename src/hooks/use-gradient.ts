import { useMemo } from 'react';

import type { TGradientType } from '../interfaces';
import type { IResolvedGradient } from '../interfaces/resolve.interface';
import { resolveGradient } from '../utils/resolve/gradient.util';

function useGradient<P extends object, T extends TGradientType = TGradientType>(
  props: P,
  fallbackType?: T
): IResolvedGradient {
  return useMemo<IResolvedGradient<Record<string, unknown>>>(
    () => resolveGradient<P, T>(props, fallbackType),
    [props, fallbackType]
  );
}

export { useGradient };
