import { Fragment, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, MoveRight } from 'lucide';
import { Icon } from '@/components/ui/icon';
import { GradientWaveText } from '@/components/ui/gradient-wave-text';
import { InstallCommand } from '@/components/shared/install-command';
import { HeroDevices } from './hero-devices';
import { LiquidMetalLink } from './liquid-metal-link';
import { FlowButton } from '@/components/flow-button';

// The headline after its first word, each word blurring into focus in turn.
const TITLE_REST = ['drawn', 'by', 'the', 'GPU.'];

// Everything in the hero blurs in on load, one piece after another: the
// pill, each headline word, the line below, the buttons, install, phones.
const step = (i: number) => ({ '--i': i }) as CSSProperties;

export function Hero() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 pt-14 pb-8 sm:gap-14 sm:px-6 sm:pt-20 sm:pb-20 lg:pt-24">
      <div className="flex flex-col items-center text-center">
        <Link
          href="/docs/guides/performance"
          style={step(0)}
          className="blur-in group/pill mb-7 flex h-8 max-w-full items-center gap-2 rounded-full bg-surface pr-3 pl-1.5 text-[12.5px] text-muted-foreground transition-colors duration-150 hover:text-foreground sm:text-[13px]">
          <span className="shrink-0 rounded-full bg-foreground px-2 py-0.5 text-[11px] font-medium text-background">
            v0.1
          </span>
          <span className="min-w-0 truncate">Metal on iOS, OpenGL ES on Android</span>
          <Icon icon={ArrowRight} hover={MoveRight} className="size-3" />
        </Link>

        <h1 className="max-w-[14ch] text-[42px] leading-[1.02] font-semibold tracking-[-0.035em] text-balance text-foreground sm:text-6xl lg:text-[72px]">
          <span className="blur-in blur-in-word" style={step(1)}>
            <GradientWaveText>Gradients</GradientWaveText>,
          </span>{' '}
          {TITLE_REST.map((word, index) => (
            <Fragment key={word}>
              <span className="blur-in blur-in-word" style={step(index + 2)}>
                {word}
              </span>{' '}
            </Fragment>
          ))}
        </h1>
        <p style={step(6)} className="blur-in mt-5 max-w-[26rem] text-[16px] leading-relaxed text-pretty text-muted-foreground sm:text-[17px]">
          Twenty-seven native gradients for Expo. Fluid in motion, free when still.
        </p>

        <div className="mt-9 flex flex-row items-center justify-center gap-3">
          <div style={step(7)} className="blur-in">
            <LiquidMetalLink href="/docs" label="Get started" arrow width={160} />
          </div>
          <div style={step(8)} className="blur-in">
            <FlowButton href="/docs/gradients" size="xl">
              Browse gradients
            </FlowButton>
          </div>
        </div>

        <div style={step(9)} className="blur-in mt-6 w-full max-w-[24rem]">
          <InstallCommand className="w-full" />
        </div>
      </div>

      <div style={step(10)} className="blur-in w-full">
        <HeroDevices />
      </div>
    </section>
  );
}
