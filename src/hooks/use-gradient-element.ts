import { useMemo } from 'react';

import type { TGradientElement, TGradientType } from '../interfaces';
import type { IResolvedElement } from '../interfaces/resolve.interface';
import { resolveGradientElement } from '../utils/resolve/element.util';

function useGradientElement<T extends TGradientType = TGradientType>(
  element: TGradientElement<T>
): IResolvedElement {
  return useMemo(() => resolveGradientElement<T>(element), [element]);
}

export { useGradientElement };
