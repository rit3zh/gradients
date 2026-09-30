import type { IGradientPlayback } from '../interfaces';

type TLayerOptionKey =
  | 'colors'
  | 'stops'
  | 'interpolation'
  | 'easing'
  | 'opacity'
  | 'blendMode'
  | 'speed'
  | 'seed'
  | 'spin'
  | 'flow'
  | 'tileMode'
  | 'angle'
  | 'start'
  | 'end'
  | 'center'
  | 'radius'
  | 'shape'
  | 'startAngle'
  | 'endAngle'
  | 'rows'
  | 'columns'
  | 'points'
  | 'smoothness'
  | 'drift'
  | 'scale'
  | 'octaves'
  | 'warp'
  | 'contrast'
  | 'cells'
  | 'falloff'
  | 'intensity'
  | 'origin'
  | 'spread'
  | 'length'
  | 'softness'
  | 'color'
  | 'roundness'
  | 'highlight'
  | 'bands'
  | 'sheen'
  | 'frequency'
  | 'amplitude'
  | 'turbulence'
  | 'count'
  | 'depth'
  | 'ripple'
  | 'paletteMix'
  | 'sparkle'
  | 'density'
  | 'preset'
  | 'extinction'
  | 'tint'
  | 'horizon'
  | 'fisheye'
  | 'shade'
  | 'offset';

const layerOptionKeys: ReadonlySet<string> = new Set<TLayerOptionKey>([
  'colors',
  'stops',
  'interpolation',
  'easing',
  'opacity',
  'blendMode',
  'speed',
  'seed',
  'spin',
  'flow',
  'tileMode',
  'angle',
  'start',
  'end',
  'center',
  'radius',
  'shape',
  'startAngle',
  'endAngle',
  'rows',
  'columns',
  'points',
  'smoothness',
  'drift',
  'scale',
  'octaves',
  'warp',
  'contrast',
  'cells',
  'falloff',
  'intensity',
  'origin',
  'spread',
  'length',
  'softness',
  'color',
  'roundness',
  'highlight',
  'bands',
  'sheen',
  'frequency',
  'amplitude',
  'turbulence',
  'count',
  'depth',
  'ripple',
  'paletteMix',
  'sparkle',
  'density',
  'preset',
  'extinction',
  'tint',
  'horizon',
  'fisheye',
  'shade',
  'offset',
]);

const playbackKeys: ReadonlySet<string> = new Set<keyof IGradientPlayback>([
  'transition',
  'loop',
  'paused',
  'dither',
  'grain',
  'deviceMotion',
]);

function isLayerOption<K extends string>(key: K): key is K {
  return layerOptionKeys.has(key);
}

function isPlaybackProp(key: string): key is keyof IGradientPlayback {
  return playbackKeys.has(key);
}

export { isLayerOption, isPlaybackProp };
export type { TLayerOptionKey };
