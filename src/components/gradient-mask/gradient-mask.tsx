import { type FC, type JSX, type ReactNode } from 'react';

import { GradientSurface } from '../../core/gradient-surface';
import { useGradientElement } from '../../hooks';
import type { IGradientMask } from '../../interfaces';
import { createComponent } from '../../utils/component/create-component.util';

const GradientMaskComponent: FC<IGradientMask> = ({
  gradient,
  ...props
}: IGradientMask): ReactNode & JSX.Element => {
  const { layers, keyframes, blendMode, playback } = useGradientElement(gradient);

  return (
    <GradientSurface
      {...playback}
      {...props}
      layers={layers}
      keyframes={keyframes}
      blendMode={blendMode}
      maskMode="content"
    />
  );
};

const GradientMask = createComponent<IGradientMask>('GradientMask', GradientMaskComponent);

export { GradientMask };
