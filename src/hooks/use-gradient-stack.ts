import { useMemo, type ReactNode } from 'react';

import type { TNativeLayer } from '../interfaces/native.interface';
import type { IResolvedStack } from '../interfaces/resolve.interface';
import { toNativeFrames, type TLayerFrames } from '../utils/normalize/frames.util';
import { resolveStack } from '../utils/resolve/stack.util';

interface IResolvedStackFrames extends IResolvedStack {
  keyframes?: TNativeLayer[][];
}

function useGradientStack(children: ReactNode, keyframes?: TLayerFrames): IResolvedStackFrames {
  return useMemo(
    () => ({ ...resolveStack(children), keyframes: toNativeFrames(keyframes) }),
    [children, keyframes]
  );
}

export { useGradientStack };
