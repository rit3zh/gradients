import type { ColorInterpolation } from "../../types";
import { decode, encode, output } from "../../color/color-space";
import { clamp, type Rgba, type Vec2 } from "../../math/vector";

export const FLOATS_PER_VERTEX = 6;

export interface MeshSurface {
	/** Identity of the inputs, so an unchanged mesh is never re-tessellated. */
	key: string;
	vertices: Float32Array;
	columns: number;
	rows: number;
}

export interface MeshInput {
	points: Vec2[];
	colors: Rgba[];
	rows: number;
	columns: number;
	space: ColorInterpolation;
	smoothness: number;
}

export const meshKey = (input: MeshInput) =>
	JSON.stringify([input.points, input.colors, input.rows, input.columns, input.space, input.smoothness]);

// Blends linear (eased) and Catmull-Rom weights; smoothness 1 is a full spline.
function weights(t: number, tension: number): number[] {
	const t2 = t * t;
	const t3 = t2 * t;
	const spline = [(-t3 + 2 * t2 - t) * 0.5, (3 * t3 - 5 * t2 + 2) * 0.5, (-3 * t3 + 4 * t2 + t) * 0.5, (t3 - t2) * 0.5];
	const eased = t2 * (3 - 2 * t);
	const linear = [0, 1 - eased, eased, 0];
	return linear.map((value, i) => value + (spline[i] - value) * tension);
}

// One ring of mirrored control points around the grid, so edge patches have
// neighbours to curve toward.
function paddedPositions(points: Vec2[], rows: number, columns: number): Vec2[] {
	const stride = columns + 2;
	const padded: Vec2[] = Array.from({ length: (rows + 2) * stride }, () => [0, 0]);
	const reflect = (a: Vec2, b: Vec2): Vec2 => [a[0] * 2 - b[0], a[1] * 2 - b[1]];
	for (let row = 0; row < rows; row++) {
		const offset = (row + 1) * stride;
		for (let column = 0; column < columns; column++) padded[offset + column + 1] = points[row * columns + column];
		padded[offset] = reflect(padded[offset + 1], padded[offset + 2]);
		padded[offset + columns + 1] = reflect(padded[offset + columns], padded[offset + columns - 1]);
	}
	for (let column = 0; column < stride; column++) {
		padded[column] = reflect(padded[stride + column], padded[2 * stride + column]);
		const last = (rows + 1) * stride + column;
		padded[last] = reflect(padded[last - stride], padded[last - 2 * stride]);
	}
	return padded;
}

function paddedColors(colors: Rgba[], rows: number, columns: number): Rgba[] {
	const stride = columns + 2;
	return Array.from({ length: (rows + 2) * stride }, (_, index) => {
		const row = clamp(Math.floor(index / stride) - 1, 0, rows - 1);
		const column = clamp((index % stride) - 1, 0, columns - 1);
		return colors[row * columns + column];
	});
}

export function tessellate(input: MeshInput, key = meshKey(input)): MeshSurface {
	const { rows, columns } = input;
	const subdivisions = clamp(Math.floor(64 / Math.max(rows - 1, columns - 1)), 6, 16);
	const gridColumns = (columns - 1) * subdivisions + 1;
	const gridRows = (rows - 1) * subdivisions + 1;
	const tension = clamp(input.smoothness, 0, 1);

	const stride = columns + 2;
	const lattice = paddedPositions(input.points, rows, columns);
	const tints = paddedColors(
		input.colors.map((color) => encode(color, input.space)),
		rows,
		columns,
	);
	const steps = Array.from({ length: subdivisions + 1 }, (_, i) => weights(i / subdivisions, tension));
	const vertices = new Float32Array(gridColumns * gridRows * FLOATS_PER_VERTEX);
	let cursor = 0;

	for (let gridRow = 0; gridRow < gridRows; gridRow++) {
		const row = Math.min(Math.floor(gridRow / subdivisions), rows - 2);
		const wy = steps[gridRow - row * subdivisions];
		for (let gridColumn = 0; gridColumn < gridColumns; gridColumn++) {
			const column = Math.min(Math.floor(gridColumn / subdivisions), columns - 2);
			const wx = steps[gridColumn - column * subdivisions];

			let x = 0;
			let y = 0;
			const tint: Rgba = [0, 0, 0, 0];
			for (let i = 0; i < 4; i++) {
				const base = (row + i) * stride + column;
				for (let j = 0; j < 4; j++) {
					const weight = wy[i] * wx[j];
					if (weight === 0) continue;
					const position = lattice[base + j];
					const color = tints[base + j];
					x += position[0] * weight;
					y += position[1] * weight;
					tint[0] += color[0] * weight;
					tint[1] += color[1] * weight;
					tint[2] += color[2] * weight;
					tint[3] += color[3] * weight;
				}
			}

			const [r, g, b, a] = output(decode(tint, input.space));
			vertices.set([x, y, r, g, b, a], cursor);
			cursor += FLOATS_PER_VERTEX;
		}
	}

	return { key, vertices, columns: gridColumns, rows: gridRows };
}
