import type { LayerState } from "../layer/layer-state";
import type { Kind } from "../layer/record";
import type { LayerUniforms } from "../render/frame-data";
import type { LayerContext } from "./support/layer-context";

/** One gradient type: its shader function and how it packs its uniforms. */
export interface GradientProgram {
	kind: Kind;
	/** Path inside the synced shader sources. */
	shader: string;
	/** GLSL entry point, `vec4 name(Fragment, Layer)`. */
	fn: string;
	/** Render scale cap. Smooth fields render below native resolution. */
	resolution?: number;
	usesNoise?: boolean;
	usesSurfaces?: boolean;
	isAnimated?: (state: LayerState) => boolean;
	encode(state: LayerState, uniforms: LayerUniforms, context: LayerContext): void;
}

/** Geometric types only move when they spin or flow. */
export const spinsOrFlows = (state: LayerState) =>
	state.parameters.speed !== 0 && (state.parameters.spin !== 0 || state.parameters.flow !== 0);

export const hasSpeed = (state: LayerState) => state.parameters.speed !== 0;

export const drifts = (state: LayerState) => state.parameters.speed !== 0 && state.parameters.drift > 0;

/** Base angle plus accumulated spin, in radians. */
export const spinAngle = (state: LayerState, degrees: number) =>
	((degrees + state.parameters.spin * state.clock) * Math.PI) / 180;
