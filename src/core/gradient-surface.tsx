import type { FC, JSX, ReactNode } from 'react';
import { NativeGradientView } from './native-gradient-view';
import { useStableValue } from '../hooks/use-stable-value';
import type { IGradientView, TBlendMode } from '../interfaces';
import type { INativeBorder, TMaskMode, TNativeLayer } from '../interfaces/native.interface';
import { toNativeTransition } from '../utils/normalize/transition.util';

interface IGradientSurface extends IGradientView {
  layers: TNativeLayer[];
  keyframes?: TNativeLayer[][];
  blendMode?: TBlendMode;
  maskMode?: TMaskMode;
  border?: INativeBorder | null;
}

const EmptyKeyframes: TNativeLayer[][] = [];

const GradientSurface: FC<IGradientSurface> = ({
  layers,
  keyframes,
  transition,
  loop = true,
  paused = false,
  dither = true,
  grain = 0,
  deviceMotion = false,
  blendMode = 'normal',
  maskMode = 'none',
  border = null,
  children,
  ...rest
}: IGradientSurface): ReactNode & JSX.Element => {
  const stableLayers = useStableValue(layers);
  const stableKeyframes = useStableValue(keyframes ?? EmptyKeyframes);
  const stableTransition = useStableValue(toNativeTransition(transition));
  const stableBorder = useStableValue(border);

  return (
    <NativeGradientView
      {...rest}
      layers={stableLayers}
      keyframes={stableKeyframes}
      transition={stableTransition}
      loop={loop}
      paused={paused}
      dither={dither}
      grain={grain}
      deviceMotion={deviceMotion}
      blendMode={blendMode}
      maskMode={maskMode}
      border={stableBorder}>
      {children}
    </NativeGradientView>
  );
};

GradientSurface.displayName = 'GradientSurface';

export { GradientSurface };
export type { IGradientSurface };
