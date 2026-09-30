"use client";

import { useCallback } from "react";
import { GradientCanvas } from "@/components/gradient/gradient-canvas";
import type { GradientScene } from "@/lib/engine";
import type { Device } from "./device-frame";
import { LockScreen } from "./lock-screen";

export type Demo = "wallpaper" | "text" | "border" | "mask";

export interface ScreenProps {
	device: Device;
	scene: GradientScene;
	demo: Demo;
	paused: boolean;
	interactive: boolean;
	backdrop?: string;
	lock: boolean;
	tone: "light" | "dark";
	text: string;
}

const fontFamily = () => getComputedStyle(document.body).fontFamily;

/** The screen contents for each kind of demo. */
export function Screen({ device, scene, demo, paused, interactive, backdrop, lock, tone, text }: ScreenProps) {
	// GradientText: the gradient survives only where the glyphs are.
	const maskText = useCallback(
		(context: CanvasRenderingContext2D, width: number, height: number) => {
			const size = width * (text.length <= 2 ? 0.52 : text.length <= 6 ? 0.26 : 0.16);
			context.globalCompositeOperation = "destination-in";
			context.font = `800 ${size}px ${fontFamily()}`;
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillText(text, width / 2, height * 0.46, width * 0.86);
		},
		[text],
	);

	// GradientMask: app-icon silhouettes cut out of one continuous gradient.
	const maskIcons = useCallback((context: CanvasRenderingContext2D, width: number, height: number) => {
		const columns = 4;
		const gap = width * 0.075;
		const icon = (width - gap * (columns + 1)) / columns;
		context.globalCompositeOperation = "destination-in";
		context.beginPath();
		for (let row = 0; row < 6; row++) {
			for (let column = 0; column < columns; column++) {
				const x = gap + column * (icon + gap);
				const y = height * 0.12 + row * (icon + gap * 1.6);
				if (y + icon > height * 0.95) continue;
				context.roundRect(x, y, icon, icon, icon * 0.23);
			}
		}
		context.fill();
	}, []);

	const base = { paused, interactive };

	if (demo === "text" || demo === "mask") {
		return (
			<div className="absolute inset-0" style={{ background: backdrop ?? "#0B0A12" }}>
				<GradientCanvas {...base} scene={scene} decorate={demo === "text" ? maskText : maskIcons} className="absolute inset-0" />
			</div>
		);
	}

	if (demo === "border") {
		return (
			<div className="absolute inset-0" style={{ background: backdrop ?? "#0B0A12" }}>
				<GradientCanvas {...base} scene={scene} className="absolute inset-x-[9%] top-[36%] h-[26%]" />
				<div className="pointer-events-none absolute inset-x-[9%] top-[36%] flex h-[26%] flex-col justify-center px-[9%] text-white">
					<p className="text-[clamp(7px,3.6cqw,10px)] font-medium tracking-wide uppercase opacity-60">Membership</p>
					<p className="mt-1 text-[clamp(11px,7cqw,20px)] font-semibold tracking-tight">Pro, yearly</p>
					<p className="mt-0.5 text-[clamp(8px,4cqw,12px)] opacity-70">Renews on Sep 9</p>
				</div>
			</div>
		);
	}

	return (
		<div className="absolute inset-0" style={{ background: backdrop }}>
			<GradientCanvas {...base} scene={scene} className="absolute inset-0" style={backdrop ? { background: "transparent" } : undefined} />
			{lock && <LockScreen device={device} tone={tone} />}
		</div>
	);
}
