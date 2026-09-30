import { isLayerOption, isPlaybackProp } from '../../helpers/prop-keys.helper';
import type { IGradientPlayback } from '../../interfaces';

interface ISplitProps {
  options: Record<string, unknown>;
  view: Record<string, unknown>;
}

function splitProps<P extends object>(props: P): ISplitProps {
  const options: Record<string, unknown> = {};
  const view: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (isLayerOption(key)) {
      options[key] = value;
    } else {
      view[key] = value;
    }
  }
  return { options, view };
}

function pickPlayback<P extends object>(props: P): IGradientPlayback {
  const playback: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (isPlaybackProp(key) && value !== undefined) {
      playback[key] = value;
    }
  }
  return playback as IGradientPlayback;
}

export { splitProps, pickPlayback };
export type { ISplitProps };
