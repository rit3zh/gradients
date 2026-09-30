import type { BlendMode, ColorInterpolation, GradientLayer, Point, TileMode } from "../types";
import { toBezier } from "../animation/timing";
import { PALETTES, SKY_PRESETS, closed } from "./presets";

// The native layer kinds, in the order the shaders number them. `angular`
// is only a JS alias for `conic`, so it has no entry here.
export const KINDS = [
	"linear",
	"radial",
	"conic",
	"sweep",
	"diamond",
	"reflected",
	"mesh",
	"freeform",
	"bilinear",
	"noise",
	"voronoi",
	"glow",
	"spotlight",
	"vignette",
	"aurora",
	"liquid",
	"iridescent",
	"wave",
	"silk",
	"smoke",
	"ribbon",
	"flux",
	"holographic",
	"interlace",
	"sky",
	"strata",
] as const;

export type Kind = (typeof KINDS)[number];

export const BLEND_MODES: readonly BlendMode[] = [
	"normal",
	"multiply",
	"screen",
	"overlay",
	"darken",
	"lighten",
	"colorDodge",
	"colorBurn",
	"hardLight",
	"softLight",
	"difference",
	"exclusion",
	"hue",
	"saturation",
	"color",
	"luminosity",
	"plusLighter",
	"plusDarker",
];

export const TILE_MODES: readonly TileMode[] = ["clamp", "repeat", "mirror", "decal"];

/**
 * What the native module receives for one layer: the JS component's props
 * after `toNativeLayer`, with the native record defaults filled in.
 */
export interface LayerRecord {
	type: Kind;
	colors: readonly string[];
	stops: readonly number[];
	interpolation: ColorInterpolation;
	easing: readonly number[];
	tileMode: TileMode;
	blendMode: BlendMode;
	opacity: number;
	angle: number;
	start: [number, number] | null;
	end: [number, number] | null;
	center: [number, number];
	radius: number;
	shape: "circle" | "ellipse";
	startAngle: number;
	endAngle: number;
	rows: number;
	columns: number;
	points: [number, number][];
	cells: number;
	scale: number;
	octaves: number;
	warp: number;
	smoothness: number;
	intensity: number;
	softness: number;
	roundness: number;
	width: number;
	spread: number;
	falloff: number;
	highlight: number;
	bands: number;
	seed: number;
	extinction: [number, number, number];
	horizon: number;
	fisheye: number;
	speed: number;
	spin: number;
	flow: number;
	drift: number;
}

const RECORD_DEFAULTS: Omit<LayerRecord, "type" | "colors"> = {
	stops: [],
	interpolation: "oklab",
	easing: [0, 0, 1, 1],
	tileMode: "clamp",
	blendMode: "normal",
	opacity: 1,
	angle: 180,
	start: null,
	end: null,
	center: [0.5, 0.5],
	radius: 1,
	shape: "circle",
	startAngle: 0,
	endAngle: 360,
	rows: 0,
	columns: 0,
	points: [],
	cells: 0,
	scale: 1,
	octaves: 4,
	warp: 0,
	smoothness: 0.5,
	intensity: 1,
	softness: 0.5,
	roundness: 1,
	width: 0.2,
	spread: 30,
	falloff: 1,
	highlight: 0,
	bands: 3,
	seed: 0,
	extinction: [0.1, 0.3, 0.6],
	horizon: 0.8,
	fisheye: 0.5,
	speed: 0,
	spin: 0,
	flow: 0,
	drift: 0,
};

const toPoint = (point: Point): [number, number] =>
	Array.isArray(point) ? [point[0], point[1]] : [(point as { x: number }).x, (point as { y: number }).y];

const pointOrUndefined = (point: Point | undefined) => (point ? toPoint(point) : undefined);

function compact<T extends object>(value: T): Partial<T> {
	return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;
}

/** Port of `toNativeLayer` in src/utils/normalize/layer.util.ts. */
function nativeOptions(options: GradientLayer): Partial<LayerRecord> & { type: Kind; colors: readonly string[] } {
	const base = (type: Kind, fallback: readonly string[], extra: Partial<LayerRecord>, speed = 1) => ({
		...compact({
			stops: options.stops,
			interpolation: options.interpolation,
			easing: options.easing ? toBezier(options.easing) : undefined,
			opacity: options.opacity,
			blendMode: options.blendMode,
			seed: options.seed,
			...extra,
		}),
		type,
		colors: options.colors ?? fallback,
		speed: options.speed ?? speed,
	});

	const axis = options.start && options.end ? { start: toPoint(options.start), end: toPoint(options.end) } : {};

	switch (options.type) {
		case "linear":
			return base("linear", PALETTES.dusk, {
				angle: options.angle ?? 180,
				...axis,
				spin: options.spin,
				flow: options.flow,
				tileMode: options.tileMode,
			});
		case "reflected":
			return base("reflected", PALETTES.reflected, {
				angle: options.angle ?? 180,
				...axis,
				softness: options.softness ?? 0.35,
				radius: options.offset ?? 0,
				spin: options.spin,
				flow: options.flow,
				tileMode: options.tileMode,
			});
		case "radial":
			return base("radial", PALETTES.dusk, {
				center: pointOrUndefined(options.center),
				radius: options.radius ?? 1,
				shape: options.shape === "ellipse" ? "ellipse" : options.shape === "circle" ? "circle" : undefined,
				flow: options.flow,
				tileMode: options.tileMode,
			});
		case "conic":
		case "angular":
			return base("conic", closed(PALETTES.dusk), {
				center: pointOrUndefined(options.center),
				angle: options.angle ?? 0,
				spin: options.spin,
				flow: options.flow,
				tileMode: options.tileMode,
			});
		case "sweep":
			return base("sweep", PALETTES.ocean, {
				center: pointOrUndefined(options.center),
				startAngle: options.startAngle ?? 0,
				endAngle: options.endAngle ?? 360,
				spin: options.spin,
				tileMode: options.tileMode,
			});
		case "diamond":
			return base("diamond", PALETTES.dusk, {
				center: pointOrUndefined(options.center),
				radius: options.radius ?? 1,
				angle: options.angle ?? 0,
				shape: options.shape === "square" ? "circle" : "ellipse",
				spin: options.spin,
				flow: options.flow,
				tileMode: options.tileMode,
			});
		case "mesh": {
			const rows = Math.max(2, Math.round(options.rows ?? 3));
			const columns = Math.max(2, Math.round(options.columns ?? 3));
			return base("mesh", PALETTES.mesh.slice(0, rows * columns), {
				rows,
				columns,
				points: options.points?.map(toPoint),
				smoothness: options.smoothness ?? 1,
				drift: options.drift ?? 0,
			});
		}
		case "freeform":
			return base("freeform", PALETTES.corners, {
				points: options.points?.map(toPoint),
				smoothness: options.smoothness ?? 0.5,
				drift: options.drift ?? 0,
			});
		case "bilinear":
			return base("bilinear", PALETTES.corners, { smoothness: options.smoothness ?? 0 });
		case "noise":
			return base(
				"noise",
				PALETTES.noise,
				{
					scale: options.scale ?? 1,
					octaves: options.octaves ?? 4,
					warp: options.warp ?? 0.35,
					intensity: options.contrast ?? 1,
				},
				0,
			);
		case "voronoi":
			return base("voronoi", PALETTES.mesh.slice(0, 6), {
				cells: options.cells ?? 8,
				points: options.points?.map(toPoint),
				smoothness: options.smoothness ?? 0.35,
				drift: options.drift ?? 0,
			});
		case "glow":
			return base(
				"glow",
				PALETTES.glow,
				{
					center: pointOrUndefined(options.center),
					radius: options.radius ?? 1,
					falloff: options.falloff ?? 1,
					intensity: options.intensity ?? 1,
				},
				0,
			);
		case "spotlight":
			return base(
				"spotlight",
				PALETTES.light,
				{
					center: toPoint(options.origin ?? [0.5, 0]),
					angle: options.angle ?? 180,
					spread: options.spread ?? 40,
					radius: options.length ?? 1,
					softness: options.softness ?? 0.5,
					intensity: options.intensity ?? 1,
					spin: options.spin,
				},
				0,
			);
		case "vignette":
			return base("vignette", ["transparent", options.color ?? "rgba(0, 0, 0, 0.85)"], {
				center: pointOrUndefined(options.center),
				radius: options.radius ?? 0.45,
				softness: options.softness ?? 0.75,
				roundness: options.roundness ?? 1,
				intensity: options.intensity ?? 1,
			});
		case "aurora":
			return base("aurora", PALETTES.aurora, {
				bands: options.bands ?? 3,
				scale: options.scale ?? 1,
				intensity: options.intensity ?? 1,
				softness: options.softness ?? 0.5,
			});
		case "liquid":
			return base("liquid", PALETTES.liquid, {
				scale: options.scale ?? 1,
				warp: options.warp ?? 1.8,
				highlight: options.highlight ?? 0.25,
			});
		case "iridescent":
			return base(
				"iridescent",
				PALETTES.spectrum,
				{
					angle: options.angle ?? 135,
					bands: options.bands ?? 1.4,
					highlight: options.sheen ?? 0.8,
					warp: options.warp ?? 0.8,
					softness: options.paletteMix ?? (options.colors ? 0.7 : 0),
					spin: options.spin,
				},
				0.35,
			);
		case "holographic":
			return base(
				"holographic",
				PALETTES.spectrum,
				{
					angle: options.angle ?? 120,
					bands: options.bands ?? 1.2,
					intensity: options.sparkle ?? 0.9,
					highlight: options.sheen ?? 0.55,
					warp: options.warp ?? 0.8,
					softness: options.paletteMix ?? (options.colors ? 0.7 : 0),
					spin: options.spin,
				},
				0.4,
			);
		case "wave":
			return base("wave", PALETTES.ocean, {
				angle: options.angle ?? 0,
				scale: options.frequency ?? 1,
				intensity: options.amplitude ?? 1,
				smoothness: options.smoothness ?? 1,
				spin: options.spin,
			});
		case "silk":
			return base("silk", PALETTES.dusk, { scale: options.scale ?? 1, highlight: options.sheen ?? 0.25 });
		case "smoke":
			return base("smoke", PALETTES.noise, { scale: options.scale ?? 1, warp: options.turbulence ?? 0.6 });
		case "ribbon":
			return base("ribbon", PALETTES.dusk, {
				angle: options.angle ?? -20,
				bands: options.count ?? 4,
				scale: options.scale ?? 1,
				highlight: options.depth ?? 0.6,
				spin: options.spin,
				tileMode: options.tileMode ?? "mirror",
			});
		case "flux":
			return base("flux", PALETTES.dusk, {
				warp: options.turbulence ?? 1,
				intensity: options.ripple ?? 1,
				scale: options.scale ?? 1,
			});
		case "interlace":
			return base("interlace", PALETTES.interlace, {
				angle: options.angle ?? 45,
				scale: options.frequency ?? 1,
				width: options.density ?? 128,
				intensity: options.depth ?? 1,
				spin: options.spin,
				tileMode: options.tileMode ?? "repeat",
			});
		case "sky": {
			const preset = SKY_PRESETS[options.preset ?? "clear"];
			// Sky has no speed of its own; it is never animated.
			return {
				...compact({ opacity: options.opacity, blendMode: options.blendMode }),
				type: "sky",
				colors: [options.tint ?? preset.tint],
				extinction: [...(options.extinction ?? preset.extinction)] as [number, number, number],
				horizon: options.horizon ?? 0.8,
				fisheye: options.fisheye ?? 0.5,
			};
		}
		case "strata":
			return base("strata", PALETTES.strata, {
				bands: options.count ?? 3,
				angle: options.angle ?? 28,
				scale: options.frequency ?? 1,
				intensity: options.shade ?? 0.6,
			});
	}
}

export function toRecord(layer: GradientLayer): LayerRecord {
	return { ...RECORD_DEFAULTS, ...compact(nativeOptions(layer)) } as LayerRecord;
}
