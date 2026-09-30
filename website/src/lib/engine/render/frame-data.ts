// Everything a frame needs goes into one RGBA32F texture: eight texels per
// layer, then colour ramps and per-layer site data. Shaders read it with
// texelFetch (see `loadLayer` in core/common.glsl).

export const MAX_LAYERS = 16;
export const DATA_WIDTH = 256;
export const TEXELS_PER_LAYER = 8;

export class FrameData {
	floats = new Float32Array(4096 * 4);
	texelCount = 0;

	reset(reservedTexels: number) {
		this.ensureCapacity(reservedTexels);
		this.floats.fill(0, 0, reservedTexels * 4);
		this.texelCount = reservedTexels;
	}

	put(x: number, y = 0, z = 0, w = 0) {
		this.ensureCapacity(this.texelCount + 1);
		this.floats.set([x, y, z, w], this.texelCount * 4);
		this.texelCount++;
	}

	putAll(values: Float32Array): number {
		const start = this.texelCount;
		this.ensureCapacity(this.texelCount + values.length / 4);
		this.floats.set(values, this.texelCount * 4);
		this.texelCount += values.length / 4;
		return start;
	}

	ensureCapacity(texels: number) {
		if (texels * 4 <= this.floats.length) return;
		let capacity = this.floats.length;
		while (capacity < texels * 4) capacity *= 2;
		const grown = new Float32Array(capacity);
		grown.set(this.floats);
		this.floats = grown;
	}
}

/** Mirrors the `Layer` struct in core/common.glsl. */
export class LayerUniforms {
	a: [number, number, number, number] = [0, 0, 0, 0];
	b: [number, number, number, number] = [0, 0, 0, 0];
	c: [number, number, number, number] = [0, 0, 0, 0];
	d: [number, number, number, number] = [0, 0, 0, 0];
	rangeStart = 0;
	rangeEnd = 1;
	opacity = 1;
	time = 0;
	phase = 0;
	kind = 0;
	blend = 0;
	tile = 0;
	space = 0;
	ramp = 0;
	data = 0;
	count = 0;
	surface = 0;

	writeTo(target: Float32Array, offset: number) {
		target.set(this.a, offset);
		target.set(this.b, offset + 4);
		target.set(this.c, offset + 8);
		target.set(this.d, offset + 12);
		target.set(
			[
				this.rangeStart,
				this.rangeEnd,
				this.opacity,
				this.time,
				this.phase,
				this.kind,
				this.blend,
				this.tile,
				this.space,
				this.ramp,
				this.data,
				this.count,
				this.surface,
				0,
				0,
				0,
			],
			offset + 16,
		);
	}
}

export const set4 = (target: number[], x: number, y = 0, z = 0, w = 0) => {
	target[0] = x;
	target[1] = y;
	target[2] = z;
	target[3] = w;
};
