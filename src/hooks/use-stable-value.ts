import { useMemo } from 'react';

function useStableValue<T>(value: T): T {
  const key = JSON.stringify(value);
  return useMemo(() => (key === undefined ? undefined : JSON.parse(key)) as T, [key]);
}

export { useStableValue };
