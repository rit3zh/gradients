import { useMemo, useRef } from 'react';

export function useJsFrameCounter() {
  const frames = useRef(0);
  const startedAt = useRef(0);
  const handle = useRef<number | null>(null);

  return useMemo(() => {
    const tick = () => {
      frames.current += 1;
      handle.current = requestAnimationFrame(tick);
    };

    const start = () => {
      frames.current = 0;
      startedAt.current = performance.now();
      handle.current = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (handle.current !== null) {
        cancelAnimationFrame(handle.current);
        handle.current = null;
      }
      const seconds = Math.max((performance.now() - startedAt.current) / 1000, 0.001);
      return frames.current / seconds;
    };

    return { start, stop };
  }, []);
}
