import { seedOffset } from "../math/seeded-random";
import { clamp } from "../math/vector";
import { set4 } from "../render/frame-data";
import { hasSpeed, spinAngle, type GradientProgram } from "./program";

export const wave: GradientProgram = {
	kind: "wave",
	shader: "programs/flow/wave.glsl",
	fn: "waveField",
	resolution: 1.5,
	isAnimated: hasSpeed,
	encode(state, uniforms) {
		const { parameters } = state;
		set4(uniforms.a, parameters.scale, parameters.intensity * 0.24, clamp(parameters.smoothness, 0, 1));
		set4(uniforms.b, spinAngle(state, parameters.angle));
	},
};

export const silk: GradientProgram = {
	kind: "silk",
	shader: "programs/flow/silk.glsl",
	fn: "silkField",
	resolution: 1.5,
	isAnimated: hasSpeed,
	encode(state, uniforms) {
		set4(uniforms.a, Math.max(state.parameters.scale, 0.05), state.parameters.highlight);
	},
};

export const smoke: GradientProgram = {
	kind: "smoke",
	shader: "programs/flow/smoke.glsl",
	fn: "smokeField",
	resolution: 1.5,
	isAnimated: hasSpeed,
	encode(state, uniforms) {
		set4(uniforms.a, Math.max(state.parameters.scale, 0.05), state.parameters.warp);
	},
};

export const ribbon: GradientProgram = {
	kind: "ribbon",
	shader: "programs/flow/ribbon.glsl",
	fn: "ribbonField",
	resolution: 1.5,
	isAnimated: (state) => state.parameters.speed !== 0 || state.parameters.spin !== 0,
	encode(state, uniforms) {
		const { parameters } = state;
		set4(
			uniforms.a,
			spinAngle(state, parameters.angle),
			Math.max(parameters.bands, 0.1) * 1.5,
			Math.max(parameters.bands, 1),
			parameters.highlight,
		);
		set4(uniforms.b, Math.max(parameters.scale, 0.05));
	},
};

export const flux: GradientProgram = {
	kind: "flux",
	shader: "programs/flow/flux.glsl",
	fn: "fluxField",
	resolution: 1.5,
	usesNoise: true,
	isAnimated: hasSpeed,
	encode(state, uniforms) {
		const { parameters } = state;
		set4(uniforms.a, parameters.warp, parameters.intensity, Math.max(parameters.scale, 0.05));
		set4(uniforms.b, ...seedOffset(state.seed, 0.05));
	},
};

export const interlace: GradientProgram = {
	kind: "interlace",
	shader: "programs/flow/interlace.glsl",
	fn: "interlaceField",
	isAnimated: hasSpeed,
	encode(state, uniforms) {
		const { parameters } = state;
		set4(
			uniforms.a,
			spinAngle(state, parameters.angle),
			Math.max(parameters.scale, 0.05),
			Math.max(parameters.width, 1),
			clamp(parameters.intensity, 0, 1),
		);
	},
};

export const strata: GradientProgram = {
	kind: "strata",
	shader: "programs/flow/strata.glsl",
	fn: "strataField",
	resolution: 2,
	isAnimated: hasSpeed,
	encode(state, uniforms) {
		const { parameters } = state;
		set4(
			uniforms.a,
			spinAngle(state, parameters.angle),
			parameters.bands,
			Math.max(parameters.scale, 0.05),
			clamp(parameters.intensity, 0, 1),
		);
	},
};
