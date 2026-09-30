import type { ColorRamp } from "../../color/color-ramp";
import type { Vec2 } from "../../math/vector";
import type { FrameData } from "../../render/frame-data";
import type { MeshSurface } from "./mesh-surface";

export const MAX_SURFACES = 4;

/** What a program can see and write while encoding one layer. */
export class LayerContext {
	readonly surfaces: MeshSurface[] = [];

	constructor(
		readonly width: number,
		readonly height: number,
		private readonly data: FrameData,
		private readonly previousSurfaces: readonly (MeshSurface | undefined)[],
	) {}

	get minSide() {
		return Math.max(Math.min(this.width, this.height), 1);
	}

	get cursor() {
		return this.data.texelCount;
	}

	pointX(unit: Vec2) {
		return unit[0] * this.width;
	}

	pointY(unit: Vec2) {
		return unit[1] * this.height;
	}

	appendRamp(ramp: ColorRamp) {
		return this.data.putAll(ramp.samples);
	}

	put(x: number, y = 0, z = 0, w = 0) {
		this.data.put(x, y, z, w);
	}

	reusableSurface(key: string): MeshSurface | undefined {
		const previous = this.previousSurfaces[this.surfaces.length];
		return previous?.key === key ? previous : undefined;
	}

	appendSurface(surface: MeshSurface): number | undefined {
		if (this.surfaces.length >= MAX_SURFACES) return undefined;
		this.surfaces.push(surface);
		return this.surfaces.length - 1;
	}
}
