import type { TBlendMode, TGradientLayer, TGradientType } from '../../interfaces';
import type { IResolvedGradient } from '../../interfaces/resolve.interface';
import { toNativeFrames, type TLayerFrames } from '../normalize/frames.util';
import { toNativeLayer } from '../normalize/layer.util';
import { splitProps } from '../props/split-props.util';

interface IGradientSource {
  type?: TGradientType;
  layers?: readonly TGradientLayer[];
  keyframes?: readonly unknown[];
}

function resolveGradient<P extends object, T extends TGradientType = TGradientType>(
  props: P,
  fallbackType?: T
): IResolvedGradient {
  const { type, layers, keyframes, ...rest } = props as IGradientSource;

  if (layers) {
    return {
      layers: layers.map(toNativeLayer),
      keyframes: toNativeFrames(keyframes as TLayerFrames | undefined),
      view: splitProps(rest).view,
    };
  }

  const kind = type ?? fallbackType ?? 'linear';
  const { options, view } = splitProps(rest);
  const { blendMode, ...layerOptions } = options as { blendMode?: TBlendMode };
  const build = (overrides: object) =>
    toNativeLayer({
      ...layerOptions,
      ...overrides,
      type: kind,
      blendMode: undefined,
    } as TGradientLayer);

  return {
    layers: [build({})],
    keyframes: (keyframes as readonly object[] | undefined)?.map((frame) => [build(frame)]),
    blendMode,
    view,
  };
}

export { resolveGradient };
