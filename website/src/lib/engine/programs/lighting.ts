import { set4 } from "../render/frame-data";
import { hasSpeed, spinAngle, type GradientProgram } from "./program";

export const glow: GradientProgram = {
	kind: "glow",
	shader: "programs/lighting/glow.glsl",
	fn: "glowField",
	resolution: 1,
	isAnimated: hasSpeed,
	encode(state, uniforms, context) {
		const { parameters } = state;
		set4(
			uniforms.a,
			context.pointX(parameters.center),
			context.pointY(parameters.center),
			parameters.radius * context.minSide * 0.5,
			Math.max(parameters.falloff, 0.05),
		);
		// 0.08 is the breathing depth of the pulse.
		set4(uniforms.b, parameters.intensity, 0.08);
	},
};

export const spotlight: GradientProgram = {
	kind: "spotlight",
	shader: "programs/lighting/spotlight.glsl",
	fn: "spotlightField",
	resolution: 1,
	isAnimated: hasSpeed,
	encode(state, uniforms, context) {
		const { parameters } = state;
		const sway = Math.sin(state.clock * 0.9) * 0.12;
		set4(
			uniforms.a,
			context.pointX(parameters.center),
			context.pointY(parameters.center),
			spinAngle(state, parameters.angle) + sway,
			(parameters.spread * Math.PI) / 360,
		);
		set4(
			uniforms.b,
			Math.hypot(context.width, context.height) * parameters.radius,
			parameters.softness,
			parameters.intensity,
		);
	},
};

export const vignette: GradientProgram = {
	kind: "vignette",
	shader: "programs/lighting/vignette.glsl",
	fn: "vignetteField",
	resolution: 1,
	isAnimated: () => false,
	encode(state, uniforms) {
		const { parameters } = state;
		set4(uniforms.a, parameters.center[0], parameters.center[1], parameters.radius, parameters.softness);
		set4(uniforms.b, parameters.roundness, parameters.intensity);
	},
};

export const sky: GradientProgram = {
	kind: "sky",
	shader: "programs/lighting/sky.glsl",
	fn: "skyField",
	resolution: 1,
	isAnimated: () => false,
	encode(state, uniforms) {
		const { parameters } = state;
		// 0.7 is the lens focal length.
		set4(uniforms.a, 0.7, parameters.fisheye, parameters.horizon);
		set4(uniforms.b, ...parameters.extinction);
	},
};
