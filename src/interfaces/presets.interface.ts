import type { TSkyPreset } from './options.interface';

type TPaletteName =
  | 'dusk'
  | 'ocean'
  | 'aurora'
  | 'liquid'
  | 'spectrum'
  | 'noise'
  | 'corners'
  | 'mesh'
  | 'glow'
  | 'light'
  | 'interlace'
  | 'strata'
  | 'reflected';

type TPalette = readonly string[];

type TBezier = readonly [number, number, number, number];

type TExtinction = readonly [number, number, number];

interface ISkyPreset<P extends TSkyPreset = TSkyPreset> {
  preset: P;
  extinction: TExtinction;
  tint: string;
}

export type { TPaletteName, TPalette, TBezier, TExtinction, ISkyPreset };
