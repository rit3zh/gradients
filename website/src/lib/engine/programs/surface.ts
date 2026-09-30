import { encode } from "../color/color-space";
import type { LayerState } from "../layer/layer-state";
import { clamp } from "../math/vector";
import { set4 } from "../render/frame-data";
import { drifts, type GradientProgram } from "./program";
import type { LayerContext } from "./support/layer-context";
import { meshKey, tessellate } from "./support/mesh-surface";
import { drift } from "./support/point-drift";

/** Site positions (in pixels) followed by their colors, both read by index in GLSL. */
function putSites(state: LayerState, context: LayerContext, points: [number, number][]) {
	for (const point of points) context.put(context.pointX(point), context.pointY(point));
	for (const color of state.colors) context.put(...encode(color, state.interpolation));
}

export const mesh: GradientProgram = {
	kind: "mesh",
	shader: "programs/surface/mesh.glsl",
	fn: "meshField",
	resolution: 1,
	usesSurfaces: true,
	isAnimated: drifts,
	encode(state, uniforms, context) {
		const reach: [number, number] = [0.35 / Math.max(state.columns - 1, 1), 0.35 / Math.max(state.rows - 1, 1)];
		const points = drift(state.points, state.parameters.drift, state.clock, state.seed, reach, state);
		const input = {
			points,
			colors: state.colors,
			rows: state.rows,
			columns: state.columns,
			space: state.interpolation,
			smoothness: state.parameters.smoothness,
		};
		const key = meshKey(input);
		const surface = context.reusableSurface(key) ?? tessellate(input, key);
		uniforms.surface = context.appendSurface(surface) ?? 0;
	},
};

export const freeform: GradientProgram = {
	kind: "freeform",
	shader: "programs/surface/freeform.glsl",
	fn: "freeformField",
	resolution: 1,
	isAnimated: drifts,
	encode(state, uniforms, context) {
		const points = drift(state.points, state.parameters.drift, state.clock, state.seed, [0.25, 0.25]);
		uniforms.data = context.cursor;
		putSites(state, context, points);
		uniforms.count = points.length;
		const smoothness = clamp(state.parameters.smoothness, 0, 1);
		set4(uniforms.a, 1.5 + (1 - smoothness) * 3, 0.0004);
	},
};

export const bilinear: GradientProgram = {
	kind: "bilinear",
	shader: "programs/surface/bilinear.glsl",
	fn: "bilinearField",
	resolution: 1,
	isAnimated: () => false,
	encode(state, uniforms, context) {
		uniforms.data = context.cursor;
		for (const color of state.colors) context.put(...encode(color, state.interpolation));
		uniforms.count = 4;
		set4(uniforms.a, clamp(state.parameters.smoothness, 0, 1));
	},
};

export const voronoi: GradientProgram = {
	kind: "voronoi",
	shader: "programs/surface/voronoi.glsl",
	fn: "voronoiField",
	isAnimated: drifts,
	encode(state, uniforms, context) {
		const points = drift(state.points, state.parameters.drift, state.clock, state.seed, [0.18, 0.18]);
		uniforms.data = context.cursor;
		putSites(state, context, points);
		uniforms.count = points.length;
		const smoothness = clamp(state.parameters.smoothness, 0, 1);
		set4(uniforms.a, 1 / Math.max(smoothness * smoothness * 0.3, 0.004));
	},
};
