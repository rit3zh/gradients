import type { NamedExoticComponent, ReactElement, ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native';

import type { TGradientTransition } from './common.interface';
import type { IGradientOptionsMap, TGradientLayer, TGradientType } from './options.interface';

interface IGradientPlayback {
  transition?: boolean | TGradientTransition;
  loop?: boolean;
  paused?: boolean;
  dither?: boolean;
  grain?: number;
  deviceMotion?: boolean;
}

interface IGradientView extends Omit<ViewProps, 'children' | 'style'>, IGradientPlayback {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

type TGradientOf<T extends TGradientType> = IGradientView &
  IGradientOptionsMap[T] & {
    keyframes?: readonly Partial<IGradientOptionsMap[T]>[];
  };

type TGradientComponent<T extends TGradientType> = NamedExoticComponent<TGradientOf<T>>;

type TLinearGradient = TGradientOf<'linear'>;
type TRadialGradient = TGradientOf<'radial'>;
type TConicGradient = TGradientOf<'conic'>;
type TAngularGradient = TGradientOf<'angular'>;
type TSweepGradient = TGradientOf<'sweep'>;
type TDiamondGradient = TGradientOf<'diamond'>;
type TReflectedGradient = TGradientOf<'reflected'>;
type TMeshGradient = TGradientOf<'mesh'>;
type TFreeformGradient = TGradientOf<'freeform'>;
type TBilinearGradient = TGradientOf<'bilinear'>;
type TNoiseGradient = TGradientOf<'noise'>;
type TVoronoiGradient = TGradientOf<'voronoi'>;
type TGlowGradient = TGradientOf<'glow'>;
type TSpotlightGradient = TGradientOf<'spotlight'>;
type TVignetteGradient = TGradientOf<'vignette'>;
type TAuroraGradient = TGradientOf<'aurora'>;
type TLiquidGradient = TGradientOf<'liquid'>;
type TIridescentGradient = TGradientOf<'iridescent'>;
type THolographicGradient = TGradientOf<'holographic'>;
type TWaveGradient = TGradientOf<'wave'>;
type TSilkGradient = TGradientOf<'silk'>;
type TSmokeGradient = TGradientOf<'smoke'>;
type TRibbonGradient = TGradientOf<'ribbon'>;
type TFluxGradient = TGradientOf<'flux'>;
type TInterlaceGradient = TGradientOf<'interlace'>;
type TSkyGradient = TGradientOf<'sky'>;
type TStrataGradient = TGradientOf<'strata'>;

type TSingleSource = {
  [K in TGradientType]: { type: K; layers?: never } & IGradientOptionsMap[K] & {
      keyframes?: readonly Partial<IGradientOptionsMap[K]>[];
    };
}[TGradientType];

interface ILayeredSource {
  type?: never;
  layers: readonly TGradientLayer[];
  keyframes?: readonly (readonly TGradientLayer[])[];
}

type TGradientSource = TSingleSource | ILayeredSource;

type TGradient = IGradientView & TGradientSource;

type TGradientElement<T extends TGradientType = TGradientType> = ReactElement<
  Partial<TGradientOf<T>>
>;

interface IGradientStack extends IGradientView {
  keyframes?: readonly (readonly TGradientLayer[])[];
}

interface IGradientMask extends IGradientView {
  gradient: TGradientElement;
}

interface IGradientText extends Omit<IGradientView, 'style'> {
  gradient: TGradientElement;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  numberOfLines?: number;
  allowFontScaling?: boolean;
}

interface IGradientBorder extends IGradientView {
  gradient: TGradientElement;
  width?: number;
  radius?: number;
}

export type {
  IGradientPlayback,
  IGradientView,
  TGradientOf,
  TGradientComponent,
  TLinearGradient,
  TRadialGradient,
  TConicGradient,
  TAngularGradient,
  TSweepGradient,
  TDiamondGradient,
  TReflectedGradient,
  TMeshGradient,
  TFreeformGradient,
  TBilinearGradient,
  TNoiseGradient,
  TVoronoiGradient,
  TGlowGradient,
  TSpotlightGradient,
  TVignetteGradient,
  TAuroraGradient,
  TLiquidGradient,
  TIridescentGradient,
  THolographicGradient,
  TWaveGradient,
  TSilkGradient,
  TSmokeGradient,
  TRibbonGradient,
  TFluxGradient,
  TInterlaceGradient,
  TSkyGradient,
  TStrataGradient,
  TGradientSource,
  TGradient,
  TGradientElement,
  IGradientStack,
  IGradientMask,
  IGradientText,
  IGradientBorder,
};
