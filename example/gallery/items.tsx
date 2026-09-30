import {
  AuroraGradient,
  BilinearGradient,
  ConicGradient,
  DiamondGradient,
  FluxGradient,
  FreeformGradient,
  GlowGradient,
  GradientBorder,
  GradientStack,
  GradientText,
  HolographicGradient,
  InterlaceGradient,
  IridescentGradient,
  LinearGradient,
  LiquidGradient,
  MeshGradient,
  NoiseGradient,
  RadialGradient,
  ReflectedGradient,
  RibbonGradient,
  SilkGradient,
  SkyGradient,
  SmokeGradient,
  SpotlightGradient,
  StrataGradient,
  SweepGradient,
  VignetteGradient,
  VoronoiGradient,
  WaveGradient,
} from '@rit3zh/gradients';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { NativeMeshDemo } from './NativeMeshDemo';
import { TransitionDemo } from './TransitionDemo';

export interface IGalleryItem {
  name: string;
  category: string;
  caption: string;
  background?: string;
  render: (active: boolean) => ReactNode;
}

const fill = StyleSheet.absoluteFill;

export const Items: IGalleryItem[] = [
  {
    name: 'Linear',
    category: 'Geometric',
    caption: 'Angle or start/end points, with slow spin.',
    render: (active) => (
      <LinearGradient
        style={fill}
        paused={!active}
        colors={['#833AB4', '#FD1D1D', '#FCB045']}
        spin={12}
      />
    ),
  },
  {
    name: 'Radial',
    category: 'Geometric',
    caption: 'Circle or ellipse from any center.',
    render: (active) => (
      <RadialGradient
        style={fill}
        paused={!active}
        radius={1.45}
        grain={0.8}
        flow={0.8}

        colors={['#FDEFF9', '#ec38e3', '#3b095c', '#03001E']}
      />
    ),
  },
  {
    name: 'Conic',
    category: 'Geometric',
    caption: 'Angular sweep around a center.',
    render: (active) => (
      <ConicGradient
        style={fill}
        paused={!active}
        colors={['#FC00FF', '#7303C0', '#FF0080', '#FF5F6D', '#FC00FF']}
        spin={20}
      />
    ),
  },
  {
    name: 'Sweep',
    category: 'Geometric',
    caption: 'A rotating arc between two angles.',
    background: '#0F0C29',
    render: (active) => (
      <SweepGradient
        style={fill}
        paused={!active}
        center={[0.5, 0.55]}
        startAngle={-135}
        endAngle={135}

        colors={['#FC5C7D', '#C471ED', '#6A82FB']}
        spin={45}
      />
    ),
  },
  {
    name: 'Diamond',
    category: 'Geometric',
    caption: 'Four-point falloff with flowing colors.',
    render: (active) => (
      <DiamondGradient
        style={fill}
        paused={!active}
        colors={['#FDB99B', '#CF8BF3', '#A770EF']}
        flow={0.15}
      />
    ),
  },
  {
    name: 'Reflected',
    category: 'Geometric',
    caption: 'Mirrored around a soft center line.',
    render: (active) => (
      <ReflectedGradient style={fill} paused={!active} colors={['#3224AE', '#FF66FF', '#FFC371']} />
    ),
  },
  {
    name: 'Mesh',
    category: 'Surface',
    caption: 'Bicubic mesh with drifting control points.',
    render: (active) => (
      <MeshGradient
        style={fill}
        paused={!active}
        rows={3}
        columns={3}
        drift={0.9}
        speed={0.6}
        colors={[
          '#7303C0',
          '#FF0080',
          '#FCB045',
          '#3224AE',
          '#EC38BC',
          '#FF5F6D',
          '#6A82FB',
          '#C471ED',
          '#FD1D1D',
        ]}
      />
    ),
  },
  {
    name: 'Native Mesh',
    category: 'Surface',
    caption: 'SwiftUI MeshGradient on iOS, Canvas vertices on Android.',
    render: (active) => <NativeMeshDemo active={active} />,
  },
  {
    name: 'Freeform',
    category: 'Surface',
    caption: 'Color points blended by distance.',
    render: (active) => (
      <FreeformGradient
        style={fill}
        paused={!active}
        points={[
          [0.2, 0.2],
          [0.8, 0.25],
          [0.3, 0.75],
          [0.75, 0.8],
        ]}
        colors={['#FF0080', '#7303C0', '#FF8C00', '#3224AE']}
        drift={0.7}
        speed={0.5}
      />
    ),
  },
  {
    name: 'Bilinear',
    category: 'Surface',
    caption: 'One color per corner.',
    render: () => (
      <BilinearGradient
        style={fill}
        smoothness={1}
        colors={['#FC5C7D', '#FFC371', '#6A82FB', '#C471ED']}
      />
    ),
  },
  {
    name: 'Voronoi',
    category: 'Surface',
    caption: 'Soft cells that slowly wander.',
    render: (active) => (
      <VoronoiGradient
        style={fill}
        paused={!active}
        cells={9}
        smoothness={0.45}
        drift={0.6}
        speed={0.5}
        colors={['#FF0080', '#FF5F6D', '#C471ED', '#7303C0', '#EC38BC']}
      />
    ),
  },
  {
    name: 'Noise',
    category: 'Procedural',
    caption: 'Fractal noise mapped through your stops.',
    render: (active) => (
      <NoiseGradient
        style={fill}
        paused={!active}
        speed={0.3}
        colors={['#23074D', '#B06AB3', '#FF5F6D']}
      />
    ),
  },
  {
    name: 'Aurora',
    category: 'Procedural',
    caption: 'Curtains of light over the night.',
    background: '#03001E',
    render: (active) => (
      <AuroraGradient style={fill} paused={!active} colors={['#7303C0', '#EC38BC', '#FF0080']} />
    ),
  },
  {
    name: 'Liquid',
    category: 'Procedural',
    caption: 'Domain-warped, glossy flow.',
    render: (active) => (
      <LiquidGradient
        style={fill}
        paused={!active}
        speed={0.6}
        colors={['#3224AE', '#EC38BC', '#FF5F6D', '#FFC371']}
      />
    ),
  },
  {
    name: 'Iridescent',
    category: 'Procedural',
    caption: 'Thin-film color with a moving sheen.',
    render: (active) => <IridescentGradient style={fill} paused={!active} speed={0.5} />,
  },
  {
    name: 'Holographic',
    category: 'Procedural',
    caption: 'Iridescence that follows device tilt.',
    render: (active) => <HolographicGradient style={fill} paused={!active} deviceMotion={active} />,
  },
  {
    name: 'Wave',
    category: 'Flow',
    caption: 'Layered swells rolling sideways.',
    render: (active) => (
      <WaveGradient style={fill} paused={!active} colors={['#12C2E9', '#C471ED', '#F64F59']} />
    ),
  },
  {
    name: 'Silk',
    category: 'Flow',
    caption: 'Folded fabric with a soft sheen.',
    render: (active) => (
      <SilkGradient
        style={fill}
        paused={!active}
        speed={0.7}
        colors={['#240B36', '#7303C0', '#FF66FF']}
      />
    ),
  },
  {
    name: 'Smoke',
    category: 'Flow',
    caption: 'Plumes twisting through each other.',
    render: (active) => (
      <SmokeGradient
        style={fill}
        paused={!active}
        speed={0.5}
        colors={['#03001E', '#7303C0', '#EC38BC', '#FDEFF9']}
      />
    ),
  },
  {
    name: 'Ribbon',
    category: 'Flow',
    caption: 'Twisting, shaded bands.',
    render: (active) => (
      <RibbonGradient style={fill} paused={!active} colors={['#C31432', '#FF0080', '#FFC371']} />
    ),
  },
  {
    name: 'Flux',
    category: 'Flow',
    caption: 'A slow, turbulent blend.',
    render: (active) => (
      <FluxGradient style={fill} paused={!active} colors={['#FF0080', '#7303C0', '#FF8C00']} />
    ),
  },
  {
    name: 'Interlace',
    category: 'Flow',
    caption: 'A cosine sheet woven with fine lines.',
    render: (active) => (
      <InterlaceGradient style={fill} paused={!active} colors={['#4568DC', '#B06AB3', '#FF5F6D']} />
    ),
  },
  {
    name: 'Strata',
    category: 'Flow',
    caption: 'Layered ridges drifting past.',
    render: (active) => (
      <StrataGradient
        style={fill}
        paused={!active}
        colors={['#23074D', '#833AB4', '#FD1D1D', '#FCB045']}
      />
    ),
  },
  {
    name: 'Sky',
    category: 'Lighting',
    caption: 'Atmospheric falloff through a wide lens.',
    render: () => <SkyGradient style={fill} preset="dusk" />,
  },
  {
    name: 'Glow',
    category: 'Lighting',
    caption: 'A breathing light source.',
    background: '#0F0C29',
    render: (active) => (
      <GlowGradient
        style={fill}
        paused={!active}
        radius={1.1}
        speed={1}
        colors={['#FF66FF', '#7303C0', '#0F0C29']}
      />
    ),
  },
  {
    name: 'Spotlight',
    category: 'Lighting',
    caption: 'A swaying cone of light.',
    background: '#0F0C29',
    render: (active) => (
      <SpotlightGradient
        style={fill}
        paused={!active}
        speed={1}
        spread={36}
        colors={['#FDEFF9', '#EC38BC', '#0F0C29']}
      />
    ),
  },
  {
    name: 'Vignette',
    category: 'Lighting',
    caption: 'Rounded falloff toward the edges.',
    background: '#EC38BC',
    render: () => <VignetteGradient style={fill} radius={0.35} />,
  },
  {
    name: 'Stack',
    category: 'Composition',
    caption: 'Layers blended in a single pass.',
    render: (active) => (
      <GradientStack style={fill} paused={!active}>
        <MeshGradient
          rows={2}
          columns={3}
          drift={0.6}
          speed={0.5}
          colors={['#3224AE', '#7303C0', '#FF0080', '#EC38BC', '#FF5F6D', '#FFC371']}
        />
        <NoiseGradient
          colors={['#000000', '#FFFFFF']}
          blendMode="softLight"
          opacity={0.35}
          scale={4}
        />
        <VignetteGradient intensity={0.7} />
      </GradientStack>
    ),
  },
  {
    name: 'Text',
    category: 'Composition',
    caption: 'Any gradient, masked to type.',
    background: '#0F0C29',
    render: (active) => (
      <View style={styles.center}>
        <GradientText
          gradient={<SilkGradient speed={0.8} colors={['#FC00FF', '#FF5F6D', '#FFC371']} />}
          paused={!active}
          style={styles.glyph}>
          Aa
        </GradientText>
      </View>
    ),
  },
  {
    name: 'Border',
    category: 'Composition',
    caption: 'Animated gradient outlines.',
    background: '#0F0C29',
    render: (active) => (
      <GradientBorder
        gradient={
          <ConicGradient
            spin={10}
            colors={['#FC00FF', '#FF0080', '#FFC371', '#833AB4', '#FC00FF']}
          />
        }
        paused={!active}
        width={4}
        radius={50}
        style={styles.outline}
      />
    ),
  },
  {
    name: 'Transition',
    category: 'Animation',
    caption: 'Springs between palettes as props change.',
    render: (active) => <TransitionDemo active={active} />,
  },
  {
    name: 'Keyframes',
    category: 'Animation',
    caption: 'Native sequences, looping forever.',
    render: (active) => (
      <LinearGradient
        style={fill}
        paused={!active}
        angle={160}
        colors={['#833AB4', '#FD1D1D', '#FCB045']}
        keyframes={[
          { colors: ['#FC5C7D', '#6A82FB', '#C471ED'], angle: 220 },
          { colors: ['#FF5F6D', '#FFC371', '#FF0080'], angle: 120 },
        ]}
        transition={{ duration: 2400, easing: 'smooth' }}
      />
    ),
  },
];

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  glyph: {
    fontSize: 120,
    fontWeight: '800',
    letterSpacing: -1,
  },
  outline: {
    position: 'absolute',
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  },
  inner: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#0F0C29',
  },
});
