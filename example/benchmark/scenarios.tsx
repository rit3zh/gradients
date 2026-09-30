import {
  AuroraGradient,
  ConicGradient,
  FreeformGradient,
  GradientStack,
  GradientText,
  HolographicGradient,
  LinearGradient,
  LiquidGradient,
  MeshGradient,
  NoiseGradient,
  RadialGradient,
  SilkGradient,
  VignetteGradient,
} from '@rit3zh/gradients';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { PropStress } from './PropStress';
import { TileGrid } from './TileGrid';

export interface IBenchmarkScenario {
  id: string;
  name: string;
  detail: string;
  render: () => ReactNode;
}

const fill = StyleSheet.absoluteFill;

export const Scenarios: IBenchmarkScenario[] = [
  {
    id: 'static-linear',
    name: 'Static linear',
    detail: 'Idle cost of a non-animated gradient',
    render: () => <LinearGradient style={fill} colors={['#7B61FF', '#FF5FA2', '#FFB86B']} />,
  },
  {
    id: 'linear-spin',
    name: 'Linear spin',
    detail: 'Cheapest animated geometric gradient',
    render: () => (
      <LinearGradient style={fill} colors={['#7B61FF', '#FF5FA2', '#FFB86B']} spin={30} />
    ),
  },
  {
    id: 'conic-spin',
    name: 'Conic spin',
    detail: 'Angular gradient rotating',
    render: () => <ConicGradient style={fill} spin={45} />,
  },
  {
    id: 'radial-flow',
    name: 'Radial flow',
    detail: 'Stops flowing outward',
    render: () => <RadialGradient style={fill} flow={0.25} />,
  },
  {
    id: 'mesh-drift',
    name: 'Mesh 4×4 drift',
    detail: 'CPU tessellation every frame',
    render: () => <MeshGradient style={fill} rows={4} columns={4} drift={0.9} />,
  },
  {
    id: 'freeform-drift',
    name: 'Freeform drift',
    detail: 'Six weighted color points',
    render: () => (
      <FreeformGradient
        style={fill}
        colors={['#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#8338EC', '#EF476F']}
        drift={0.8}
      />
    ),
  },
  {
    id: 'noise',
    name: 'Noise',
    detail: 'Four-octave fractal noise',
    render: () => <NoiseGradient style={fill} speed={0.5} />,
  },
  {
    id: 'aurora',
    name: 'Aurora',
    detail: 'Three curtains with ray noise',
    render: () => (
      <View style={[fill, styles.night]}>
        <AuroraGradient style={fill} />
      </View>
    ),
  },
  {
    id: 'liquid',
    name: 'Liquid',
    detail: 'Heaviest shader, fifteen noise samples',
    render: () => <LiquidGradient style={fill} />,
  },
  {
    id: 'holographic',
    name: 'Holographic',
    detail: 'Full resolution foil with glints',
    render: () => <HolographicGradient style={fill} deviceMotion={false} />,
  },
  {
    id: 'silk',
    name: 'Silk',
    detail: 'Seven fold iterations',
    render: () => <SilkGradient style={fill} />,
  },
  {
    id: 'stack-blend',
    name: 'Stack, three layers',
    detail: 'Mesh with soft-light noise and vignette',
    render: () => (
      <GradientStack style={fill}>
        <MeshGradient rows={3} columns={3} drift={0.6} />
        <NoiseGradient
          colors={['#000000', '#FFFFFF']}
          blendMode="softLight"
          opacity={0.35}
          speed={0.4}
        />
        <VignetteGradient intensity={0.6} />
      </GradientStack>
    ),
  },
  {
    id: 'text-mask',
    name: 'Gradient text',
    detail: 'Animated silk masked to type',
    render: () => (
      <View style={[fill, styles.center]}>
        <GradientText gradient={<SilkGradient />} style={styles.display}>
          Gradients
        </GradientText>
      </View>
    ),
  },
  {
    id: 'transitions',
    name: 'Prop transitions',
    detail: 'New colors every 250 ms with a spring',
    render: () => <PropStress />,
  },
  {
    id: 'grid-12',
    name: '12 animated views',
    detail: 'Mixed kinds, one view each',
    render: () => <TileGrid count={12} />,
  },
  {
    id: 'grid-24',
    name: '24 animated views',
    detail: 'Mixed kinds, one view each',
    render: () => <TileGrid count={24} />,
  },
];

const styles = StyleSheet.create({
  night: {
    backgroundColor: '#020617',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  display: {
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: -2,
  },
});
