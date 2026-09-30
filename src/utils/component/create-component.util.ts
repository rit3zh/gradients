import { memo, type FC, type NamedExoticComponent } from 'react';
import { assertNonEmpty } from '../assert/assert.util';

function createComponent<P extends object>(
  displayName: string,
  render: FC<P>
): NamedExoticComponent<P> {
  assertNonEmpty(displayName, 'displayName');
  const Component = memo<P>(render);
  Component.displayName = displayName;

  return Component;
}

export { createComponent };
