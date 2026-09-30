import type { ColorValue } from 'react-native';

type TPoint = { x: number; y: number } | readonly [number, number];

type TBlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'colorDodge'
  | 'colorBurn'
  | 'hardLight'
  | 'softLight'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity'
  | 'plusLighter'
  | 'plusDarker';

type TTileMode = 'clamp' | 'repeat' | 'mirror' | 'decal';

type TColorInterpolation = 'srgb' | 'linear' | 'oklab';

type TEasingName = 'linear' | 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'smooth';

type TEasing = TEasingName | readonly [number, number, number, number];

interface ITimingTransition {
  type?: 'timing';
  duration?: number;
  delay?: number;
  easing?: TEasing;
}

interface ISpringTransition {
  type: 'spring';
  damping?: number;
  stiffness?: number;
  mass?: number;
  delay?: number;
}

type TGradientTransition = ITimingTransition | ISpringTransition;

interface IColorOptions {
  colors?: readonly ColorValue[];
  stops?: readonly number[];
  interpolation?: TColorInterpolation;
  easing?: TEasing;
}

interface ICompositionOptions {
  opacity?: number;
  blendMode?: TBlendMode;
}

interface IMotionOptions {
  speed?: number;
  seed?: number;
}

export type {
  TPoint,
  TBlendMode,
  TTileMode,
  TColorInterpolation,
  TEasingName,
  TEasing,
  ITimingTransition,
  ISpringTransition,
  TGradientTransition,
  IColorOptions,
  ICompositionOptions,
  IMotionOptions,
};
