import { type FC, type JSX, type ReactNode } from 'react';

import { GradientSurface } from '../../core/gradient-surface';
import { useGradientStack } from '../../hooks';
import type { IGradientStack } from '../../interfaces';
import { createComponent } from '../../utils/component/create-component.util';
import { describe } from '../../utils/descriptor/gradient-descriptor.util';

const GradientStackComponent: FC<IGradientStack> = ({
  children,
  keyframes: frames,
  ...props
}: IGradientStack): ReactNode & JSX.Element => {
  const { layers, keyframes, content } = useGradientStack(children, frames);

  return (
    <GradientSurface {...props} layers={layers} keyframes={keyframes}>
      {content}
    </GradientSurface>
  );
};

const GradientStack = describe(
  createComponent<IGradientStack>('GradientStack', GradientStackComponent),
  { kind: 'stack' }
);

export { GradientStack };
