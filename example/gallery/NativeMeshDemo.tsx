import { NativeMeshGradient } from '@rit3zh/gradients';
import { StyleSheet } from 'react-native';

const Colors = [
  '#03001E',
  '#3224AE',
  '#7303C0',
  '#EC38BC',
  '#FF0080',
  '#FF5F6D',
  '#FCB045',
  '#FFC371',
  '#FDEFF9',
];

export function NativeMeshDemo({ active }: { active: boolean }) {
  return (
    <NativeMeshGradient
      style={StyleSheet.absoluteFill}
      columns={5}
      rows={5}
      colors={Colors}
      colorSpace="perceptual"
      drift={2.5}
      speed={1.2}
      paused={true}
    />
  );
}
