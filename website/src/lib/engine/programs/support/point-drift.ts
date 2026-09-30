import { SeededRandom } from "../../math/seeded-random";
import type { Vec2 } from "../../math/vector";

/**
 * Moves each site along its own slow Lissajous path. Mesh edge points only
 * slide along their edge, so the surface always covers the whole view.
 */
export function drift(
	points: Vec2[],
	amount: number,
	clock: number,
	seed: number,
	reach: Vec2,
	grid?: { rows: number; columns: number },
): Vec2[] {
	if (amount <= 0) return points;
	const random = new SeededRandom(seed + 17);
	return points.map(([x, y], index) => {
		const frequencyX = 0.35 + random.unit() * 0.5;
		const frequencyY = 0.35 + random.unit() * 0.5;
		const phaseX = random.unit() * 2 * Math.PI;
		const phaseY = random.unit() * 2 * Math.PI;
		let offsetX = Math.sin(clock * frequencyX + phaseX) * reach[0] * amount;
		let offsetY = Math.cos(clock * frequencyY + phaseY) * reach[1] * amount;
		if (grid) {
			const row = Math.floor(index / grid.columns);
			const column = index % grid.columns;
			if (column === 0 || column === grid.columns - 1) offsetX = 0;
			if (row === 0 || row === grid.rows - 1) offsetY = 0;
		}
		return [x + offsetX, y + offsetY];
	});
}
