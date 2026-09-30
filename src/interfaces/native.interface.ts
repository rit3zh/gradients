import type { ReactNode } from 'react';
import type { ProcessedColorValue, ViewProps } from 'react-native';

import type { TBlendMode } from './common.interface';
import type { TGradientType } from './options.interface';

type TNativeKind = Exclude<TGradientType, 'angular'>;
type TNativeLayer<K extends TNativeKind = TNativeKind> = {
  type: K;
  colors: ProcessedColorValue[];
  [key: string]: unknown;
};

type TNativeTransition = {
  type: 'timing' | 'spring';
  [key: string]: unknown;
};

type TMaskMode = 'none' | 'content';

interface INativeBorder {
  width: number;
  radius: number;
}

interface INativeGradientView extends ViewProps {
  children?: ReactNode;
  layers: TNativeLayer[];
  keyframes?: TNativeLayer[][];
  transition?: TNativeTransition | null;
  loop?: boolean;
  paused?: boolean;
  dither?: boolean;
  grain?: number;
  deviceMotion?: boolean;
  blendMode?: TBlendMode;
  maskMode?: TMaskMode;
  border?: INativeBorder | null;
}

export type {
  TNativeKind,
  TNativeLayer,
  TNativeTransition,
  TMaskMode,
  INativeBorder,
  INativeGradientView,
};
