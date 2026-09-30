import { type FC, type JSX, type ReactNode } from 'react';
import { GradientSurface } from '../../core/gradient-surface';
import { useGradient } from '../../hooks';
import type { TGradient } from '../../interfaces';
import { createComponent } from '../../utils/component/create-component.util';

const GradientComponent: FC<TGradient> = (props: TGradient): ReactNode & JSX.Element => {
  const { layers, keyframes, blendMode, view } = useGradient(props);

  return <GradientSurface {...view} layers={layers} keyframes={keyframes} blendMode={blendMode} />;
};

const Gradient = createComponent<TGradient>('Gradient', GradientComponent);

export { Gradient };
