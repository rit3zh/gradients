import type { ColorValue, ProcessedColorValue, StyleProp, ViewProps, ViewStyle } from 'react-native';

import type { TPoint } from './common.interface';

type TNativeMeshColorSpace = 'device' | 'perceptual';

interface INativeMeshGradient extends Omit<ViewProps, 'style' | 'children'> {
  columns?: number;
  rows?: number;
  points?: readonly TPoint[];
  colors: readonly ColorValue[];
  smoothsColors?: boolean;
  background?: ColorValue;
  colorSpace?: TNativeMeshColorSpace;
  animationDuration?: number;
  drift?: number;
  speed?: number;
  paused?: boolean;
  style?: StyleProp<ViewStyle>;
}

interface INativeMeshGradientView extends Omit<ViewProps, 'children'> {
  columns: number;
  rows: number;
  points: [number, number][];
  colors: ProcessedColorValue[];
  smoothsColors: boolean;
  background: ProcessedColorValue | null;
  colorSpace: TNativeMeshColorSpace;
  animationDuration: number;
  drift: number;
  speed: number;
  paused: boolean;
}

export type { TNativeMeshColorSpace, INativeMeshGradient, INativeMeshGradientView };
