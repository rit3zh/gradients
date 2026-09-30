import { MeshGradient } from '@rit3zh/gradients';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

const Palettes = [
  ['#833AB4', '#FD1D1D', '#FCB045', '#7303C0', '#FF0080', '#FF5F6D'],
  ['#03001E', '#7303C0', '#EC38BC', '#3224AE', '#FF66FF', '#FDEFF9'],
  ['#FC5C7D', '#6A82FB', '#C471ED', '#FF5F6D', '#FFC371', '#FF0080'],
];

export function TransitionDemo({ active }: { active: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      return;
    }
    const timer = setInterval(() => setIndex((value) => (value + 1) % Palettes.length), 2800);
    return () => clearInterval(timer);
  }, [active]);

  return (
    <MeshGradient
      style={StyleSheet.absoluteFill}
      paused={!active}
      rows={2}
      columns={3}
      colors={Palettes[index]}
      drift={0.4}
      speed={0.4}
      transition={{ type: 'spring', damping: 16, stiffness: 70 }}
    />
  );
}
