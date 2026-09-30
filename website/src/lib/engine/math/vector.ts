export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Rgba = [number, number, number, number];

export const clamp = (value: number, lower: number, upper: number) =>
	Math.min(Math.max(value, lower), upper);

export const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

export const lerp2 = (from: Vec2, to: Vec2, t: number): Vec2 => [
	lerp(from[0], to[0], t),
	lerp(from[1], to[1], t),
];

export const lerp3 = (from: Vec3, to: Vec3, t: number): Vec3 => [
	lerp(from[0], to[0], t),
	lerp(from[1], to[1], t),
	lerp(from[2], to[2], t),
];

export const lerp4 = (from: Rgba, to: Rgba, t: number): Rgba => [
	lerp(from[0], to[0], t),
	lerp(from[1], to[1], t),
	lerp(from[2], to[2], t),
	lerp(from[3], to[3], t),
];
