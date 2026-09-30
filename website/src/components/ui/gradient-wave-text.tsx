"use client";

import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

// Adapted from spell-ui's Gradient Wave Text (inspo/spell-ui/registry/spell-ui/gradient-wave-text.tsx):
// inline, so it can sit inside a headline, and looping with a rest between waves.

/**
 * The brand palette, the same one the logo uses. It reads the --brand-*
 * colours, so when the palette changes the wave glides with it. Amber is
 * deepened in light mode so it holds up on white.
 */
const BRAND = [
	"var(--brand-a)",
	"color-mix(in oklab, var(--brand-a), var(--brand-b))",
	"var(--brand-b)",
	"color-mix(in oklab, var(--brand-b), light-dark(color-mix(in oklab, var(--brand-c), #000 22%), var(--brand-c)))",
	"light-dark(color-mix(in oklab, var(--brand-c), #000 22%), var(--brand-c))",
];

// Where the wave's rings end, in gradient percent: far enough to clear the text.
const RANGE = 190;

/**
 * Text that rings of colour rise through from below, like light through
 * glass, then settle back to the text colour before the next wave. The rings
 * blend into each other in oklab and feather in and out over long edges, and
 * a blurred copy lets the colour bloom softly past the letters.
 */
export function GradientWaveText({
	children,
	colors = BRAND,
	speed = 0.9,
	rest = 2400,
	// After the headline has finished blurring in.
	delay = 3200,
	bandGap = 6,
	className,
}: {
	children: ReactNode;
	colors?: string[];
	/** Gradient percent per frame at 60fps. */
	speed?: number;
	/** Milliseconds of plain text between waves. */
	rest?: number;
	/** Milliseconds before the first wave. */
	delay?: number;
	/** Gradient percent between neighbouring rings. */
	bandGap?: number;
	className?: string;
}) {
	const ref = useRef<HTMLSpanElement>(null);
	const reduceMotion = useReducedMotion();

	const { backgroundImage, start } = useMemo(() => {
		const fade = bandGap * 3;
		const at = (offset: number) => `calc((var(--gi) + ${offset}) * 1%)`;
		const rings = colors.map((color, index) => `${color} ${at(fade + index * bandGap)}`);
		const end = fade * 2 + (colors.length - 1) * bandGap;
		return {
			backgroundImage: `radial-gradient(circle at 50% bottom in oklab, transparent ${at(0)}, ${rings.join(", ")}, transparent ${at(end)})`,
			// Start with every ring still below the text.
			start: -end,
		};
	}, [colors, bandGap]);

	useEffect(() => {
		const element = ref.current;
		if (!element || reduceMotion) return;

		let frame = 0;
		let visible = false;
		let position = start;
		let waitUntil = performance.now() + delay;
		let last = performance.now();

		const tick = (now: number) => {
			const dt = Math.min(64, now - last);
			last = now;
			if (now >= waitUntil) {
				position += (dt * speed) / 16.667;
				if (position >= RANGE) {
					position = start;
					waitUntil = now + rest;
				}
				element.style.setProperty("--gi", position.toFixed(2));
			}
			frame = visible ? requestAnimationFrame(tick) : 0;
		};

		// Only runs while on screen; off screen it costs nothing.
		const observer = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			if (visible && !frame) {
				last = performance.now();
				frame = requestAnimationFrame(tick);
			}
		});
		observer.observe(element);
		return () => {
			observer.disconnect();
			cancelAnimationFrame(frame);
		};
	}, [reduceMotion, speed, rest, delay, start]);

	const layer: CSSProperties = {
		position: "absolute",
		top: 0,
		left: 0,
		backgroundImage,
		WebkitBackgroundClip: "text",
		backgroundClip: "text",
		WebkitTextFillColor: "transparent",
		color: "transparent",
		// Room below the baseline so the wave's origin sits under the letters.
		paddingBottom: "0.4em",
		paddingInline: 2,
		marginInline: -2,
		whiteSpace: "nowrap",
		pointerEvents: "none",
		userSelect: "none",
	};

	// The word in its normal colour underneath, always visible; a softly blurred
	// copy of the wave for bloom; and a crisp copy on top. If a browser can't
	// resolve the gradient, only the wave layers go blank and the word stays.
	return (
		<span ref={ref} className={cn("relative inline-block", className)} style={{ "--gi": start } as CSSProperties}>
			{children}
			<span aria-hidden style={{ ...layer, filter: "blur(0.07em)", opacity: 0.5 }}>
				{children}
			</span>
			<span aria-hidden style={layer}>
				{children}
			</span>
		</span>
	);
}
