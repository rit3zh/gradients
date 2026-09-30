import type { ReactNode } from 'react';

import type { TBlendMode } from './common.interface';
import type { IGradientPlayback } from './components.interface';
import type { TNativeLayer } from './native.interface';

interface IResolvedLayers {
  layers: TNativeLayer[];
  keyframes?: TNativeLayer[][];
  blendMode?: TBlendMode;
}

interface IResolvedGradient<V extends object = Record<string, unknown>> extends IResolvedLayers {
  view: V;
}

interface IResolvedElement extends IResolvedLayers {
  playback: IGradientPlayback;
}

interface IResolvedStack {
  layers: TNativeLayer[];
  content: ReactNode[];
}

export type { IResolvedLayers, IResolvedGradient, IResolvedElement, IResolvedStack };
