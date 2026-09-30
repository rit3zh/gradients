import { isValidElement, type ReactNode } from 'react';
import type { IGradientView, TGradientType } from '../../interfaces';

type TGradientDescriptor<T extends TGradientType = TGradientType> =
  { kind: 'layer'; type: T; defaults: Partial<IGradientView> } | { kind: 'stack' };

const DescriptorKey = Symbol.for('expo-gradients.descriptor');

function describe<C extends object, T extends TGradientType>(
  component: C,
  descriptor: TGradientDescriptor<T>
): C {
  return Object.assign(component, { [DescriptorKey]: descriptor });
}

function descriptorOf(node: ReactNode): TGradientDescriptor | undefined {
  if (!isValidElement(node) || node.type === null || typeof node.type === 'string') {
    return undefined;
  }
  if (typeof node.type !== 'function' && typeof node.type !== 'object') {
    return undefined;
  }
  return (node.type as unknown as Record<symbol, TGradientDescriptor | undefined>)[DescriptorKey];
}

export { describe, descriptorOf };
export type { TGradientDescriptor };
