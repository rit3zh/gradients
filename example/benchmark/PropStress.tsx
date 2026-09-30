import { LinearGradient } from '@rit3zh/gradients';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

const Palettes = [
  ['#FF6B6B', '#FFD166', '#06D6A0'],
  ['#0F172A', '#38BDF8', '#E0F2FE'],
  ['#833AB4', '#FD1D1D', '#FCB045'],
  ['#03001E', '#7303C0', '#EC38BC'],
];

export function PropStress() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((value) => (value + 1) % Palettes.length), 250);
    return () => clearInterval(timer);
  }, []);

  return (
    <LinearGradient
      style={StyleSheet.absoluteFill}
      colors={Palettes[index]}
      angle={index * 90}
      transition={{ type: 'spring', damping: 18, stiffness: 120 }}
    />
  );
}
