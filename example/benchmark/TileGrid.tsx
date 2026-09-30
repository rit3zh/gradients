import {
  AuroraGradient,
  ConicGradient,
  IridescentGradient,
  LinearGradient,
  LiquidGradient,
  MeshGradient,
  NoiseGradient,
  WaveGradient,
} from '@rit3zh/gradients';
import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

const fill = StyleSheet.absoluteFill;
const Gap = 6;

const Kinds: (() => ReactNode)[] = [
  () => <LinearGradient style={fill} spin={40} />,
  () => <ConicGradient style={fill} spin={60} />,
  () => <MeshGradient style={fill} drift={0.8} />,
  () => <NoiseGradient style={fill} speed={0.5} />,
  () => <AuroraGradient style={fill} />,
  () => <LiquidGradient style={fill} />,
  () => <IridescentGradient style={fill} speed={0.6} />,
  () => <WaveGradient style={fill} />,
];

export function TileGrid({ count }: { count: number }) {
  const { width } = useWindowDimensions();
  const columns = count > 12 ? 4 : 3;
  const tileWidth = Math.floor((width - Gap * (columns + 1)) / columns);
  const tileHeight = Math.floor(tileWidth / 0.8);

  return (
    <View style={styles.grid}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={[styles.tile, { width: tileWidth, height: tileHeight }]}>
          {Kinds[index % Kinds.length]()}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    gap: Gap,
    padding: Gap,
    backgroundColor: '#000',
  },
  tile: {
    borderRadius: 14,
    overflow: 'hidden',
  },
});
