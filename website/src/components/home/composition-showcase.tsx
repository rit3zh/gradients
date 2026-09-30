'use client';

import { useState } from 'react';
import { DeviceFrame } from '@/components/device/device-frame';
import { Screen } from '@/components/device/screens';
import { CodeMorph, type CodeStep } from '@/components/mdx/code/code-morph';
import type { GradientScene } from '@/lib/engine';
import { SectionHeading } from './section-heading';
import { reveal } from '@/lib/reveal';

const SCENE: GradientScene = {
  layers: [
    {
      type: 'mesh',
      rows: 2,
      columns: 3,
      drift: 0.6,
      speed: 0.5,
      colors: ['#3224AE', '#7303C0', '#FF0080', '#EC38BC', '#FF5F6D', '#FFC371'],
    },
    {
      type: 'noise',
      colors: ['#000000', '#FFFFFF'],
      blendMode: 'softLight',
      opacity: 0.35,
      scale: 4,
    },
    { type: 'vignette', intensity: 0.7 },
  ],
};

const MESH = `      <MeshGradient
        rows={2}
        columns={3}
        drift={0.6}
        speed={0.5}
        colors={palette}
      />`;
const NOISE = `      <NoiseGradient
        colors={['#000', '#fff']}
        blendMode="softLight"
        opacity={0.35}
        scale={4}
      />`;
const VIGNETTE = `      <VignetteGradient intensity={0.7} />`;

function wallpaper(names: string[], layers: string[]) {
  return `import {
  GradientStack,
${names.map((name) => `  ${name},`).join('\n')}
} from '@rit3zh/gradients';

export function Wallpaper() {
  return (
    <GradientStack style={StyleSheet.absoluteFill}>
${layers.join('\n')}
    </GradientStack>
  );
}`;
}

// Each step adds one layer; the phone shows exactly the layers in the code.
const STEPS: CodeStep[] = [
  { label: 'Mesh', title: 'A drifting mesh on its own', code: wallpaper(['MeshGradient'], [MESH]) },
  {
    label: '+ Grain',
    title: 'Soft-light grain on top, in the same pass',
    code: wallpaper(['MeshGradient', 'NoiseGradient'], [MESH, NOISE]),
  },
  {
    label: '+ Vignette',
    title: 'A vignette to finish; still one draw call',
    code: wallpaper(['MeshGradient', 'NoiseGradient', 'VignetteGradient'], [MESH, NOISE, VIGNETTE]),
  },
];

export function CompositionShowcase() {
  const [step, setStep] = useState(0);
  const scene: GradientScene = { layers: SCENE.layers.slice(0, step + 1) };

  return (
    <section>
      {/* Heading, phone, code: in that order on phones; on wide screens the
			    phone moves beside the other two, pinned to the top so it holds
			    still while the code grows and shrinks between steps. */}
      <div className="mx-auto grid max-w-6xl items-center gap-x-14 gap-y-10 sm:gap-y-12 px-4 py-16 sm:px-6 sm:py-28 lg:grid-cols-[1.2fr_1fr] lg:grid-rows-[auto_1fr]">
        <SectionHeading
          eyebrow="Composition"
          title="Layers, blended in one pass."
          className="lg:self-end">
          A drifting mesh, soft-light grain and a vignette. Three gradients, eighteen blend modes to
          choose from, and a single draw call to put them on screen.
        </SectionHeading>
        <div
          {...reveal(2)}
          className="flex justify-center lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start lg:mt-24">
          <DeviceFrame
            device="iphone"
            className="[--device-h:min(460px,100vw)] lg:[--device-h:560px]">
            <Screen
              device="iphone"
              scene={scene}
              demo="wallpaper"
              paused={false}
              interactive={false}
              lock
              tone="light"
              text=""
            />
          </DeviceFrame>
        </div>
        <div {...reveal(3)} className="min-w-0 self-start">
          <CodeMorph steps={STEPS} onStepChange={setStep} />
        </div>
      </div>
    </section>
  );
}
