import { type FC, type JSX, type ReactNode } from 'react';

import { GradientSurface } from '../../core/gradient-surface';
import { useGradient } from '../../hooks';
import type {
  IGradientView,
  TGradientComponent,
  TGradientOf,
  TGradientType,
} from '../../interfaces';
import { createComponent } from '../../utils/component/create-component.util';
import { describe } from '../../utils/descriptor/gradient-descriptor.util';

function createGradient<T extends TGradientType>(
  type: T,
  displayName: string,
  defaults: Partial<IGradientView> = {}
): TGradientComponent<T> {
  const GradientComponent: FC<TGradientOf<T>> = (
    props: TGradientOf<T>
  ): ReactNode & JSX.Element => {
    const { layers, keyframes, blendMode, view } = useGradient({ ...defaults, ...props }, type);

    return (
      <GradientSurface {...view} layers={layers} keyframes={keyframes} blendMode={blendMode} />
    );
  };

  const Gradient = createComponent<TGradientOf<T>>(displayName, GradientComponent);

  return describe(Gradient, { kind: 'layer', type, defaults });
}

export { createGradient };
