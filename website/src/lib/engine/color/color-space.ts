import type { ColorInterpolation } from "../types";
import type { Rgba } from "../math/vector";

export const CLEAR: Rgba = [0, 0, 0, 0];

// Enum ordinals shared with the shaders (`layer.space`).
export const INTERPOLATION_INDEX: Record<ColorInterpolation, number> = { srgb: 0, linear: 1, oklab: 2 };

export const linearize = (value: number) =>
	value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);

export function gamma(value: number) {
	const clamped = Math.min(Math.max(value, 0), 1);
	return clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
}

const parsed = new Map<string, Rgba>();
let probe: CanvasRenderingContext2D | null | undefined;

/**
 * Any CSS color, resolved the way `processColor` does on device: quantized to
 * 8 bits, then linearized. The browser's own parser handles every syntax.
 */
export function parseColor(input: string): Rgba {
	const cached = parsed.get(input);
	if (cached) return cached;

	probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
	if (!probe) return CLEAR;
	probe.clearRect(0, 0, 1, 1);
	probe.fillStyle = "#000";
	probe.fillStyle = input;
	probe.fillRect(0, 0, 1, 1);
	const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
	// getImageData un-premultiplies, which loses precision at low alpha; the
	// colour of a fully transparent stop doesn't matter, so that's harmless.
	const color: Rgba = [linearize(r / 255), linearize(g / 255), linearize(b / 255), a / 255];
	parsed.set(input, color);
	return color;
}

function oklab(r: number, g: number, b: number): [number, number, number] {
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
	return [
		0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
		1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
		0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
	];
}

function linearFromOklab(lightness: number, a: number, b: number): [number, number, number] {
	const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
	return [
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
	];
}

/** Linear color into the interpolation space, premultiplied. */
export function encode([r, g, b, a]: Rgba, space: ColorInterpolation): Rgba {
	const [x, y, z] =
		space === "srgb" ? [gamma(r), gamma(g), gamma(b)] : space === "linear" ? [r, g, b] : oklab(r, g, b);
	return [x * a, y * a, z * a, a];
}

/** Premultiplied interpolation-space color back to linear. */
export function decode([pr, pg, pb, alpha]: Rgba, space: ColorInterpolation): Rgba {
	if (alpha <= 0.00001) return CLEAR;
	const x = pr / alpha;
	const y = pg / alpha;
	const z = pb / alpha;
	const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
	const [r, g, b] =
		space === "srgb"
			? [linearize(clamp01(x)), linearize(clamp01(y)), linearize(clamp01(z))]
			: space === "linear"
				? [x, y, z]
				: linearFromOklab(x, y, z);
	return [r, g, b, alpha];
}

/** Linear color to premultiplied sRGB, the format every ramp sample is stored in. */
export function output([r, g, b, a]: Rgba): Rgba {
	const alpha = Math.min(Math.max(a, 0), 1);
	return [gamma(r) * alpha, gamma(g) * alpha, gamma(b) * alpha, alpha];
}
