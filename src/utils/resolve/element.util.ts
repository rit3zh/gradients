import type { ReactNode } from 'react';

import { resolveGradient } from './gradient.util';
import { resolveStack } from './stack.util';
import type { TGradientElement, TGradientType } from '../../interfaces';
import type { IResolvedElement } from '../../interfaces/resolve.interface';
import { assertGradientElement, invariant } from '../assert/assert.util';
import { descriptorOf } from '../descriptor/gradient-descriptor.util';
import { toNativeFrames, type TLayerFrames } from '../normalize/frames.util';
import { pickPlayback } from '../props/split-props.util';

function resolveGradientElement<T extends TGradientType>(
  element: TGradientElement<T>
): IResolvedElement {
  assertGradientElement<T>(element);

  const descriptor = descriptorOf(element);
  const props = (element.props ?? {}) as Record<string, unknown>;

  if (descriptor?.kind === 'stack') {
    return {
      layers: resolveStack(props.children as ReactNode).layers,
      keyframes: toNativeFrames(props.keyframes as TLayerFrames | undefined),
      playback: pickPlayback(props),
    };
  }

  invariant(descriptor, 'gradient element is missing its descriptor');

  const merged = { ...descriptor.defaults, ...props };
  const { layers, keyframes, blendMode } = resolveGradient(merged, descriptor.type);

  return { layers, keyframes, blendMode, playback: pickPlayback(merged) };
}

export { resolveGradientElement };
