// The public shapes the web previews accept. They mirror the props of the
// React Native components, so an MDX example and its live preview can share
// one object literal.

export type GradientType =
	| "linear"
	| "radial"
	| "conic"
	| "angular"
	| "sweep"
	| "diamond"
	| "reflected"
	| "mesh"
	| "freeform"
	| "bilinear"
	| "noise"
	| "voronoi"
	| "glow"
	| "spotlight"
	| "vignette"
	| "aurora"
	| "liquid"
	| "iridescent"
	| "holographic"
	| "wave"
	| "silk"
	| "smoke"
	| "ribbon"
	| "flux"
	| "interlace"
	| "sky"
	| "strata";

export type Point = readonly [number, number] | { readonly x: number; readonly y: number };

export type BlendMode =
	| "normal"
	| "multiply"
	| "screen"
	| "overlay"
	| "darken"
	| "lighten"
	| "colorDodge"
	| "colorBurn"
	| "hardLight"
	| "softLight"
	| "difference"
	| "exclusion"
	| "hue"
	| "saturation"
	| "color"
	| "luminosity"
	| "plusLighter"
	| "plusDarker";

export type TileMode = "clamp" | "repeat" | "mirror" | "decal";

export type ColorInterpolation = "srgb" | "linear" | "oklab";

export type EasingName = "linear" | "ease" | "easeIn" | "easeOut" | "easeInOut" | "smooth";

export type Easing = EasingName | readonly [number, number, number, number];

export type SkyPreset = "clear" | "overcast" | "dusk" | "tropical" | "ember" | "verdant";

/** Every option any gradient type understands. Each type reads its own subset. */
export interface GradientOptions {
	colors?: readonly string[];
	stops?: readonly number[];
	interpolation?: ColorInterpolation;
	easing?: Easing;
	opacity?: number;
	blendMode?: BlendMode;
	speed?: number;
	seed?: number;
	spin?: number;
	flow?: number;
	tileMode?: TileMode;
	angle?: number;
	start?: Point;
	end?: Point;
	center?: Point;
	radius?: number;
	shape?: "circle" | "ellipse" | "square" | "fit";
	startAngle?: number;
	endAngle?: number;
	rows?: number;
	columns?: number;
	points?: readonly Point[];
	smoothness?: number;
	drift?: number;
	scale?: number;
	octaves?: number;
	warp?: number;
	contrast?: number;
	cells?: number;
	falloff?: number;
	intensity?: number;
	origin?: Point;
	spread?: number;
	length?: number;
	softness?: number;
	color?: string;
	roundness?: number;
	highlight?: number;
	bands?: number;
	sheen?: number;
	frequency?: number;
	amplitude?: number;
	turbulence?: number;
	count?: number;
	depth?: number;
	ripple?: number;
	paletteMix?: number;
	sparkle?: number;
	density?: number;
	preset?: SkyPreset;
	extinction?: readonly [number, number, number];
	tint?: string;
	horizon?: number;
	fisheye?: number;
	shade?: number;
	offset?: number;
}

export interface GradientLayer extends GradientOptions {
	type: GradientType;
}

export interface TimingTransition {
	type?: "timing";
	duration?: number;
	delay?: number;
	easing?: Easing;
}

export interface SpringTransition {
	type: "spring";
	damping?: number;
	stiffness?: number;
	mass?: number;
	delay?: number;
}

export type Transition = boolean | TimingTransition | SpringTransition;

/** Everything one preview needs: its layers plus the view-level playback props. */
export interface GradientScene {
	layers: readonly GradientLayer[];
	keyframes?: readonly (readonly GradientLayer[])[];
	transition?: Transition;
	loop?: boolean;
	dither?: boolean;
	grain?: number;
	/** Mirrors `GradientBorder`: only a ring of this width is drawn. */
	border?: { width: number; radius: number };
}
