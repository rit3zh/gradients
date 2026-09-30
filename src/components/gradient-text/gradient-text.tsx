import { type FC, type JSX, type ReactNode } from 'react';
import { Text } from 'react-native';

import { GradientSurface } from '../../core/gradient-surface';
import { useGradientElement } from '../../hooks';
import type { IGradientText } from '../../interfaces';
import { createComponent } from '../../utils/component/create-component.util';

const GradientTextComponent: FC<IGradientText> = ({
  gradient,
  children,
  style,
  containerStyle,
  numberOfLines,
  allowFontScaling,
  ...props
}: IGradientText): ReactNode & JSX.Element => {
  const { layers, keyframes, blendMode, playback } = useGradientElement(gradient);

  return (
    <GradientSurface
      {...playback}
      {...props}
      style={containerStyle}
      layers={layers}
      keyframes={keyframes}
      blendMode={blendMode}
      maskMode="content">
      <Text style={style} numberOfLines={numberOfLines} allowFontScaling={allowFontScaling}>
        {children}
      </Text>
    </GradientSurface>
  );
};

const GradientText = createComponent<IGradientText>('GradientText', GradientTextComponent);

export { GradientText };
