import { SeededRandom, seedOffset } from "../math/seeded-random";
import { clamp } from "../math/vector";
import { set4 } from "../render/frame-data";
import { hasSpeed, spinAngle, type GradientProgram } from "./program";

const speedOrSpin: GradientProgram["isAnimated"] = (state) =>
	state.parameters.speed !== 0 || state.parameters.spin !== 0;

export const noise: GradientProgram = {
	kind: "noise",
	shader: "programs/procedural/noise.glsl",
	fn: "noiseField",
	resolution: 1.5,
	usesNoise: true,
	isAnimated: hasSpeed,
	encode(state, uniforms) {
		const { parameters } = state;
		set4(uniforms.a, parameters.scale, parameters.octaves, parameters.warp, 1.2 + parameters.intensity * 0.6);
		set4(uniforms.b, ...seedOffset(state.seed));
	},
};

export const aurora: GradientProgram = {
	kind: "aurora",
	shader: "programs/procedural/aurora.glsl",
	fn: "auroraField",
	resolution: 1.5,
	usesNoise: true,
	isAnimated: hasSpeed,
	encode(state, uniforms) {
		const { parameters } = state;
		set4(
			uniforms.a,
			parameters.scale,
			parameters.bands,
			parameters.intensity,
			Math.max(1 - parameters.softness, 0.05),
		);
		set4(uniforms.b, new SeededRandom(state.seed).unit() * 50);
	},
};

export const liquid: GradientProgram = {
	kind: "liquid",
	shader: "programs/procedural/liquid.glsl",
	fn: "liquidField",
	resolution: 1.5,
	usesNoise: true,
	isAnimated: hasSpeed,
	encode(state, uniforms) {
		const { parameters } = state;
		set4(uniforms.a, parameters.scale * 0.55, parameters.warp, parameters.highlight);
		set4(uniforms.b, ...seedOffset(state.seed));
	},
};

export const iridescent: GradientProgram = {
	kind: "iridescent",
	shader: "programs/procedural/iridescent.glsl",
	fn: "iridescentField",
	resolution: 1.5,
	usesNoise: true,
	isAnimated: speedOrSpin,
	encode(state, uniforms) {
		const { parameters } = state;
		const [x, y] = seedOffset(state.seed, 0.01);
		set4(uniforms.a, spinAngle(state, parameters.angle), parameters.bands, parameters.highlight, parameters.warp);
		set4(uniforms.b, x, y, clamp(parameters.softness, 0, 1));
	},
};

export const holographic: GradientProgram = {
	kind: "holographic",
	shader: "programs/procedural/holographic.glsl",
	fn: "holographicField",
	usesNoise: true,
	isAnimated: speedOrSpin,
	encode(state, uniforms) {
		const { parameters } = state;
		const [x, y] = seedOffset(state.seed, 0.01);
		set4(uniforms.a, spinAngle(state, parameters.angle), parameters.bands, parameters.intensity, parameters.warp);
		set4(uniforms.b, x, y, clamp(parameters.softness, 0, 1), parameters.highlight);
	},
};
