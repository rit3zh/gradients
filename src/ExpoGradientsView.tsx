import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoGradientsViewProps } from './ExpoGradients.types';

const NativeView: React.ComponentType<ExpoGradientsViewProps> = requireNativeView('ExpoGradients');

export default function ExpoGradientsView(props: ExpoGradientsViewProps) {
  return <NativeView {...props} />;
}
