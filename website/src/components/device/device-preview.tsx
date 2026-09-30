"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Code, CodeXml, Pause, Play } from "lucide";
import { AndroidIcon, AppleIcon } from "@/components/icons";
import { Icon as MorphingIcon } from "@/components/ui/icon";
import type { GradientLayer, GradientScene, Transition } from "@/lib/engine";
import { createLayerState } from "@/lib/engine/layer/layer-state";
import { isLayerAnimated } from "@/lib/engine/programs/registry";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import { DeviceFrame, type Device } from "./device-frame";
import { Screen, type Demo } from "./screens";

export interface DevicePreviewProps {
	/** A single layer, like the props of one gradient component. */
	gradient?: GradientLayer;
	/** Several layers, like a `GradientStack`. */
	layers?: GradientLayer[];
	/**
	 * With `gradient`: partial prop sets merged onto it, as on a single
	 * gradient component. With `layers`: complete layer lists.
	 */
	keyframes?: (Partial<GradientLayer> | GradientLayer[])[];
	transition?: Transition;
	loop?: boolean;
	grain?: number;
	dither?: boolean;
	/** Swaps the gradient for the next entry every `interval` ms, like a prop change. */
	cycle?: GradientLayer[];
	interval?: number;
	demo?: Demo;
	/** Text for the `text` demo. */
	text?: string;
	border?: { width: number; radius: number };
	backdrop?: string;
	/** Hide the lock screen clock. */
	lock?: boolean;
	/** Status bar and clock color. */
	tone?: "light" | "dark";
	devices?: "both" | "ios" | "android";
	/** Pointer tilt stands in for device motion. */
	interactive?: boolean;
	caption?: ReactNode;
	/** Heading over the code below the preview. */
	label?: string;
	children?: ReactNode;
}

const PLATFORMS = [
	{ device: "iphone", id: "ios", label: "iOS", engine: "Metal", Icon: AppleIcon },
	{ device: "pixel", id: "android", label: "Android", engine: "OpenGL ES", Icon: AndroidIcon },
] as const;

export function DevicePreview({
	gradient,
	layers,
	keyframes,
	transition,
	loop,
	grain,
	dither,
	cycle,
	interval = 2800,
	demo = "wallpaper",
	text = "Aa",
	border = { width: 4, radius: 22 },
	backdrop,
	lock = true,
	tone = "light",
	devices = "both",
	interactive = false,
	caption,
	label = "Usage",
	children,
}: DevicePreviewProps) {
	const [paused, setPaused] = useState(false);
	const [platform, setPlatform] = useState<"ios" | "android">(devices === "android" ? "android" : "ios");
	const [step, setStep] = useState(0);
	const [animated, setAnimated] = useState(Boolean(keyframes?.length || cycle?.length));
	const reduceMotion = useReducedMotion();

	// Stands in for a parent re-rendering with new props.
	useEffect(() => {
		if (!cycle?.length || paused || reduceMotion) return;
		const timer = setInterval(() => setStep((value) => (value + 1) % cycle.length), interval);
		return () => clearInterval(timer);
	}, [cycle, interval, paused, reduceMotion]);

	const base = cycle?.length ? [cycle[step % cycle.length]] : (layers ?? (gradient ? [gradient] : []));
	const frames = keyframes?.map((frame) =>
		Array.isArray(frame) ? frame : [{ ...base[0], ...frame } as GradientLayer],
	);
	// GradientCanvas compares scenes by value, so a fresh object per render is fine.
	const scene: GradientScene = {
		layers: base,
		keyframes: frames,
		transition,
		loop,
		grain,
		dither,
		border: demo === "border" ? border : undefined,
	};
	const sceneKey = JSON.stringify(scene);

	// Only offer pause when something actually moves.
	useEffect(() => {
		if (animated) return;
		const { layers: current } = JSON.parse(sceneKey) as GradientScene;
		// eslint-disable-next-line react-hooks/set-state-in-effect -- needs the browser's color parser
		setAnimated(current.some((layer) => isLayerAnimated(createLayerState(layer))));
	}, [sceneKey, animated]);

	const shown = PLATFORMS.filter((entry) => devices === "both" || entry.id === devices);

	return (
		<div className="my-8">
			<figure className="overflow-hidden rounded-2xl">
				<div className="stage-dots relative bg-stage px-4 pt-12 pb-6 sm:px-8 sm:pt-10">
					{/* On phones one device at a time; the other stays mounted but costs nothing off screen. */}
					{shown.length > 1 && (
						<div role="tablist" aria-label="Platform" className="absolute top-3 left-3 flex rounded-full bg-background/80 p-0.5 backdrop-blur-md sm:hidden">
							{shown.map(({ id, label }) => (
								<button
									key={id}
									type="button"
									role="tab"
									aria-selected={platform === id}
									onClick={() => setPlatform(id)}
									className={cn(
										"h-7 rounded-full px-3 text-xs font-medium transition-[background-color,color] duration-150",
										platform === id ? "bg-foreground text-background" : "text-muted-foreground",
									)}
								>
									{label}
								</button>
							))}
						</div>
					)}
					{animated && !reduceMotion && (
						<button
							type="button"
							onClick={() => setPaused((value) => !value)}
							aria-label={paused ? "Play" : "Pause"}
							className="absolute top-3 right-3 z-20 grid size-8 place-items-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-md outline-offset-2 transition-[color,scale] duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid active:scale-[0.96]"
						>
							<MorphingIcon icon={paused ? Play : Pause} className="size-3.5" />
						</button>
					)}

					<div className="flex items-end justify-center gap-6 sm:gap-12">
						{shown.map(({ device, id, label, engine, Icon }) => (
							<div key={id} className={cn("flex flex-col items-center gap-3", shown.length > 1 && platform !== id && "max-sm:hidden")}>
								<DeviceFrame device={device as Device} ink={tone === "light" ? "light" : "dark"} className="[--device-h:min(440px,62vh)]">
									<Screen
										device={device as Device}
										scene={scene}
										demo={demo}
										paused={paused}
										interactive={interactive}
										backdrop={backdrop}
										lock={lock}
										tone={tone}
										text={text}
									/>
								</DeviceFrame>
								<figcaption className="flex items-center gap-1.5 text-xs text-muted-foreground">
									<Icon className="size-3" />
									{label}
									<span className="opacity-50">·</span>
									{engine}
								</figcaption>
							</div>
						))}
					</div>
					{(caption || interactive) && (
						<p className="mt-4 text-center text-xs text-muted-foreground">{caption ?? "Move the pointer over a phone to tilt it."}</p>
					)}
				</div>
			</figure>
			{/* The code stands apart from the stage, under its own label. */}
			{children && (
				<section aria-label={label} className="mt-6">
					<p data-morph-host className="mb-3 flex items-center gap-2 text-[13px] font-medium text-foreground">
						<MorphingIcon icon={Code} hover={CodeXml} className="size-3.5 text-muted-foreground" />
						{label}
					</p>
					<div className="[&>*]:my-0">{children}</div>
				</section>
			)}
		</div>
	);
}
