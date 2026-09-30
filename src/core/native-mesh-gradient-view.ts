import { requireNativeView } from 'expo';
import type { ComponentType } from 'react';

import type { INativeMeshGradientView } from '../interfaces/native-mesh.interface';

const NativeMeshGradientView: ComponentType<INativeMeshGradientView> = requireNativeView(
  'ExpoGradients',
  'NativeMeshGradientView'
);

export { NativeMeshGradientView };
