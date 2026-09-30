import type { Easing, EasingName, Transition } from "../types";

const EASINGS: Record<EasingName, readonly [number, number, number, number]> = {
	linear: [0, 0, 1, 1],
	ease: [0.25, 0.1, 0.25, 1],
	easeIn: [0.42, 0, 1, 1],
	easeOut: [0, 0, 0.58, 1],
	easeInOut: [0.42, 0, 0.58, 1],
	smooth: [0.65, 0, 0.35, 1],
};

export function toBezier(easing: Easing): [number, number, number, number] {
	const curve = typeof easing === "string" ? EASINGS[easing] : easing;
	return [curve[0], curve[1], curve[2], curve[3]];
}

export class CubicBezier {
	static readonly LINEAR = new CubicBezier(0, 0, 1, 1);
	static readonly EASE_IN_OUT = new CubicBezier(0.42, 0, 0.58, 1);

	private readonly cx: number;
	private readonly bx: number;
	private readonly ax: number;
	private readonly cy: number;
	private readonly by: number;
	private readonly ay: number;
	private readonly linear: boolean;

	constructor(x1: number, y1: number, x2: number, y2: number) {
		const px1 = Math.min(Math.max(x1, 0), 1);
		const px2 = Math.min(Math.max(x2, 0), 1);
		this.cx = 3 * px1;
		this.bx = 3 * (px2 - px1) - this.cx;
		this.ax = 1 - this.cx - this.bx;
		this.cy = 3 * y1;
		this.by = 3 * (y2 - y1) - this.cy;
		this.ay = 1 - this.cy - this.by;
		this.linear = px1 === y1 && px2 === y2;
	}

	static of(values: readonly number[] | undefined): CubicBezier {
		return values?.length === 4 ? new CubicBezier(values[0], values[1], values[2], values[3]) : CubicBezier.LINEAR;
	}

	value(progress: number): number {
		const x = Math.min(Math.max(progress, 0), 1);
		return this.linear ? x : this.sampleY(this.solve(x));
	}

	private sampleX(t: number) {
		return ((this.ax * t + this.bx) * t + this.cx) * t;
	}

	private sampleY(t: number) {
		return ((this.ay * t + this.by) * t + this.cy) * t;
	}

	private slopeX(t: number) {
		return (3 * this.ax * t + 2 * this.bx) * t + this.cx;
	}

	// Newton first, bisection if the slope flattens out.
	private solve(x: number): number {
		let t = x;
		for (let i = 0; i < 8; i++) {
			const error = this.sampleX(t) - x;
			if (Math.abs(error) < 1e-6) return t;
			const slope = this.slopeX(t);
			if (Math.abs(slope) < 1e-6) break;
			t -= error / slope;
		}
		let lower = 0;
		let upper = 1;
		t = x;
		while (lower < upper) {
			const value = this.sampleX(t);
			if (Math.abs(value - x) < 1e-6) return t;
			if (x > value) lower = t;
			else upper = t;
			t = (upper - lower) * 0.5 + lower;
			if (upper - lower < 1e-7) break;
		}
		return t;
	}
}

export interface Timing {
	readonly delay: number;
	readonly settleTime: number;
	progress(elapsed: number): number;
}

class CurveTiming implements Timing {
	constructor(
		private readonly duration: number,
		readonly delay: number,
		private readonly easing: CubicBezier,
	) {}

	get settleTime() {
		return this.duration;
	}

	progress(elapsed: number) {
		const time = elapsed - this.delay;
		return time <= 0 ? 0 : this.easing.value(time / this.duration);
	}
}

class SpringTiming implements Timing {
	private readonly omega: number;
	private readonly zeta: number;

	constructor(damping: number, stiffness: number, mass: number, readonly delay: number) {
		this.omega = Math.sqrt(stiffness / mass);
		this.zeta = damping / (2 * Math.sqrt(stiffness * mass));
	}

	// Time until the remaining motion is under a thousandth of the distance.
	get settleTime() {
		const { omega, zeta } = this;
		const decay = zeta < 1 ? zeta * omega : omega * (zeta - Math.sqrt(zeta * zeta - 1));
		return Math.min(Math.log(1000) / Math.max(decay, 0.0001), 10);
	}

	progress(elapsed: number) {
		const time = elapsed - this.delay;
		if (time <= 0) return 0;
		const { omega, zeta } = this;
		if (zeta < 1) {
			const damped = omega * Math.sqrt(1 - zeta * zeta);
			const envelope = Math.exp(-zeta * omega * time);
			return 1 - envelope * (Math.cos(damped * time) + ((zeta * omega) / damped) * Math.sin(damped * time));
		}
		if (zeta === 1) return 1 - Math.exp(-omega * time) * (1 + omega * time);
		const root = Math.sqrt(zeta * zeta - 1);
		const r1 = -omega * (zeta - root);
		const r2 = -omega * (zeta + root);
		return 1 + (r2 / (r1 - r2)) * Math.exp(r1 * time) + (-r1 / (r1 - r2)) * Math.exp(r2 * time);
	}
}

export const isFinished = (timing: Timing, elapsed: number) => elapsed - timing.delay >= timing.settleTime;

/** Keyframe sequences without a transition step every 1.2 s, as on device. */
export const SEQUENCE_DEFAULT: Timing = new CurveTiming(1.2, 0, CubicBezier.EASE_IN_OUT);

/** Resolves the `transition` prop exactly like the JS layer and native records do. */
export function toTiming(transition: Transition | undefined): Timing | null {
	if (!transition) return null;
	if (transition === true) return new CurveTiming(0.6, 0, CubicBezier.of(toBezier("easeInOut")));
	const delay = Math.max(transition.delay ?? 0, 0) / 1000;
	if (transition.type === "spring") {
		return new SpringTiming(
			Math.max(transition.damping ?? 18, 0.01),
			Math.max(transition.stiffness ?? 160, 0.01),
			Math.max(transition.mass ?? 1, 0.01),
			delay,
		);
	}
	const duration = transition.duration ?? 600;
	if (duration <= 0) return null;
	return new CurveTiming(duration / 1000, delay, CubicBezier.of(toBezier(transition.easing ?? "easeInOut")));
}
