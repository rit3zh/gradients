'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { liquidMetalFragmentShader, ShaderMount } from '@paper-design/shaders';
import { ArrowRight, MoveRight } from 'lucide';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

// Paper Shaders' liquid metal, running as the rim of a black pill. Adapted
// from a v0 "LiquidMetalButton": the same layers, shader settings, hover
// speed-up, press and ripple, as a Next.js link of any size.

const EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const SPEED = { rest: 0.6, hover: 1, click: 2.4 };
// How much of the metal shows around the face, in pixels.
const RIM = 1.5;

const UNIFORMS = {
  // Polished platinum: crisp, high-contrast bands and almost no colour
  // splitting, so the rim reads as solid metal rather than a rainbow.
  u_repetition: 4,
  u_softness: 0.4,
  u_shiftRed: 0.1,
  u_shiftBlue: 0.1,
  u_distortion: 0.1,
  u_contour: 0.4,
  u_angle: 60,
  u_scale: 8,
  u_shape: 1,
  u_offsetX: 0.1,
  u_offsetY: -0.1,
  // Transparent behind, and a soft champagne tint over the chrome.
  u_colorBack: [0, 0, 0, 0],
  u_colorTint: [1, 0.92, 0.8, 0.55],
};

const CANVAS_CSS = `
.liquid-metal-shader canvas {
	position: absolute !important;
	inset: 0 !important;
	width: 100% !important;
	height: 100% !important;
	display: block !important;
	border-radius: 100px !important;
}
@keyframes liquid-metal-ripple {
	from { transform: translate(-50%, -50%) scale(0); opacity: 0.6; }
	to { transform: translate(-50%, -50%) scale(4); opacity: 0; }
}`;

export function LiquidMetalLink({
  href,
  label,
  arrow = false,
  width = 192,
  height = 48,
  className,
}: {
  href: string;
  label: string;
  /** An arrow after the label that stretches while hovered. */
  arrow?: boolean;
  width?: number;
  height?: number;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const shaderHost = useRef<HTMLDivElement>(null);
  const shader = useRef<ShaderMount | null>(null);
  const hoveredRef = useRef(false);
  const rippleId = useRef(0);

  useEffect(() => {
    if (!document.getElementById('liquid-metal-css')) {
      const style = document.createElement('style');
      style.id = 'liquid-metal-css';
      style.textContent = CANVAS_CSS;
      document.head.appendChild(style);
    }
    const host = shaderHost.current;
    if (!host) return;
    try {
      shader.current = new ShaderMount(
        host,
        liquidMetalFragmentShader,
        UNIFORMS,
        undefined,
        SPEED.rest
      );
    } catch {
      // No WebGL: the black pill and its label still stand on their own.
    }
    return () => {
      shader.current?.dispose();
      shader.current = null;
    };
  }, []);

  const hover = (on: boolean) => {
    hoveredRef.current = on;
    setHovered(on);
    if (!on) setPressed(false);
    shader.current?.setSpeed(on ? SPEED.hover : SPEED.rest);
  };

  const click = (event: MouseEvent<HTMLAnchorElement>) => {
    shader.current?.setSpeed(SPEED.click);
    setTimeout(() => shader.current?.setSpeed(hoveredRef.current ? SPEED.hover : SPEED.rest), 300);
    const rect = event.currentTarget.getBoundingClientRect();
    const ripple = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      id: rippleId.current++,
    };
    setRipples((list) => [...list, ripple]);
    setTimeout(() => setRipples((list) => list.filter((item) => item.id !== ripple.id)), 600);
  };

  const size = { width, height };
  // Flat layers stacked by z-index: no 3D transforms, so the label stays crisp.
  const layer = (extra = '') =>
    ({
      position: 'absolute',
      inset: 0,
      ...size,
      transition: `transform 0.5s ${EASE}`,
      transform: extra || undefined,
    }) as const;
  const press = pressed ? 'translateY(1px) scale(0.98)' : 'translateY(0) scale(1)';

  return (
    <div className={cn('relative inline-block', className)}>
      <div style={{ position: 'relative', ...size }}>
        {/* The label, above the face. */}
        <div
          style={{ ...layer(), zIndex: 30, pointerEvents: 'none' }}
          className="flex items-center justify-center gap-2 text-[15px] font-medium whitespace-nowrap text-[#f3eee6] [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
          {label}
          {arrow && <Icon icon={hovered ? MoveRight : ArrowRight} className="size-4" />}
        </div>

        {/* The black face, inset by the rim. */}
        <div style={{ ...layer(press), zIndex: 20 }}>
          <div
            style={{
              width: width - 2 * RIM,
              height: height - 2 * RIM,
              margin: RIM,
              borderRadius: 100,
              background: 'linear-gradient(180deg, #2a2723 0%, #0e0d0c 55%, #050505 100%)',
              boxShadow: pressed
                ? 'inset 0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(0,0,0,0.3)'
                : 'inset 0 1px 0 rgba(255,244,228,0.1)',
              transition: `all 0.8s ${EASE}, box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)`,
            }}
          />
        </div>

        {/* The liquid metal, which shows only as the rim around the face. */}
        <div style={{ ...layer(press), zIndex: 10 }}>
          <div
            style={{
              ...size,
              borderRadius: 100,
              transition: `all 0.8s ${EASE}, box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)`,
              boxShadow: pressed
                ? '0 1px 2px rgba(0,0,0,0.25)'
                : hovered
                  ? '0 10px 24px -8px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.15)'
                  : '0 8px 20px -10px rgba(0,0,0,0.28), 0 1px 3px rgba(0,0,0,0.12)',
            }}>
            <div
              ref={shaderHost}
              className="liquid-metal-shader relative overflow-hidden"
              style={{ ...size, borderRadius: 100 }}
            />
          </div>
        </div>

        {/* The link itself, on top, so it gets every click and keyboard press. */}
        <Link
          href={href}
          onClick={click}
          onPointerEnter={() => hover(true)}
          onPointerLeave={() => hover(false)}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          className="absolute inset-0 z-40 overflow-hidden rounded-full outline-offset-4 focus-visible:outline-2 focus-visible:outline-solid">
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              aria-hidden
              className="pointer-events-none absolute size-5 rounded-full"
              style={{
                left: ripple.x,
                top: ripple.y,
                background:
                  'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)',
                animation: 'liquid-metal-ripple 0.6s ease-out',
              }}
            />
          ))}
          <span className="sr-only">{label}</span>
        </Link>
      </div>
    </div>
  );
}
