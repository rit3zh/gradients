import { type FC, type JSX, type ReactNode } from 'react';

import { GradientSurface } from '../../core/gradient-surface';
import { useGradientElement } from '../../hooks';
import type { IGradientBorder } from '../../interfaces';
import { assertNonNegative } from '../../utils/assert/assert.util';
import { createComponent } from '../../utils/component/create-component.util';

const GradientBorderComponent: FC<IGradientBorder> = ({
  gradient,
  width = 2,
  radius = 16,
  style,
  ...props
}: IGradientBorder): ReactNode & JSX.Element => {
  assertNonNegative(width, 'GradientBorder width');
  assertNonNegative(radius, 'GradientBorder radius');

  const { layers, keyframes, blendMode, playback } = useGradientElement(gradient);

  return (
    <GradientSurface
      {...playback}
      {...props}
      style={[{ borderRadius: radius, padding: width }, style]}
      layers={layers}
      keyframes={keyframes}
      blendMode={blendMode}
      border={{ width, radius }}
    />
  );
};

const GradientBorder = createComponent<IGradientBorder>('GradientBorder', GradientBorderComponent);

export { GradientBorder };
