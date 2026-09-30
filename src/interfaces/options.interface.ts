import type { ColorValue } from 'react-native';

import type {
  IColorOptions,
  ICompositionOptions,
  IMotionOptions,
  TPoint,
  TTileMode,
} from './common.interface';

interface IBaseOptions extends IColorOptions, ICompositionOptions, IMotionOptions {}

interface ISpinOptions {
  spin?: number;
}

interface IFlowOptions {
  flow?: number;
  tileMode?: TTileMode;
}

interface ILinearOptions extends IBaseOptions, ISpinOptions, IFlowOptions {
  angle?: number;
  start?: TPoint;
  end?: TPoint;
}

interface IRadialOptions extends IBaseOptions, IFlowOptions {
  center?: TPoint;
  radius?: number;
  shape?: 'circle' | 'ellipse';
}

interface IConicOptions extends IBaseOptions, ISpinOptions, IFlowOptions {
  center?: TPoint;
  angle?: number;
}

interface ISweepOptions extends IBaseOptions, ISpinOptions {
  center?: TPoint;
  startAngle?: number;
  endAngle?: number;
  tileMode?: TTileMode;
}

interface IDiamondOptions extends IBaseOptions, ISpinOptions, IFlowOptions {
  center?: TPoint;
  radius?: number;
  angle?: number;
  shape?: 'square' | 'fit';
}

interface IReflectedOptions extends IBaseOptions, ISpinOptions, IFlowOptions {
  angle?: number;
  start?: TPoint;
  end?: TPoint;
  softness?: number;
  offset?: number;
}

interface IMeshOptions extends IBaseOptions {
  rows?: number;
  columns?: number;
  points?: readonly TPoint[];
  smoothness?: number;
  drift?: number;
}

interface IFreeformOptions extends IBaseOptions {
  points?: readonly TPoint[];
  smoothness?: number;
  drift?: number;
}

interface IBilinearOptions extends IBaseOptions {
  smoothness?: number;
}

interface INoiseOptions extends IBaseOptions {
  scale?: number;
  octaves?: number;
  warp?: number;
  contrast?: number;
}

interface IVoronoiOptions extends IBaseOptions {
  cells?: number;
  points?: readonly TPoint[];
  smoothness?: number;
  drift?: number;
}

interface IGlowOptions extends IBaseOptions {
  center?: TPoint;
  radius?: number;
  falloff?: number;
  intensity?: number;
}

interface ISpotlightOptions extends IBaseOptions, ISpinOptions {
  origin?: TPoint;
  angle?: number;
  spread?: number;
  length?: number;
  softness?: number;
  intensity?: number;
}

interface IVignetteOptions extends IBaseOptions {
  color?: ColorValue;
  center?: TPoint;
  radius?: number;
  softness?: number;
  roundness?: number;
  intensity?: number;
}

interface IAuroraOptions extends IBaseOptions {
  bands?: number;
  scale?: number;
  intensity?: number;
  softness?: number;
}

interface ILiquidOptions extends IBaseOptions {
  scale?: number;
  warp?: number;
  highlight?: number;
}

interface IIridescentOptions extends IBaseOptions, ISpinOptions {
  angle?: number;
  bands?: number;
  sheen?: number;
  warp?: number;
  paletteMix?: number;
}

interface IHolographicOptions extends IBaseOptions, ISpinOptions {
  angle?: number;
  bands?: number;
  sparkle?: number;
  sheen?: number;
  warp?: number;
  paletteMix?: number;
}

interface IInterlaceOptions extends IBaseOptions, ISpinOptions {
  angle?: number;
  frequency?: number;
  density?: number;
  depth?: number;
  tileMode?: TTileMode;
}

type TSkyPreset = 'clear' | 'overcast' | 'dusk' | 'tropical' | 'ember' | 'verdant';

interface ISkyOptions extends ICompositionOptions {
  preset?: TSkyPreset;
  extinction?: readonly [number, number, number];
  tint?: ColorValue;
  horizon?: number;
  fisheye?: number;
}

interface IStrataOptions extends IBaseOptions {
  count?: number;
  angle?: number;
  frequency?: number;
  shade?: number;
}

interface IWaveOptions extends IBaseOptions, ISpinOptions {
  angle?: number;
  frequency?: number;
  amplitude?: number;
  smoothness?: number;
}

interface ISilkOptions extends IBaseOptions {
  scale?: number;
  sheen?: number;
}

interface ISmokeOptions extends IBaseOptions {
  scale?: number;
  turbulence?: number;
}

interface IRibbonOptions extends IBaseOptions, ISpinOptions {
  angle?: number;
  count?: number;
  scale?: number;
  depth?: number;
  tileMode?: TTileMode;
}

interface IFluxOptions extends IBaseOptions {
  turbulence?: number;
  ripple?: number;
  scale?: number;
}

interface IGradientOptionsMap {
  linear: ILinearOptions;
  radial: IRadialOptions;
  conic: IConicOptions;
  angular: IConicOptions;
  sweep: ISweepOptions;
  diamond: IDiamondOptions;
  reflected: IReflectedOptions;
  mesh: IMeshOptions;
  freeform: IFreeformOptions;
  bilinear: IBilinearOptions;
  noise: INoiseOptions;
  voronoi: IVoronoiOptions;
  glow: IGlowOptions;
  spotlight: ISpotlightOptions;
  vignette: IVignetteOptions;
  aurora: IAuroraOptions;
  liquid: ILiquidOptions;
  iridescent: IIridescentOptions;
  holographic: IHolographicOptions;
  wave: IWaveOptions;
  silk: ISilkOptions;
  smoke: ISmokeOptions;
  ribbon: IRibbonOptions;
  flux: IFluxOptions;
  interlace: IInterlaceOptions;
  sky: ISkyOptions;
  strata: IStrataOptions;
}

type TGradientType = keyof IGradientOptionsMap;

type TGradientLayer = {
  [K in TGradientType]: { type: K } & IGradientOptionsMap[K];
}[TGradientType];

type TGradientLayerOf<T extends TGradientType> = Extract<TGradientLayer, { type: T }>;

export type {
  TGradientLayerOf,
  IBaseOptions,
  ISpinOptions,
  IFlowOptions,
  ILinearOptions,
  IRadialOptions,
  IConicOptions,
  ISweepOptions,
  IDiamondOptions,
  IReflectedOptions,
  IMeshOptions,
  IFreeformOptions,
  IBilinearOptions,
  INoiseOptions,
  IVoronoiOptions,
  IGlowOptions,
  ISpotlightOptions,
  IVignetteOptions,
  IAuroraOptions,
  ILiquidOptions,
  IIridescentOptions,
  IHolographicOptions,
  IInterlaceOptions,
  TSkyPreset,
  ISkyOptions,
  IStrataOptions,
  IWaveOptions,
  ISilkOptions,
  ISmokeOptions,
  IRibbonOptions,
  IFluxOptions,
  IGradientOptionsMap,
  TGradientType,
  TGradientLayer,
};
