import { processColor, type ColorValue, type ProcessedColorValue } from 'react-native';

import { toBezier } from '../../helpers/easing.helper';
import { getClosedPalette, getPalette, getPaletteSlice } from '../../helpers/palette.helper';
import { getSkyPreset } from '../../helpers/sky.helper';
import type {
  IColorOptions,
  ICompositionOptions,
  IMotionOptions,
  TGradientLayer,
  TPoint,
} from '../../interfaces';
import type { TNativeKind, TNativeLayer } from '../../interfaces/native.interface';
import { compact } from '../props/compact.util';

function toPoint(point: TPoint): [number, number] {
  return Array.isArray(point)
    ? [point[0], point[1]]
    : [(point as { x: number }).x, (point as { y: number }).y];
}

function toColors(colors: readonly ColorValue[]): ProcessedColorValue[] {
  return colors
    .map((color) => processColor(color))
    .filter((color): color is ProcessedColorValue => color !== null && color !== undefined);
}

function layer<K extends TNativeKind>(
  type: K,
  options: IColorOptions & ICompositionOptions & IMotionOptions,
  fallback: readonly ColorValue[],
  extra: Record<string, unknown>,
  speed = 1
): TNativeLayer<K> {
  return compact({
    type,
    colors: toColors(options.colors ?? fallback),
    stops: options.stops ? [...options.stops] : undefined,
    interpolation: options.interpolation,
    easing: options.easing ? toBezier(options.easing) : undefined,
    opacity: options.opacity,
    blendMode: options.blendMode,
    speed: options.speed ?? speed,
    seed: options.seed,
    ...extra,
  });
}

function toNativeLayer(options: TGradientLayer): TNativeLayer {
  switch (options.type) {
    case 'linear':
      return layer('linear', options, getPalette('dusk'), {
        angle: options.angle ?? 180,
        start: options.start && options.end ? toPoint(options.start) : undefined,
        end: options.start && options.end ? toPoint(options.end) : undefined,
        spin: options.spin,
        flow: options.flow,
        tileMode: options.tileMode,
      });

    case 'reflected':
      return layer('reflected', options, getPalette('reflected'), {
        angle: options.angle ?? 180,
        start: options.start && options.end ? toPoint(options.start) : undefined,
        end: options.start && options.end ? toPoint(options.end) : undefined,
        softness: options.softness ?? 0.35,
        radius: options.offset ?? 0,
        spin: options.spin,
        flow: options.flow,
        tileMode: options.tileMode,
      });

    case 'radial':
      return layer('radial', options, getPalette('dusk'), {
        center: options.center ? toPoint(options.center) : undefined,
        radius: options.radius ?? 1,
        shape: options.shape,
        flow: options.flow,
        tileMode: options.tileMode,
      });

    case 'conic':
    case 'angular':
      return layer('conic', options, getClosedPalette('dusk'), {
        center: options.center ? toPoint(options.center) : undefined,
        angle: options.angle ?? 0,
        spin: options.spin,
        flow: options.flow,
        tileMode: options.tileMode,
      });

    case 'sweep':
      return layer('sweep', options, getPalette('ocean'), {
        center: options.center ? toPoint(options.center) : undefined,
        startAngle: options.startAngle ?? 0,
        endAngle: options.endAngle ?? 360,
        spin: options.spin,
        tileMode: options.tileMode,
      });

    case 'diamond':
      return layer('diamond', options, getPalette('dusk'), {
        center: options.center ? toPoint(options.center) : undefined,
        radius: options.radius ?? 1,
        angle: options.angle ?? 0,
        shape: options.shape === 'square' ? 'circle' : 'ellipse',
        spin: options.spin,
        flow: options.flow,
        tileMode: options.tileMode,
      });

    case 'mesh': {
      const rows = Math.max(2, Math.round(options.rows ?? 3));
      const columns = Math.max(2, Math.round(options.columns ?? 3));
      return layer(
        'mesh',
        options,
        getPaletteSlice('mesh', rows * columns),
        {
          rows,
          columns,
          points: options.points?.map(toPoint),
          smoothness: options.smoothness ?? 1,
          drift: options.drift ?? 0,
        },
        1
      );
    }

    case 'freeform':
      return layer('freeform', options, getPalette('corners'), {
        points: options.points?.map(toPoint),
        smoothness: options.smoothness ?? 0.5,
        drift: options.drift ?? 0,
      });

    case 'bilinear':
      return layer('bilinear', options, getPalette('corners'), {
        smoothness: options.smoothness ?? 0,
      });

    case 'noise':
      return layer(
        'noise',
        options,
        getPalette('noise'),
        {
          scale: options.scale ?? 1,
          octaves: options.octaves ?? 4,
          warp: options.warp ?? 0.35,
          intensity: options.contrast ?? 1,
        },
        0
      );

    case 'voronoi':
      return layer('voronoi', options, getPaletteSlice('mesh', 6), {
        cells: options.cells ?? 8,
        points: options.points?.map(toPoint),
        smoothness: options.smoothness ?? 0.35,
        drift: options.drift ?? 0,
      });

    case 'glow':
      return layer(
        'glow',
        options,
        getPalette('glow'),
        {
          center: options.center ? toPoint(options.center) : undefined,
          radius: options.radius ?? 1,
          falloff: options.falloff ?? 1,
          intensity: options.intensity ?? 1,
        },
        0
      );

    case 'spotlight':
      return layer(
        'spotlight',
        options,
        getPalette('light'),
        {
          center: toPoint(options.origin ?? [0.5, 0]),
          angle: options.angle ?? 180,
          spread: options.spread ?? 40,
          radius: options.length ?? 1,
          softness: options.softness ?? 0.5,
          intensity: options.intensity ?? 1,
          spin: options.spin,
        },
        0
      );

    case 'vignette': {
      const color = options.color ?? 'rgba(0, 0, 0, 0.85)';
      return layer('vignette', options, ['transparent', color], {
        center: options.center ? toPoint(options.center) : undefined,
        radius: options.radius ?? 0.45,
        softness: options.softness ?? 0.75,
        roundness: options.roundness ?? 1,
        intensity: options.intensity ?? 1,
      });
    }

    case 'aurora':
      return layer('aurora', options, getPalette('aurora'), {
        bands: options.bands ?? 3,
        scale: options.scale ?? 1,
        intensity: options.intensity ?? 1,
        softness: options.softness ?? 0.5,
      });

    case 'liquid':
      return layer('liquid', options, getPalette('liquid'), {
        scale: options.scale ?? 1,
        warp: options.warp ?? 1.8,
        highlight: options.highlight ?? 0.25,
      });

    case 'iridescent':
      return layer(
        'iridescent',
        options,
        getPalette('spectrum'),
        {
          angle: options.angle ?? 135,
          bands: options.bands ?? 1.4,
          highlight: options.sheen ?? 0.8,
          warp: options.warp ?? 0.8,
          softness: options.paletteMix ?? (options.colors ? 0.7 : 0),
          spin: options.spin,
        },
        0.35
      );

    case 'holographic':
      return layer(
        'holographic',
        options,
        getPalette('spectrum'),
        {
          angle: options.angle ?? 120,
          bands: options.bands ?? 1.2,
          intensity: options.sparkle ?? 0.9,
          highlight: options.sheen ?? 0.55,
          warp: options.warp ?? 0.8,
          softness: options.paletteMix ?? (options.colors ? 0.7 : 0),
          spin: options.spin,
        },
        0.4
      );

    case 'wave':
      return layer('wave', options, getPalette('ocean'), {
        angle: options.angle ?? 0,
        scale: options.frequency ?? 1,
        intensity: options.amplitude ?? 1,
        smoothness: options.smoothness ?? 1,
        spin: options.spin,
      });

    case 'silk':
      return layer('silk', options, getPalette('dusk'), {
        scale: options.scale ?? 1,
        highlight: options.sheen ?? 0.25,
      });

    case 'smoke':
      return layer('smoke', options, getPalette('noise'), {
        scale: options.scale ?? 1,
        warp: options.turbulence ?? 0.6,
      });

    case 'ribbon':
      return layer('ribbon', options, getPalette('dusk'), {
        angle: options.angle ?? -20,
        bands: options.count ?? 4,
        scale: options.scale ?? 1,
        highlight: options.depth ?? 0.6,
        spin: options.spin,
        tileMode: options.tileMode ?? 'mirror',
      });

    case 'flux':
      return layer('flux', options, getPalette('dusk'), {
        warp: options.turbulence ?? 1,
        intensity: options.ripple ?? 1,
        scale: options.scale ?? 1,
      });

    case 'interlace':
      return layer('interlace', options, getPalette('interlace'), {
        angle: options.angle ?? 45,
        scale: options.frequency ?? 1,
        width: options.density ?? 128,
        intensity: options.depth ?? 1,
        spin: options.spin,
        tileMode: options.tileMode ?? 'repeat',
      });

    case 'sky': {
      const preset = getSkyPreset(options.preset);
      return compact({
        type: 'sky' as const,
        colors: toColors([options.tint ?? preset.tint]),
        opacity: options.opacity,
        blendMode: options.blendMode,
        extinction: [...(options.extinction ?? preset.extinction)],
        horizon: options.horizon ?? 0.8,
        fisheye: options.fisheye ?? 0.5,
      });
    }

    case 'strata':
      return layer('strata', options, getPalette('strata'), {
        bands: options.count ?? 3,
        angle: options.angle ?? 28,
        scale: options.frequency ?? 1,
        intensity: options.shade ?? 0.6,
      });
  }
}

export { toNativeLayer };
