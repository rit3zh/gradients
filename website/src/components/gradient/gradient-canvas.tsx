"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { getHub, GradientView, type GradientScene, type ViewOptions } from "@/lib/engine";
import { fallbackBackground } from "@/lib/engine/fallback";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

export interface GradientCanvasProps {
	scene: GradientScene;
	/** Holds the current frame. Reduced motion always pauses. */
	paused?: boolean;
	/** Pointer position tilts the surface, standing in for device motion. */
	interactive?: boolean;
	decorate?: ViewOptions["decorate"];
	className?: string;
	style?: CSSProperties;
}

/**
 * A live preview running the library's own shaders through WebGL2. Every
 * canvas on the page shares one GL context and one frame loop, and a canvas
 * off screen costs nothing.
 */
export function GradientCanvas({ scene, paused = false, interactive = false, decorate, className, style }: GradientCanvasProps) {
	const container = useRef<HTMLDivElement>(null);
	const canvas = useRef<HTMLCanvasElement>(null);
	const view = useRef<GradientView | null>(null);
	const [ready, setReady] = useState(false);
	const [drawn, setDrawn] = useState(false);
	const reduceMotion = useReducedMotion();

	// Scenes are usually inline object literals; compare them by value.
	const sceneKey = JSON.stringify(scene);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const stableScene = useMemo(() => scene, [sceneKey]);

	useEffect(() => {
		const element = canvas.current;
		const box = container.current;
		if (!element || !box) return;
		const hub = getHub();
		if (!hub.supported) return;

		const instance = new GradientView(element);
		instance.onFirstFrame = () => setDrawn(true);
		view.current = instance;
		hub.attach(instance);

		const resize = new ResizeObserver(([entry]) => {
			instance.width = entry.contentRect.width;
			instance.height = entry.contentRect.height;
			hub.invalidate(instance);
		});
		const visibility = new IntersectionObserver(
			([entry]) => {
				instance.visible = entry.isIntersecting;
				if (entry.isIntersecting) hub.invalidate(instance);
			},
			{ rootMargin: "120px" },
		);
		resize.observe(box);
		visibility.observe(box);
		// eslint-disable-next-line react-hooks/set-state-in-effect -- the canvas only exists client side
		setReady(true);

		return () => {
			resize.disconnect();
			visibility.disconnect();
			hub.detach(instance);
			view.current = null;
		};
	}, []);

	useEffect(() => {
		if (view.current && ready) getHub().setScene(view.current, stableScene);
	}, [stableScene, ready]);

	useEffect(() => {
		const instance = view.current;
		if (!instance) return;
		instance.options = { paused: paused || reduceMotion, decorate };
		getHub().invalidate(instance);
	}, [paused, reduceMotion, decorate, ready]);

	useEffect(() => {
		const box = container.current;
		const instance = view.current;
		if (!interactive || !box || !instance) return;
		const move = (event: PointerEvent) => {
			const rect = box.getBoundingClientRect();
			instance.tiltTarget = [
				((event.clientX - rect.left) / rect.width) * 2 - 1,
				((event.clientY - rect.top) / rect.height) * 2 - 1,
			];
			getHub().schedule();
		};
		const leave = () => {
			instance.tiltTarget = [0, 0];
			getHub().schedule();
		};
		box.addEventListener("pointermove", move);
		box.addEventListener("pointerleave", leave);
		return () => {
			box.removeEventListener("pointermove", move);
			box.removeEventListener("pointerleave", leave);
		};
	}, [interactive, ready]);

	return (
		<div
			ref={container}
			className={cn("relative overflow-hidden", className)}
			// The stand-in goes once the first frame is up, so it never shows
			// through transparent layers, masks or rings.
			style={{ background: drawn || decorate || scene.border ? undefined : fallbackBackground(scene.layers), ...style }}
		>
			<canvas ref={canvas} aria-hidden className="absolute inset-0 size-full" />
		</div>
	);
}
