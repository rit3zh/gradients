import type { ColorInterpolation, GradientLayer } from "../types";
import { CubicBezier } from "../animation/timing";
import { buildRamp, mixRamps, type ColorRamp } from "../color/color-ramp";
import { CLEAR, parseColor } from "../color/color-space";
import { SeededRandom } from "../math/seeded-random";
import { clamp, lerp, lerp2, lerp3, lerp4, type Rgba, type Vec2, type Vec3 } from "../math/vector";
import { BLEND_MODES, TILE_MODES, toRecord, type Kind, type LayerRecord } from "./record";

/** Numeric parameters every program reads from; all of them interpolate. */
export interface LayerParameters {
	angle: number;
	start: Vec2;
	end: Vec2;
	usesPoints: number;
	center: Vec2;
	radius: number;
	ellipse: number;
	startAngle: number;
	endAngle: number;
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
	speed: number;
	spin: number;
	flow: number;
	drift: number;
	opacity: number;
	extinction: Vec3;
	horizon: number;
	fisheye: number;
}

export interface LayerState {
	kind: Kind;
	blend: number;
	tile: number;
	interpolation: ColorInterpolation;
	parameters: LayerParameters;
	ramp: ColorRamp;
	colors: Rgba[];
	points: Vec2[];
	rows: number;
	columns: number;
	seed: number;
	/** Seconds of animation this layer has played, already scaled by `speed`. */
	clock: number;
}

const GOLDEN_RATIO = 0.61803398875;
const MAX_SITES = 32;

function parameters(record: LayerRecord): LayerParameters {
	const hasPoints = record.start !== null && record.end !== null;
	return {
		angle: record.angle,
		start: hasPoints ? record.start! : [0.5, 0],
		end: hasPoints ? record.end! : [0.5, 1],
		usesPoints: hasPoints ? 1 : 0,
		center: record.center,
		radius: record.radius,
		ellipse: record.shape === "ellipse" ? 1 : 0,
		startAngle: record.startAngle,
		endAngle: record.endAngle,
		scale: record.scale,
		octaves: clamp(record.octaves, 1, 6),
		warp: record.warp,
		smoothness: record.smoothness,
		intensity: record.intensity,
		softness: record.softness,
		roundness: record.roundness,
		width: record.width,
		spread: record.spread,
		falloff: record.falloff,
		highlight: record.highlight,
		bands: clamp(record.bands, 0.5, 24),
		speed: record.speed,
		spin: record.spin,
		flow: record.flow,
		drift: record.drift,
		opacity: clamp(record.opacity, 0, 1),
		extinction: record.extinction,
		horizon: record.horizon,
		fisheye: record.fisheye,
	};
}

const grid = (rows: number, columns: number): Vec2[] =>
	Array.from({ length: rows * columns }, (_, i) => [(i % columns) / (columns - 1), Math.floor(i / columns) / (rows - 1)]);

const cycle = (colors: Rgba[], count: number): Rgba[] =>
	Array.from({ length: count }, (_, i) => (colors.length ? colors[i % colors.length] : CLEAR));

/** Seeded, evenly spread sites for freeform and voronoi layers without explicit points. */
function scatter(count: number, seed: number): Vec2[] {
	const random = new SeededRandom(seed);
	const offset = random.unit();
	const spread = 0.6 / Math.sqrt(count);
	return Array.from({ length: count }, (_, i) => {
		const jitterX = random.unit() - 0.5;
		const jitterY = random.unit() - 0.5;
		const x = (offset + i * GOLDEN_RATIO) % 1;
		const y = (i + 0.5) / count;
		return [clamp(x + jitterX * spread, 0.02, 0.98), clamp(y + jitterY * spread, 0.02, 0.98)];
	});
}

export function createLayerState(layer: GradientLayer): LayerState {
	const record = toRecord(layer);
	const resolved = record.colors.map(parseColor);
	const ramp = buildRamp(resolved, record.stops, record.interpolation, CubicBezier.of(record.easing));
	const sites = record.points;

	let rows = 0;
	let columns = 0;
	let points: Vec2[] = [];
	let colors: Rgba[] = [];

	switch (record.type) {
		case "mesh": {
			rows = Math.max(record.rows, 2);
			columns = Math.max(record.columns, 2);
			const count = rows * columns;
			points = sites.length === count ? sites : grid(rows, columns);
			colors = cycle(resolved, count);
			break;
		}
		case "bilinear":
			rows = 2;
			columns = 2;
			colors = cycle(resolved, 4);
			break;
		case "freeform": {
			const count = clamp(sites.length === 0 ? resolved.length : sites.length, 1, MAX_SITES);
			points = sites.length === 0 ? scatter(count, record.seed) : sites.slice(0, count);
			colors = cycle(resolved, count);
			break;
		}
		case "voronoi": {
			const requested = record.cells > 0 ? record.cells : 8;
			const count = clamp(sites.length === 0 ? requested : sites.length, 1, MAX_SITES);
			points = sites.length === 0 ? scatter(count, record.seed) : sites.slice(0, count);
			colors = cycle(resolved, count);
			break;
		}
	}

	return {
		kind: record.type,
		blend: BLEND_MODES.indexOf(record.blendMode),
		tile: TILE_MODES.indexOf(record.tileMode),
		interpolation: record.interpolation,
		parameters: parameters(record),
		ramp,
		colors,
		points,
		rows,
		columns,
		seed: record.seed,
		clock: 0,
	};
}

/** Layers can blend field by field only when their structure matches. */
export function isCompatible(a: LayerState, b: LayerState): boolean {
	return (
		a.kind === b.kind &&
		a.blend === b.blend &&
		a.tile === b.tile &&
		a.interpolation === b.interpolation &&
		a.rows === b.rows &&
		a.columns === b.columns &&
		a.points.length === b.points.length &&
		a.colors.length === b.colors.length
	);
}

export const faded = (state: LayerState, factor: number): LayerState => ({
	...state,
	parameters: { ...state.parameters, opacity: state.parameters.opacity * factor },
});

function mixParameters(a: LayerParameters, b: LayerParameters, t: number): LayerParameters {
	const mixed = {} as LayerParameters;
	for (const key of Object.keys(a) as (keyof LayerParameters)[]) {
		const from = a[key];
		const to = b[key];
		if (typeof from === "number" && typeof to === "number") {
			(mixed[key] as number) = lerp(from, to, t);
		}
	}
	// A layer without explicit points borrows the other side's, so switching
	// between angle and start/end doesn't swing through the default axis.
	mixed.start = lerp2(a.usesPoints > 0 ? a.start : b.start, b.usesPoints > 0 ? b.start : a.start, t);
	mixed.end = lerp2(a.usesPoints > 0 ? a.end : b.end, b.usesPoints > 0 ? b.end : a.end, t);
	mixed.center = lerp2(a.center, b.center, t);
	mixed.extinction = lerp3(a.extinction, b.extinction, t);
	return mixed;
}

export function mixStates(a: LayerState, b: LayerState, t: number): LayerState {
	return {
		...b,
		parameters: mixParameters(a.parameters, b.parameters, t),
		ramp: mixRamps(a.ramp, b.ramp, t),
		colors: a.colors.map((color, i) => lerp4(color, b.colors[i], t)),
		points: a.points.map((point, i) => lerp2(point, b.points[i], t)),
		seed: lerp(a.seed, b.seed, t),
		clock: lerp(a.clock, b.clock, t),
	};
}
