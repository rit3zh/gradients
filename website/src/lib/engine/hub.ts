import { Animator } from "./animation/animator";
import { toTiming } from "./animation/timing";
import { createLayerState } from "./layer/layer-state";
import { isLayerAnimated, programFor } from "./programs/registry";
import { GradientRenderer, ViewSurfaces } from "./render/renderer";
import type { GradientScene } from "./types";

/** Browsers render the page at up to 3x; beyond 2x a smooth field gains nothing. */
const MAX_PIXEL_RATIO = 2;
/** Tilt eases toward the pointer instead of snapping, like device motion does. */
const TILT_SMOOTHING = 0.12;

export interface ViewOptions {
	/** Freezes the clocks. The current frame stays on screen. */
	paused: boolean;
	/** Draws on top of the gradient, e.g. text used as a mask. */
	decorate?: (context: CanvasRenderingContext2D, width: number, height: number) => void;
}

/** One on-page canvas. The hub renders into it only while it is visible. */
export class GradientView {
	readonly animator = new Animator();
	readonly surfaces = new ViewSurfaces();
	scene: GradientScene = { layers: [] };
	options: ViewOptions = { paused: false };
	width = 0;
	height = 0;
	visible = false;
	needsRender = true;
	tilt: [number, number] = [0, 0];
	tiltTarget: [number, number] = [0, 0];
	/** Called once, after the first frame lands on the canvas. */
	onFirstFrame?: () => void;
	private presented = false;
	private readonly context: CanvasRenderingContext2D | null;

	constructor(readonly canvas: HTMLCanvasElement) {
		this.context = canvas.getContext("2d");
	}

	get isContinuous() {
		const tilting =
			Math.abs(this.tilt[0] - this.tiltTarget[0]) > 1e-3 || Math.abs(this.tilt[1] - this.tiltTarget[1]) > 1e-3;
		return this.animator.isAnimating || tilting || this.animator.presentation.some(isLayerAnimated);
	}

	get pixelRatio() {
		const device = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
		// A stack renders at the finest resolution any of its layers asks for.
		const caps = this.animator.presentation.map((state) => programFor(state.kind).resolution);
		if (caps.length === 0 || caps.some((cap) => cap === undefined)) return device;
		return Math.min(device, Math.max(...(caps as number[])));
	}

	present(source: HTMLCanvasElement, bufferWidth: number, bufferHeight: number) {
		const { canvas, context } = this;
		if (!context) return;
		if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
			canvas.width = bufferWidth;
			canvas.height = bufferHeight;
		}
		context.globalCompositeOperation = "copy";
		// WebGL's origin is bottom-left, so the view sits at the bottom of the shared canvas.
		context.drawImage(
			source,
			0,
			source.height - bufferHeight,
			bufferWidth,
			bufferHeight,
			0,
			0,
			bufferWidth,
			bufferHeight,
		);
		context.globalCompositeOperation = "source-over";
		if (this.options.decorate) {
			context.save();
			context.scale(bufferWidth / this.width, bufferHeight / this.height);
			this.options.decorate(context, this.width, this.height);
			context.restore();
		}
		if (!this.presented) {
			this.presented = true;
			this.onFirstFrame?.();
		}
	}
}

class GradientHub {
	private readonly canvas = document.createElement("canvas");
	private readonly gl: WebGL2RenderingContext | null;
	private renderer: GradientRenderer | null = null;
	private readonly views = new Set<GradientView>();
	private frame = 0;
	private lastTime = 0;

	constructor() {
		this.gl = this.canvas.getContext("webgl2", {
			alpha: true,
			premultipliedAlpha: true,
			antialias: false,
			depth: false,
			stencil: false,
			preserveDrawingBuffer: false,
			powerPreference: "low-power",
		});
		if (this.gl) {
			this.renderer = new GradientRenderer(this.gl);
			this.canvas.addEventListener("webglcontextlost", (event) => {
				event.preventDefault();
				this.renderer = null;
			});
			this.canvas.addEventListener("webglcontextrestored", () => {
				this.renderer = new GradientRenderer(this.gl!);
				for (const view of this.views) {
					view.surfaces.textures.fill(null);
					view.surfaces.framebuffers.fill(null);
					view.surfaces.rendered.fill(undefined);
					view.needsRender = true;
				}
				this.schedule();
			});
		}
		document.addEventListener("visibilitychange", () => this.schedule());
	}

	get supported() {
		return this.gl !== null;
	}

	attach(view: GradientView) {
		this.views.add(view);
		this.schedule();
	}

	detach(view: GradientView) {
		this.views.delete(view);
		if (this.gl) view.surfaces.release(this.gl);
	}

	setScene(view: GradientView, scene: GradientScene) {
		const layers = scene.layers.map(createLayerState);
		const keyframes = (scene.keyframes ?? []).map((frame) => frame.map(createLayerState));
		view.scene = scene;
		view.animator.update(layers, keyframes, toTiming(scene.transition), scene.loop ?? true);
		this.renderer?.warm(layers);
		this.invalidate(view);
	}

	invalidate(view: GradientView) {
		view.needsRender = true;
		this.schedule();
	}

	schedule() {
		if (this.frame || document.hidden) return;
		this.frame = requestAnimationFrame(this.tick);
	}

	private readonly tick = (time: number) => {
		this.frame = 0;
		const delta = this.lastTime ? Math.min(Math.max((time - this.lastTime) / 1000, 0), 0.1) : 0;
		this.lastTime = time;
		let continuous = false;

		for (const view of this.views) {
			if (!view.visible || view.width < 1 || view.height < 1) continue;
			if (!view.options.paused) view.animator.step(delta);
			view.tilt = [
				view.tilt[0] + (view.tiltTarget[0] - view.tilt[0]) * TILT_SMOOTHING,
				view.tilt[1] + (view.tiltTarget[1] - view.tilt[1]) * TILT_SMOOTHING,
			];
			const animated = !view.options.paused && view.isContinuous;
			if (view.needsRender || animated) this.render(view);
			continuous ||= animated;
		}

		// The loop sleeps when nothing moves; a prop change wakes it again.
		if (continuous) this.schedule();
		else this.lastTime = 0;
	};

	private render(view: GradientView) {
		const { gl, renderer, canvas } = this;
		if (!gl || !renderer) return;
		const ratio = view.pixelRatio;
		const bufferWidth = Math.max(1, Math.round(view.width * ratio));
		const bufferHeight = Math.max(1, Math.round(view.height * ratio));
		// The shared canvas only grows, so switching between views never reallocates.
		if (canvas.width < bufferWidth || canvas.height < bufferHeight) {
			canvas.width = Math.max(canvas.width, bufferWidth);
			canvas.height = Math.max(canvas.height, bufferHeight);
		}
		const target = { width: view.width, height: view.height, bufferWidth, bufferHeight };
		const options = {
			tilt: view.tilt,
			dither: view.scene.dither ?? true,
			grain: Math.max(view.scene.grain ?? 0, 0),
			border: view.scene.border,
		};
		if (renderer.render(view.animator.presentation, target, options, view.surfaces)) {
			view.present(canvas, bufferWidth, bufferHeight);
			view.needsRender = false;
		}
	}
}

let hub: GradientHub | undefined;

/** The page-wide hub, created on first use in the browser. */
export function getHub(): GradientHub {
	hub ??= new GradientHub();
	return hub;
}
