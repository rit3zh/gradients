// Prop reference for every table in the docs. Defaults are the values the
// library resolves in src/utils/normalize/layer.util.ts and the native records.

export interface PropRow {
	name: string;
	type: string;
	default?: string;
	description: string;
	required?: boolean;
}

const POINT = "[x, y] | { x, y }";

const spin: PropRow = {
	name: "spin",
	type: "number",
	default: "0",
	description: "Rotation in degrees per second, scaled by `speed`.",
};

const flow: PropRow = {
	name: "flow",
	type: "number",
	default: "0",
	description: "Scrolls the colors along the gradient, in gradient lengths per second. A `clamp` tile mode becomes `mirror` so the loop is seamless.",
};

const tileMode = (fallback = "'clamp'"): PropRow => ({
	name: "tileMode",
	type: "'clamp' | 'repeat' | 'mirror' | 'decal'",
	default: fallback,
	description: "What happens past the first and last stop. `decal` leaves it transparent.",
});

const center: PropRow = {
	name: "center",
	type: POINT,
	default: "[0.5, 0.5]",
	description: "Unit coordinates in the view, from the top left.",
};

const angle = (fallback: string, description = "Direction in degrees. 0 points up and angles run clockwise, like CSS."): PropRow => ({
	name: "angle",
	type: "number",
	default: fallback,
	description,
});

const smoothness = (fallback: string, description: string): PropRow => ({
	name: "smoothness",
	type: "number",
	default: fallback,
	description,
});

const drift: PropRow = {
	name: "drift",
	type: "number",
	default: "0",
	description: "How far points wander on their own seeded paths. 0 keeps them still.",
};

const scale: PropRow = { name: "scale", type: "number", default: "1", description: "Zoom of the pattern. Higher values show more, smaller detail." };

export const PROP_TABLES = {
	/* Shared by every gradient. */
	color: [
		{ name: "colors", type: "ColorValue[]", default: "per type", description: "Any React Native color: hex, `rgb()`, `hsl()`, names or `transparent`." },
		{ name: "stops", type: "number[]", description: "One position per color, 0 to 1. Evenly spaced when omitted or when the count doesn't match." },
		{ name: "interpolation", type: "'oklab' | 'srgb' | 'linear'", default: "'oklab'", description: "The color space colors blend in. OKLab keeps midpoints vivid instead of muddy." },
		{ name: "easing", type: "TEasingName | [x1, y1, x2, y2]", default: "'linear'", description: "Curve applied between each pair of stops." },
	],
	composition: [
		{ name: "opacity", type: "number", default: "1", description: "Layer opacity, 0 to 1." },
		{ name: "blendMode", type: "TBlendMode", default: "'normal'", description: "How the layer composites onto the layers below it in a stack." },
	],
	motion: [
		{ name: "speed", type: "number", default: "1", description: "Multiplies every clock-driven motion of the layer. 0 freezes it. Noise, glow and spotlight default to 0; iridescent to 0.35; holographic to 0.4." },
		{ name: "seed", type: "number", default: "0", description: "Picks a different, stable variation of any randomised layout or noise field." },
	],
	playback: [
		{ name: "transition", type: "boolean | ITimingTransition | ISpringTransition", description: "Animates prop changes on the native side. `true` is 600 ms ease-in-out." },
		{ name: "keyframes", type: "Partial<Props>[]", description: "Further prop sets to animate through after the initial props." },
		{ name: "loop", type: "boolean", default: "true", description: "Whether keyframes start over after the last one." },
		{ name: "paused", type: "boolean", default: "false", description: "Freezes all motion. The current frame stays on screen and costs nothing." },
		{ name: "dither", type: "boolean", default: "true", description: "Adds sub-pixel noise that removes banding in smooth gradients." },
		{ name: "grain", type: "number", default: "0", description: "Visible film grain, 0 to 1." },
		{ name: "deviceMotion", type: "boolean", default: "false", description: "Feeds device tilt to the shader. Holographic turns it on by default." },
		{ name: "style", type: "StyleProp<ViewStyle>", description: "The view is a regular `View`: size and position it like one." },
		{ name: "children", type: "ReactNode", description: "Rendered above the gradient." },
	],

	/* Geometric. */
	linear: [
		angle("180"),
		{ name: "start", type: POINT, description: "Unit point where the first color sits. Used together with `end`, instead of `angle`." },
		{ name: "end", type: POINT, description: "Unit point where the last color sits." },
		spin,
		flow,
		tileMode(),
	],
	radial: [
		center,
		{ name: "radius", type: "number", default: "1", description: "1 reaches the farthest corner from the center." },
		{ name: "shape", type: "'circle' | 'ellipse'", default: "'circle'", description: "An ellipse stretches to the view's proportions." },
		flow,
		tileMode(),
	],
	conic: [center, angle("0", "Where the first color starts, in degrees clockwise from the top."), spin, flow, tileMode()],
	sweep: [
		center,
		{ name: "startAngle", type: "number", default: "0", description: "Where the arc begins, in degrees clockwise from the top." },
		{ name: "endAngle", type: "number", default: "360", description: "Where the arc ends. The gap between the ends splits between the first and last color." },
		spin,
		tileMode(),
	],
	diamond: [
		center,
		{ name: "radius", type: "number", default: "1", description: "Size of the diamond relative to the view." },
		angle("0", "Rotation of the diamond in degrees."),
		{ name: "shape", type: "'fit' | 'square'", default: "'fit'", description: "`fit` stretches to the view's proportions; `square` keeps equal sides." },
		spin,
		flow,
		tileMode(),
	],
	reflected: [
		angle("180"),
		{ name: "start", type: POINT, description: "Unit point for the mirror line. Used together with `end`, instead of `angle`." },
		{ name: "end", type: POINT, description: "Unit point where the last color sits." },
		{ name: "softness", type: "number", default: "0.35", description: "Rounds the fold, so the mirror line has no crease." },
		{ name: "offset", type: "number", default: "0", description: "Moves the mirror line along the axis, from -1 to 1." },
		spin,
		flow,
		tileMode(),
	],

	/* Surface. */
	mesh: [
		{ name: "rows", type: "number", default: "3", description: "Control points down the view. At least 2." },
		{ name: "columns", type: "number", default: "3", description: "Control points across the view. At least 2." },
		{ name: "points", type: `(${POINT})[]`, default: "even grid", description: "One unit point per control point, row by row. Ignored unless there are exactly `rows × columns`." },
		smoothness("1", "0 blends each patch linearly; 1 curves through the points with a spline."),
		drift,
	],
	freeform: [
		{ name: "points", type: `(${POINT})[]`, default: "seeded scatter", description: "One unit point per color, up to 32. Without it, points are spread from `seed`." },
		smoothness("0.5", "How far each color reaches before the next takes over."),
		drift,
	],
	bilinear: [smoothness("0", "0 blends linearly between corners; 1 eases in and out of each corner.")],
	voronoi: [
		{ name: "cells", type: "number", default: "8", description: "Number of cells when no `points` are given. Up to 32." },
		{ name: "points", type: `(${POINT})[]`, description: "Explicit cell centers in unit coordinates." },
		smoothness("0.35", "0 gives hard cell edges; higher values melt neighbours together."),
		drift,
	],

	/* Procedural. */
	noise: [
		scale,
		{ name: "octaves", type: "number", default: "4", description: "Layers of detail, 1 to 6." },
		{ name: "warp", type: "number", default: "0.35", description: "Feeds the noise back into itself for swirled, marbled shapes." },
		{ name: "contrast", type: "number", default: "1", description: "Spreads the field across more of the color ramp." },
	],
	aurora: [
		{ name: "bands", type: "number", default: "3", description: "Curtains of light, up to 6. Each takes the next part of the palette." },
		scale,
		{ name: "intensity", type: "number", default: "1", description: "Brightness of the light." },
		{ name: "softness", type: "number", default: "0.5", description: "How gently each curtain fades at its lower edge." },
	],
	liquid: [
		scale,
		{ name: "warp", type: "number", default: "1.8", description: "Strength of the domain warp. Higher values fold the flow tighter." },
		{ name: "highlight", type: "number", default: "0.25", description: "Glossy highlights on the ridges." },
	],
	iridescent: [
		angle("135", "Direction the film thickness changes along."),
		{ name: "bands", type: "number", default: "1.4", description: "How many color cycles cross the view." },
		{ name: "sheen", type: "number", default: "0.8", description: "Strength of the moving highlight band." },
		{ name: "warp", type: "number", default: "0.8", description: "How much the film ripples." },
		{ name: "paletteMix", type: "number", default: "0, or 0.7 with colors", description: "Blends your `colors` into the natural thin-film spectrum." },
		spin,
	],
	holographic: [
		angle("120", "Direction of the diffraction grating."),
		{ name: "bands", type: "number", default: "1.2", description: "How many spectrum cycles cross the view." },
		{ name: "sparkle", type: "number", default: "0.9", description: "Density of the glints that catch the light." },
		{ name: "sheen", type: "number", default: "0.55", description: "Strength of the bright band that follows tilt." },
		{ name: "warp", type: "number", default: "0.8", description: "How much the foil ripples." },
		{ name: "paletteMix", type: "number", default: "0, or 0.7 with colors", description: "Tints the foil with your `colors`." },
		spin,
	],

	/* Flow. */
	wave: [
		angle("0", "Direction the swells travel across."),
		{ name: "frequency", type: "number", default: "1", description: "How many swells fit across the view." },
		{ name: "amplitude", type: "number", default: "1", description: "Height of the swells." },
		smoothness("1", "Eases the color transition across each swell."),
		spin,
	],
	silk: [scale, { name: "sheen", type: "number", default: "0.25", description: "Highlight along the folds." }],
	smoke: [scale, { name: "turbulence", type: "number", default: "0.6", description: "How much the plumes twist." }],
	ribbon: [
		angle("-20", "Direction the ribbons run."),
		{ name: "count", type: "number", default: "4", description: "Number of ribbons." },
		scale,
		{ name: "depth", type: "number", default: "0.6", description: "Shading across each ribbon's fold." },
		spin,
		tileMode("'mirror'"),
	],
	flux: [
		{ name: "turbulence", type: "number", default: "1", description: "How strongly the field swirls." },
		{ name: "ripple", type: "number", default: "1", description: "Fine ripples laid over the swirl." },
		scale,
	],
	interlace: [
		angle("45", "Rotation of the sheet."),
		{ name: "frequency", type: "number", default: "1", description: "How tightly the cosine sheet folds." },
		{ name: "density", type: "number", default: "128", description: "Number of woven lines." },
		{ name: "depth", type: "number", default: "1", description: "Contrast between alternate lines, 0 to 1." },
		spin,
		tileMode("'repeat'"),
	],
	strata: [
		{ name: "count", type: "number", default: "3", description: "Number of ridges, 1 to 12." },
		angle("28", "Tilt of the ridges."),
		{ name: "frequency", type: "number", default: "1", description: "How often each ridge undulates." },
		{ name: "shade", type: "number", default: "0.6", description: "Light falling from the top, 0 to 1." },
	],

	/* Lighting. */
	sky: [
		{ name: "preset", type: "'clear' | 'overcast' | 'dusk' | 'tropical' | 'ember' | 'verdant'", default: "'clear'", description: "A tuned atmosphere. `extinction` and `tint` override parts of it." },
		{ name: "extinction", type: "[r, g, b]", default: "from preset", description: "How far each channel carries up the sky. Higher values keep a channel longer." },
		{ name: "tint", type: "ColorValue", default: "from preset", description: "Color of the incoming light." },
		{ name: "horizon", type: "number", default: "0.8", description: "Camera pitch. Higher values look further up the sky." },
		{ name: "fisheye", type: "number", default: "0.5", description: "Lens curvature toward the edges." },
	],
	glow: [
		center,
		{ name: "radius", type: "number", default: "1", description: "1 is half the view's shorter side." },
		{ name: "falloff", type: "number", default: "1", description: "Shape of the edge. Higher values give a tighter core with a harder edge." },
		{ name: "intensity", type: "number", default: "1", description: "Brightness multiplier." },
	],
	spotlight: [
		{ name: "origin", type: POINT, default: "[0.5, 0]", description: "Where the light hangs, in unit coordinates." },
		angle("180", "Where the beam points. 180 is straight down."),
		{ name: "spread", type: "number", default: "40", description: "Width of the cone in degrees." },
		{ name: "length", type: "number", default: "1", description: "Reach of the beam, as a fraction of the view's diagonal." },
		{ name: "softness", type: "number", default: "0.5", description: "Softness of the cone's edges." },
		{ name: "intensity", type: "number", default: "1", description: "Brightness multiplier." },
		spin,
	],
	vignette: [
		{ name: "color", type: "ColorValue", default: "'rgba(0, 0, 0, 0.85)'", description: "The edge color. The center stays transparent." },
		center,
		{ name: "radius", type: "number", default: "0.45", description: "Where the darkening starts." },
		{ name: "softness", type: "number", default: "0.75", description: "Width of the falloff." },
		{ name: "roundness", type: "number", default: "1", description: "1 is round; 0 hugs the rectangle." },
		{ name: "intensity", type: "number", default: "1", description: "Strength of the effect." },
	],

	/* Components. */
	gradient: [
		{ name: "type", type: "TGradientType", description: "Any of the 27 types. Every option of that type is accepted as a prop." },
		{ name: "layers", type: "TGradientLayer[]", description: "Instead of `type`: several layers composited in one pass, each `{ type, ...options }`." },
		{ name: "keyframes", type: "Partial<Props>[] | TGradientLayer[][]", description: "Prop sets to animate through; layer arrays when using `layers`." },
	],
	stack: [
		{ name: "children", type: "ReactNode", description: "Gradient components become layers, bottom to top. Anything else renders above them as content." },
		{ name: "keyframes", type: "TGradientLayer[][]", description: "Whole layer lists to animate through." },
	],
	text: [
		{ name: "gradient", type: "ReactElement", required: true, description: "Any gradient component or `GradientStack` element to paint the text with." },
		{ name: "children", type: "string", description: "The text." },
		{ name: "style", type: "StyleProp<TextStyle>", description: "Font, size and layout of the text." },
		{ name: "containerStyle", type: "StyleProp<ViewStyle>", description: "Style of the view around the text." },
		{ name: "numberOfLines", type: "number", description: "Passed to the underlying `Text`." },
		{ name: "allowFontScaling", type: "boolean", description: "Passed to the underlying `Text`." },
	],
	mask: [
		{ name: "gradient", type: "ReactElement", required: true, description: "The gradient to show through the mask." },
		{ name: "children", type: "ReactNode", description: "The mask. The gradient appears wherever these are opaque." },
	],
	border: [
		{ name: "gradient", type: "ReactElement", required: true, description: "The gradient the ring is painted with." },
		{ name: "width", type: "number", default: "2", description: "Ring thickness. Also pads the content inside." },
		{ name: "radius", type: "number", default: "16", description: "Corner radius of the ring." },
		{ name: "children", type: "ReactNode", description: "Content inside the ring." },
	],
	timing: [
		{ name: "type", type: "'timing'", default: "'timing'", description: "A fixed-duration curve." },
		{ name: "duration", type: "number", default: "600", description: "Milliseconds." },
		{ name: "delay", type: "number", default: "0", description: "Milliseconds before it starts." },
		{ name: "easing", type: "TEasingName | [x1, y1, x2, y2]", default: "'easeInOut'", description: "Named curve or cubic bezier." },
	],
	spring: [
		{ name: "type", type: "'spring'", required: true, description: "A physical spring. Its duration follows from the settings." },
		{ name: "damping", type: "number", default: "18", description: "Friction. Lower values overshoot and bounce." },
		{ name: "stiffness", type: "number", default: "160", description: "Tension. Higher values move faster." },
		{ name: "mass", type: "number", default: "1", description: "Heavier springs are slower and swing further." },
		{ name: "delay", type: "number", default: "0", description: "Milliseconds before it starts." },
	],
	report: [
		{ name: "platform", type: "'ios' | 'android'", description: "Where the report was taken." },
		{ name: "device", type: "string", description: "Device model." },
		{ name: "gpuName", type: "string", description: "GPU name as reported by the driver." },
		{ name: "simulator", type: "boolean", description: "True on the iOS Simulator and Android emulators." },
		{ name: "duration", type: "number", description: "Measured window in seconds." },
		{ name: "frames", type: "number", description: "Display frames in which gradient work ran." },
		{ name: "renders", type: "number", description: "Gradient views presented, summed across views." },
		{ name: "views", type: "number", description: "Gradient views that rendered at least once." },
		{ name: "fps", type: "number", description: "Display frames per second in which at least one gradient rendered." },
		{ name: "droppedFrames", type: "number", description: "Frames animated views missed, summed across views." },
		{ name: "cpu", type: "IPerformanceSummary", description: "Gradient work per frame on the iOS main thread or the Android render thread, in ms." },
		{ name: "gpu", type: "IPerformanceSummary | null", description: "GPU time per rendered view frame, in ms. `null` where the driver can't time it." },
		{ name: "gpuUtilization", type: "number | null", description: "Total gradient GPU time divided by wall time." },
		{ name: "processCpu", type: "number", description: "CPU time of the whole app process divided by wall time. Above 1 means more than one core." },
		{ name: "memory", type: "number", description: "Estimated GPU memory held by live gradient views, in bytes." },
	],

	/* Page-specific tables. */
	finishing: [
		{ name: "dither", type: "boolean", default: "true", description: "Removes banding in smooth gradients." },
		{ name: "grain", type: "number", default: "0", description: "Visible film grain, 0 to 1." },
		{ name: "deviceMotion", type: "boolean", default: "false", description: "Feeds device tilt to the shader. `true` by default on `HolographicGradient`." },
	],
	keyframes: [
		{ name: "keyframes", type: "Partial<Props>[] | TGradientLayer[][]", description: "Prop sets to visit after the initial props, in order." },
		{ name: "transition", type: "boolean | ITimingTransition | ISpringTransition", default: "1.2 s easeInOut", description: "How each step travels." },
		{ name: "loop", type: "boolean", default: "true", description: "Start over after the last keyframe." },
	],
	createGradient: [
		{ name: "type", type: "TGradientType", required: true, description: "The gradient type the component renders." },
		{ name: "displayName", type: "string", required: true, description: "Shown in React DevTools and error messages. Must not be empty." },
		{ name: "defaults", type: "Partial<IGradientView>", default: "{}", description: "View and playback props applied before the component's own props, so any of them can still be overridden." },
	],
	profiler: [
		{ name: "measure(duration)", type: "(ms: number) => Promise<IGradientPerformanceReport>", description: "Starts, waits `duration` milliseconds, stops and resolves with the report." },
		{ name: "start()", type: "() => void", description: "Starts a measurement window. Clears any previous samples." },
		{ name: "stop()", type: "() => IGradientPerformanceReport", description: "Ends the window and returns the report synchronously." },
		{ name: "isActive()", type: "() => boolean", description: "Whether a window is currently open." },
	],
} satisfies Record<string, PropRow[]>;

export type PropTableName = keyof typeof PROP_TABLES;
