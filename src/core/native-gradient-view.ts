import { requireNativeView } from 'expo';
import type { ComponentType } from 'react';

import type { INativeGradientView } from '../interfaces/native.interface';

const NativeGradientView: ComponentType<INativeGradientView> = requireNativeView(
  'ExpoGradients',
  'GradientView'
);

export { NativeGradientView };
