import { Children, type ReactNode } from 'react';

import type { TGradientLayer } from '../../interfaces';
import type { TNativeLayer } from '../../interfaces/native.interface';
import type { IResolvedStack } from '../../interfaces/resolve.interface';
import { descriptorOf } from '../descriptor/gradient-descriptor.util';
import { toNativeLayer } from '../normalize/layer.util';
import { splitProps } from '../props/split-props.util';

function resolveStack(children: ReactNode): IResolvedStack {
  const layers: TNativeLayer[] = [];
  const content: ReactNode[] = [];

  Children.forEach(children, (child) => {
    const descriptor = descriptorOf(child);
    if (descriptor?.kind === 'layer') {
      const { options } = splitProps((child as { props: object }).props);
      layers.push(toNativeLayer({ ...options, type: descriptor.type } as TGradientLayer));
    } else {
      content.push(child);
    }
  });

  return { layers, content };
}

export { resolveStack };
