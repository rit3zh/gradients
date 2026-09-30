import type { ColorInterpolation } from "../types";
import type { CubicBezier } from "../animation/timing";
import { lerp4, type Rgba } from "../math/vector";
import { decode, encode, output } from "./color-space";

export const RAMP_RESOLUTION = 256;

/** 256 premultiplied sRGB samples between the first and last stop. */
export interface ColorRamp {
	samples: Float32Array;
	rangeStart: number;
	rangeEnd: number;
}

const put = (samples: Float32Array, index: number, color: Rgba) => samples.set(color, index * 4);

export function clearRamp(): ColorRamp {
	return { samples: new Float32Array(RAMP_RESOLUTION * 4), rangeStart: 0, rangeEnd: 1 };
}

/** Stops default to even spacing and never run backwards. */
function normalize(stops: readonly number[], count: number): number[] {
	const positions =
		stops.length === count ? [...stops] : Array.from({ length: count }, (_, i) => i / Math.max(count - 1, 1));
	let floor = Number.NEGATIVE_INFINITY;
	for (let i = 0; i < positions.length; i++) {
		positions[i] = Math.max(positions[i], floor);
		floor = positions[i];
	}
	return positions;
}

export function buildRamp(
	colors: readonly Rgba[],
	stops: readonly number[],
	space: ColorInterpolation,
	easing: CubicBezier,
): ColorRamp {
	if (colors.length === 0) return clearRamp();
	if (colors.length === 1) {
		const ramp = clearRamp();
		const color = output(colors[0]);
		for (let i = 0; i < RAMP_RESOLUTION; i++) put(ramp.samples, i, color);
		return ramp;
	}

	const positions = normalize(stops, colors.length);
	const encoded = colors.map((color) => encode(color, space));
	const lower = positions[0];
	const upper = Math.max(positions[positions.length - 1], lower + 0.0001);
	const samples = new Float32Array(RAMP_RESOLUTION * 4);
	let segment = 0;

	for (let i = 0; i < RAMP_RESOLUTION; i++) {
		const position = lower + (i / (RAMP_RESOLUTION - 1)) * (upper - lower);
		while (segment < positions.length - 2 && position > positions[segment + 1]) segment++;
		const from = positions[segment];
		const to = positions[segment + 1];
		const local =
			to - from > 0.000001 ? Math.min(Math.max((position - from) / (to - from), 0), 1) : position >= to ? 1 : 0;
		const mixed = lerp4(encoded[segment], encoded[segment + 1], easing.value(local));
		put(samples, i, output(decode(mixed, space)));
	}

	return { samples, rangeStart: lower, rangeEnd: upper };
}

export function mixRamps(from: ColorRamp, to: ColorRamp, progress: number): ColorRamp {
	if (from === to) return to;
	const samples = new Float32Array(from.samples.length);
	for (let i = 0; i < samples.length; i++) {
		samples[i] = from.samples[i] + (to.samples[i] - from.samples[i]) * progress;
	}
	return {
		samples,
		rangeStart: from.rangeStart + (to.rangeStart - from.rangeStart) * progress,
		rangeEnd: from.rangeEnd + (to.rangeEnd - from.rangeEnd) * progress,
	};
}
