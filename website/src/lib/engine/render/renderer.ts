import { INTERPOLATION_INDEX } from "../color/color-space";
import type { LayerState } from "../layer/layer-state";
import { kindIndex, programFor } from "../programs/registry";
import { LayerContext, MAX_SURFACES } from "../programs/support/layer-context";
import { FLOATS_PER_VERTEX, type MeshSurface } from "../programs/support/mesh-surface";
import { DATA_WIDTH, FrameData, LayerUniforms, MAX_LAYERS, TEXELS_PER_LAYER } from "./frame-data";
import { ShaderLibrary, type CompiledProgram, type CompositeVariant } from "./shader-library";

export interface RenderTarget {
	/** Layout size in CSS pixels; shaders work in these units. */
	width: number;
	height: number;
	/** Drawing buffer size in device pixels. */
	bufferWidth: number;
	bufferHeight: number;
}

export interface RenderOptions {
	tilt: [number, number];
	dither: boolean;
	grain: number;
	border?: { width: number; radius: number };
}

const TILE_MIRROR = 2;
const MAX_SURFACE_SIZE = 2048;
const DATA_UNIT = 0;
const SURFACE_UNIT = 1;
const MASK_UNIT = 5;

/** Mesh surfaces live per view, so each view keeps its own render targets. */
export class ViewSurfaces {
	textures: (WebGLTexture | null)[] = Array(MAX_SURFACES).fill(null);
	framebuffers: (WebGLFramebuffer | null)[] = Array(MAX_SURFACES).fill(null);
	widths: number[] = Array(MAX_SURFACES).fill(0);
	heights: number[] = Array(MAX_SURFACES).fill(0);
	rendered: (MeshSurface | undefined)[] = Array(MAX_SURFACES).fill(undefined);

	release(gl: WebGL2RenderingContext) {
		for (const texture of this.textures) if (texture) gl.deleteTexture(texture);
		for (const framebuffer of this.framebuffers) if (framebuffer) gl.deleteFramebuffer(framebuffer);
		this.textures.fill(null);
		this.framebuffers.fill(null);
		this.rendered.fill(undefined);
	}
}

export class GradientRenderer {
	private readonly library: ShaderLibrary;
	private readonly frame = new FrameData();
	private readonly layers = Array.from({ length: MAX_LAYERS }, () => new LayerUniforms());

	private readonly dataTexture: WebGLTexture;
	private dataRows = 0;
	private readonly emptyTexture: WebGLTexture;
	private readonly compositeVao: WebGLVertexArrayObject;
	private readonly meshVao: WebGLVertexArrayObject;
	private readonly meshVbo: WebGLBuffer;
	private readonly indexBuffers = new Map<string, { buffer: WebGLBuffer; count: number }>();

	constructor(private readonly gl: WebGL2RenderingContext) {
		this.library = new ShaderLibrary(gl);
		this.dataTexture = this.createTexture(gl.NEAREST);
		this.emptyTexture = this.createTexture(gl.NEAREST);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
		this.compositeVao = gl.createVertexArray()!;

		this.meshVao = gl.createVertexArray()!;
		this.meshVbo = gl.createBuffer()!;
		gl.bindVertexArray(this.meshVao);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.meshVbo);
		const stride = FLOATS_PER_VERTEX * 4;
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);
		gl.enableVertexAttribArray(1);
		gl.vertexAttribPointer(1, 4, gl.FLOAT, false, stride, 8);
		gl.bindVertexArray(null);
	}

	/** Builds the shader a set of layers will need ahead of its first frame. */
	warm(states: LayerState[]) {
		this.library.composite(this.variantOf(states));
	}

	render(states: LayerState[], target: RenderTarget, options: RenderOptions, surfaces: ViewSurfaces): boolean {
		const { gl, frame } = this;
		frame.reset(MAX_LAYERS * TEXELS_PER_LAYER);
		const context = new LayerContext(target.width, target.height, frame, surfaces.rendered);

		const visible = states.filter((state) => state.parameters.opacity > 0.001).slice(0, MAX_LAYERS);
		visible.forEach((state, index) => this.encode(state, this.layers[index], context));
		visible.forEach((_, index) => this.layers[index].writeTo(frame.floats, index * TEXELS_PER_LAYER * 4));

		const program = this.library.composite(this.variantOf(visible));
		if (!program) return false;

		this.drawSurfaces(context, target, surfaces);
		this.uploadData();
		this.composite(program, visible.length, target, options, surfaces);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		return true;
	}

	private variantOf(states: LayerState[]): CompositeVariant {
		if (states.length === 0) return { kind: null, sourceOver: false };
		const first = states[0].kind;
		const uniform = states.every((state) => state.kind === first);
		const sourceOver = states.every((state) => state.blend === 0);
		return { kind: uniform ? kindIndex(first) : null, sourceOver };
	}

	private encode(state: LayerState, uniforms: LayerUniforms, context: LayerContext) {
		const { parameters } = state;
		// Flowing colors need a seamless ramp, so clamp becomes mirror.
		const tile = parameters.flow !== 0 && state.tile === 0 ? TILE_MIRROR : state.tile;

		Object.assign(uniforms, new LayerUniforms());
		uniforms.kind = kindIndex(state.kind);
		uniforms.blend = state.blend;
		uniforms.tile = tile;
		uniforms.space = INTERPOLATION_INDEX[state.interpolation];
		uniforms.opacity = Math.min(Math.max(parameters.opacity, 0), 1);
		uniforms.time = state.clock % 3600;
		uniforms.rangeStart = state.ramp.rangeStart;
		uniforms.rangeEnd = state.ramp.rangeEnd;
		uniforms.ramp = context.appendRamp(state.ramp);

		if (parameters.flow !== 0) {
			const span = state.ramp.rangeEnd - state.ramp.rangeStart;
			const period = Math.max(span * (tile === TILE_MIRROR ? 2 : 1), 0.0001);
			uniforms.phase = (-parameters.flow * state.clock * span) % period;
		}

		programFor(state.kind).encode(state, uniforms, context);
	}

	private drawSurfaces(context: LayerContext, target: RenderTarget, surfaces: ViewSurfaces) {
		if (context.surfaces.length === 0) return;
		const { gl } = this;
		const program = this.library.mesh();
		if (!program) return;
		const width = Math.min(Math.max(Math.ceil(target.width), 1), MAX_SURFACE_SIZE);
		const height = Math.min(Math.max(Math.ceil(target.height), 1), MAX_SURFACE_SIZE);

		context.surfaces.forEach((surface, index) => {
			const current =
				surfaces.rendered[index]?.key === surface.key &&
				surfaces.widths[index] === width &&
				surfaces.heights[index] === height;
			if (current) return;

			surfaces.rendered[index] = undefined;
			const indices = this.indexBuffer(surface.columns, surface.rows);
			if (!indices) return;
			this.prepareSurface(surfaces, index, width, height);

			gl.bindFramebuffer(gl.FRAMEBUFFER, surfaces.framebuffers[index]);
			gl.viewport(0, 0, width, height);
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.useProgram(program.program);
			gl.bindVertexArray(this.meshVao);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.meshVbo);
			gl.bufferData(gl.ARRAY_BUFFER, surface.vertices, gl.DYNAMIC_DRAW);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices.buffer);
			gl.drawElements(gl.TRIANGLES, indices.count, gl.UNSIGNED_INT, 0);
			gl.bindVertexArray(null);
			surfaces.rendered[index] = surface;
		});
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	private prepareSurface(surfaces: ViewSurfaces, index: number, width: number, height: number) {
		const { gl } = this;
		if (surfaces.textures[index] && surfaces.widths[index] === width && surfaces.heights[index] === height) return;
		surfaces.textures[index] ??= this.createTexture(gl.LINEAR);
		surfaces.framebuffers[index] ??= gl.createFramebuffer();
		gl.bindTexture(gl.TEXTURE_2D, surfaces.textures[index]);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, surfaces.framebuffers[index]);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, surfaces.textures[index], 0);
		surfaces.widths[index] = width;
		surfaces.heights[index] = height;
	}

	private indexBuffer(columns: number, rows: number) {
		if (columns < 2 || rows < 2) return null;
		const key = `${columns}x${rows}`;
		const cached = this.indexBuffers.get(key);
		if (cached) return cached;

		const { gl } = this;
		const indices = new Uint32Array((columns - 1) * (rows - 1) * 6);
		let cursor = 0;
		for (let row = 0; row < rows - 1; row++) {
			for (let column = 0; column < columns - 1; column++) {
				const topLeft = row * columns + column;
				const bottomLeft = topLeft + columns;
				indices.set([topLeft, bottomLeft, topLeft + 1, topLeft + 1, bottomLeft, bottomLeft + 1], cursor);
				cursor += 6;
			}
		}
		const buffer = gl.createBuffer()!;
		gl.bindVertexArray(null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
		const entry = { buffer, count: indices.length };
		this.indexBuffers.set(key, entry);
		return entry;
	}

	private uploadData() {
		const { gl, frame } = this;
		const rows = Math.ceil(frame.texelCount / DATA_WIDTH);
		frame.ensureCapacity(rows * DATA_WIDTH);

		gl.activeTexture(gl.TEXTURE0 + DATA_UNIT);
		gl.bindTexture(gl.TEXTURE_2D, this.dataTexture);
		if (rows > this.dataRows) {
			this.dataRows = Math.max(rows, this.dataRows * 2);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, DATA_WIDTH, this.dataRows, 0, gl.RGBA, gl.FLOAT, null);
		}
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, DATA_WIDTH, rows, gl.RGBA, gl.FLOAT, frame.floats, 0);
	}

	private composite(
		program: CompiledProgram,
		count: number,
		target: RenderTarget,
		options: RenderOptions,
		surfaces: ViewSurfaces,
	) {
		const { gl } = this;
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, target.bufferWidth, target.bufferHeight);
		gl.disable(gl.BLEND);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(program.program);
		gl.uniform2f(program.uniform("uSize"), target.width, target.height);
		gl.uniform2f(program.uniform("uTilt"), options.tilt[0], options.tilt[1]);
		gl.uniform1f(program.uniform("uScale"), target.bufferWidth / target.width);
		gl.uniform1f(program.uniform("uDither"), options.dither ? 1 : 0);
		gl.uniform1f(program.uniform("uGrain"), options.grain);
		gl.uniform1i(program.uniform("uLayerCount"), count);
		// 2 is the border ring; text masks are applied on the 2D canvas instead.
		gl.uniform1i(program.uniform("uMaskMode"), options.border ? 2 : 0);
		gl.uniform2f(program.uniform("uBorder"), options.border?.width ?? 0, options.border?.radius ?? 0);

		this.bindSampler(program, "uData", DATA_UNIT, this.dataTexture);
		for (let index = 0; index < MAX_SURFACES; index++) {
			this.bindSampler(program, `uSurface${index}`, SURFACE_UNIT + index, surfaces.textures[index] ?? this.emptyTexture);
		}
		this.bindSampler(program, "uMask", MASK_UNIT, this.emptyTexture);

		gl.bindVertexArray(this.compositeVao);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		gl.bindVertexArray(null);
	}

	private bindSampler(program: CompiledProgram, name: string, unit: number, texture: WebGLTexture) {
		const location = program.uniform(name);
		if (location === null) return;
		const { gl } = this;
		gl.activeTexture(gl.TEXTURE0 + unit);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(location, unit);
	}

	private createTexture(filter: number) {
		const { gl } = this;
		const texture = gl.createTexture()!;
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		return texture;
	}
}
