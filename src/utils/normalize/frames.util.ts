import { toNativeLayer } from './layer.util';
import type { TGradientLayer } from '../../interfaces';
import type { TNativeLayer } from '../../interfaces/native.interface';

type TLayerFrames = readonly (readonly TGradientLayer[])[];

function toNativeFrames<T extends TLayerFrames>(frames?: T): TNativeLayer[][] | undefined {
  return frames?.map((frame) => frame.map(toNativeLayer));
}

export { toNativeFrames };
export type { TLayerFrames };
