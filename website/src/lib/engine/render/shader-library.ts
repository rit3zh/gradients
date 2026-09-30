import { programs } from "../programs/registry";
import type { GradientProgram } from "../programs/program";
import { shaderSources } from "../shaders/generated";

export interface CompiledProgram {
	program: WebGLProgram;
	uniform(name: string): WebGLUniformLocation | null;
}

/**
 * A composite shader is built per variant: specialized to one gradient kind
 * when every layer shares it, and without blend math when every layer is
 * `normal`. Same assembly as the native ShaderLibrary.
 */
export interface CompositeVariant {
	kind: number | null;
	sourceOver: boolean;
}

const VERSION = "#version 300 es\n";

const source = (path: string) => {
	const text = shaderSources[path];
	if (text === undefined) throw new Error(`Missing shader ${path}. Run \`npm run shaders\`.`);
	return `${text}\n`;
};

function dispatch(list: readonly GradientProgram[], specialized: boolean) {
	if (specialized) return `vec4 evaluateLayer(Fragment f, Layer layer) {\n    return ${list[0].fn}(f, layer);\n}\n\n`;
	const cases = list.map((p) => `        case ${programs.indexOf(p)}: return ${p.fn}(f, layer);`).join("\n");
	return `vec4 evaluateLayer(Fragment f, Layer layer) {\n    switch (layer.kind) {\n${cases}\n        default: return vec4(0.0);\n    }\n}\n\n`;
}

function fragmentSource(variant: CompositeVariant) {
	const list = variant.kind === null ? programs : [programs[variant.kind]];
	return [
		VERSION,
		variant.sourceOver ? "#define SOURCE_OVER\n" : "",
		source("core/common.glsl"),
		list.some((p) => p.usesNoise) ? source("core/noise.glsl") : "",
		list.some((p) => p.usesSurfaces) ? source("core/surfaces.glsl") : "",
		variant.sourceOver ? "" : source("core/blend.glsl"),
		...list.map((p) => source(p.shader)),
		dispatch(list, variant.kind !== null),
		source("core/composite.glsl"),
	].join("");
}

function compile(gl: WebGL2RenderingContext, vertex: string, fragment: string): CompiledProgram {
	const shader = (type: number, text: string) => {
		const handle = gl.createShader(type)!;
		gl.shaderSource(handle, text);
		gl.compileShader(handle);
		if (!gl.getShaderParameter(handle, gl.COMPILE_STATUS) && !gl.isContextLost()) {
			const log = gl.getShaderInfoLog(handle);
			gl.deleteShader(handle);
			throw new Error(`Gradient shader failed to compile: ${log}`);
		}
		return handle;
	};

	const program = gl.createProgram()!;
	const vs = shader(gl.VERTEX_SHADER, vertex);
	const fs = shader(gl.FRAGMENT_SHADER, fragment);
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);
	gl.deleteShader(vs);
	gl.deleteShader(fs);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS) && !gl.isContextLost()) {
		throw new Error(`Gradient program failed to link: ${gl.getProgramInfoLog(program)}`);
	}

	const locations = new Map<string, WebGLUniformLocation | null>();
	return {
		program,
		uniform(name) {
			if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
			return locations.get(name)!;
		},
	};
}

export class ShaderLibrary {
	private readonly variants = new Map<string, CompiledProgram | null>();
	private meshProgram: CompiledProgram | null | undefined;

	constructor(private readonly gl: WebGL2RenderingContext) {}

	composite(variant: CompositeVariant): CompiledProgram | null {
		const key = `${variant.kind ?? "generic"}:${variant.sourceOver}`;
		if (!this.variants.has(key)) {
			try {
				this.variants.set(key, compile(this.gl, source("core/composite.vert"), fragmentSource(variant)));
			} catch (error) {
				console.error(error);
				this.variants.set(key, null);
			}
		}
		return this.variants.get(key)!;
	}

	mesh(): CompiledProgram | null {
		if (this.meshProgram === undefined) {
			try {
				this.meshProgram = compile(this.gl, source("core/mesh.vert"), source("core/mesh.frag"));
			} catch (error) {
				console.error(error);
				this.meshProgram = null;
			}
		}
		return this.meshProgram;
	}
}
