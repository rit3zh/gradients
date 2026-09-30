import type { LayerState } from "../layer/layer-state";
import { clamp } from "../math/vector";
import { set4 } from "../render/frame-data";
import { spinAngle, spinsOrFlows, type GradientProgram } from "./program";

/** The gradient line in pixels, from an angle or explicit start/end points. */
export function linearAxis(state: LayerState, width: number, height: number): [number, number, number, number] {
	const { parameters } = state;
	const angle = spinAngle(state, parameters.angle);
	const directionX = Math.sin(angle);
	const directionY = -Math.cos(angle);
	const length = Math.abs(width * directionX) + Math.abs(height * directionY);
	const centerX = width * 0.5;
	const centerY = height * 0.5;

	const rotation = (parameters.spin * state.clock * Math.PI) / 180;
	const cosine = Math.cos(rotation);
	const sine = Math.sin(rotation);
	const rotate = (x: number, y: number): [number, number] => [
		centerX + (x - centerX) * cosine - (y - centerY) * sine,
		centerY + (x - centerX) * sine + (y - centerY) * cosine,
	];
	const [pointStartX, pointStartY] = rotate(parameters.start[0] * width, parameters.start[1] * height);
	const [pointEndX, pointEndY] = rotate(parameters.end[0] * width, parameters.end[1] * height);

	const weight = parameters.usesPoints;
	const angleStartX = centerX - directionX * length * 0.5;
	const angleStartY = centerY - directionY * length * 0.5;
	const angleEndX = centerX + directionX * length * 0.5;
	const angleEndY = centerY + directionY * length * 0.5;
	return [
		angleStartX + (pointStartX - angleStartX) * weight,
		angleStartY + (pointStartY - angleStartY) * weight,
		angleEndX + (pointEndX - angleEndX) * weight,
		angleEndY + (pointEndY - angleEndY) * weight,
	];
}

export const linear: GradientProgram = {
	kind: "linear",
	shader: "programs/geometric/linear.glsl",
	fn: "linearField",
	resolution: 2,
	isAnimated: spinsOrFlows,
	encode(state, uniforms, context) {
		set4(uniforms.a, ...linearAxis(state, context.width, context.height));
	},
};

export const radial: GradientProgram = {
	kind: "radial",
	shader: "programs/geometric/radial.glsl",
	fn: "radialField",
	resolution: 2,
	isAnimated: spinsOrFlows,
	encode(state, uniforms, context) {
		const { parameters } = state;
		const centerX = context.pointX(parameters.center);
		const centerY = context.pointY(parameters.center);
		const reachX = Math.max(centerX, context.width - centerX);
		const reachY = Math.max(centerY, context.height - centerY);
		const circle = Math.hypot(reachX, reachY);
		const scale = parameters.radius;
		const e = parameters.ellipse;
		set4(
			uniforms.a,
			centerX,
			centerY,
			(circle + (reachX * Math.SQRT2 - circle) * e) * scale,
			(circle + (reachY * Math.SQRT2 - circle) * e) * scale,
		);
	},
};

export const conic: GradientProgram = {
	kind: "conic",
	shader: "programs/geometric/conic.glsl",
	fn: "conicField",
	resolution: 2,
	isAnimated: spinsOrFlows,
	encode(state, uniforms, context) {
		const { center, angle } = state.parameters;
		set4(uniforms.a, context.pointX(center), context.pointY(center), spinAngle(state, angle));
	},
};

export const sweep: GradientProgram = {
	kind: "sweep",
	shader: "programs/geometric/sweep.glsl",
	fn: "sweepField",
	resolution: 2,
	isAnimated: spinsOrFlows,
	encode(state, uniforms, context) {
		const { center, startAngle, endAngle } = state.parameters;
		set4(
			uniforms.a,
			context.pointX(center),
			context.pointY(center),
			spinAngle(state, startAngle),
			spinAngle(state, endAngle),
		);
	},
};

export const diamond: GradientProgram = {
	kind: "diamond",
	shader: "programs/geometric/diamond.glsl",
	fn: "diamondField",
	resolution: 2,
	isAnimated: spinsOrFlows,
	encode(state, uniforms, context) {
		const { parameters } = state;
		const square = Math.max(context.width, context.height);
		const e = parameters.ellipse;
		set4(
			uniforms.a,
			context.pointX(parameters.center),
			context.pointY(parameters.center),
			(square + (context.width - square) * e) * parameters.radius,
			(square + (context.height - square) * e) * parameters.radius,
		);
		set4(uniforms.b, spinAngle(state, parameters.angle));
	},
};

export const reflected: GradientProgram = {
	kind: "reflected",
	shader: "programs/geometric/reflected.glsl",
	fn: "reflectedField",
	resolution: 2,
	isAnimated: spinsOrFlows,
	encode(state, uniforms, context) {
		const { parameters } = state;
		const axis = linearAxis(state, context.width, context.height);
		const weight = parameters.usesPoints;
		const middleX = (axis[0] + axis[2]) * 0.5;
		const middleY = (axis[1] + axis[3]) * 0.5;
		set4(
			uniforms.a,
			middleX + (axis[0] - middleX) * weight,
			middleY + (axis[1] - middleY) * weight,
			axis[2],
			axis[3],
		);
		set4(uniforms.b, clamp(parameters.softness, 0, 1) * 0.35, clamp(parameters.radius, -1, 1));
	},
};
