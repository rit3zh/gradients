import type { TPalette, TPaletteName } from '../interfaces/presets.interface';
function getPalette<N extends TPaletteName>(name: N): TPalette {
  switch (name as TPaletteName) {
    case 'dusk':
      return ['#7B61FF', '#FF5FA2', '#FFB86B'];
    case 'ocean':
      return ['#22D3EE', '#6366F1'];
    case 'aurora':
      return ['#00F5A0', '#00D9F5', '#7B61FF', '#FF4FD8'];
    case 'liquid':
      return ['#1E1B4B', '#7C3AED', '#EC4899', '#F59E0B', '#FDE68A'];
    case 'spectrum':
      return ['#FFB3C7', '#FFE5A3', '#B5F5C8', '#A7D8FF', '#D7B8FF', '#FFB3C7'];
    case 'noise':
      return ['#0F172A', '#6366F1', '#F472B6', '#FDE68A'];
    case 'corners':
      return ['#FF6B6B', '#FFD166', '#4D96FF', '#6BCB77'];
    case 'mesh':
      return [
        '#FF6B6B',
        '#FFD166',
        '#06D6A0',
        '#8338EC',
        '#EF476F',
        '#118AB2',
        '#3A86FF',
        '#FB5607',
        '#FFBE0B',
        '#7B61FF',
        '#00D9F5',
        '#FF4FD8',
      ];
    case 'glow':
      return ['rgba(139, 92, 246, 0.95)', 'rgba(236, 72, 153, 0.5)', 'rgba(236, 72, 153, 0)'];
    case 'light':
      return ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0)'];
    case 'interlace':
      return ['#FFE08A', '#DD850C', '#800675', '#007AD7', '#7FDAFF', '#DDFFE3', '#FFE08A'];
    case 'strata':
      return ['#F2A65A', '#B3472E', '#3A1C1F', '#0B0B10'];
    case 'reflected':
      return ['#FDF2F8', '#F9A8D4', '#A855F7', '#312E81'];
  }
}

function getClosedPalette<N extends TPaletteName>(name: N): TPalette {
  const palette = getPalette<TPaletteName>(name);
  return [...palette, palette[0]];
}

function getPaletteSlice<N extends TPaletteName>(name: N, count: number): TPalette {
  return getPalette<TPaletteName>(name).slice(0, count);
}

export { getPalette, getClosedPalette, getPaletteSlice };
