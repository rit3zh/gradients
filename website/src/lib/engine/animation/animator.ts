import { faded, isCompatible, mixStates, type LayerState } from "../layer/layer-state";
import { SEQUENCE_DEFAULT, isFinished, type Timing } from "./timing";

/**
 * Port of the native GradientAnimator. It owns what is on screen
 * (`presentation`), steps transitions between prop changes, walks keyframe
 * sequences and advances every layer's clock by `delta * speed`.
 */
export class Animator {
	presentation: LayerState[] = [];

	private origin: LayerState[] = [];
	private target: LayerState[] = [];
	private timing: Timing | null = null;
	private elapsed = 0;

	private frames: LayerState[][] = [];
	private frameIndex = 0;
	private loops = true;
	private sequenceTiming: Timing = SEQUENCE_DEFAULT;

	get isAnimating(): boolean {
		return this.timing !== null || this.isSequencing;
	}

	private get isSequencing(): boolean {
		return this.frames.length > 1 && (this.loops || this.frameIndex < this.frames.length - 1);
	}

	update(layers: LayerState[], keyframes: LayerState[][], timing: Timing | null, loop: boolean) {
		this.frames = keyframes.length === 0 ? [] : [layers, ...keyframes];
		this.frameIndex = 0;
		this.loops = loop;
		if (timing) this.sequenceTiming = timing;
		this.transition(layers, timing);
	}

	step(delta: number) {
		advanceClocks(this.origin, delta);
		advanceClocks(this.target, delta);

		if (!this.timing) {
			this.presentation = this.target;
			if (this.isSequencing) this.advanceSequence();
			return;
		}

		this.elapsed += delta;
		const progress = this.timing.progress(this.elapsed);
		if (isFinished(this.timing, this.elapsed)) {
			this.timing = null;
			this.presentation = this.target;
			if (this.isSequencing) this.advanceSequence();
		} else {
			this.presentation = blend(this.origin, this.target, progress);
		}
	}

	private transition(layers: LayerState[], timing: Timing | null) {
		const inherited = this.inheritClocks(layers);
		if (!timing || this.presentation.length === 0) {
			this.origin = [];
			this.target = inherited;
			this.presentation = inherited;
			this.timing = null;
			return;
		}
		this.origin = this.presentation;
		this.target = inherited;
		this.elapsed = 0;
		this.timing = timing;
	}

	private advanceSequence() {
		if (this.frames.length <= 1) return;
		const next = this.frameIndex + 1;
		if (next >= this.frames.length) {
			if (!this.loops) return;
			this.frameIndex = 0;
		} else {
			this.frameIndex = next;
		}
		this.transition(this.frames[this.frameIndex], this.sequenceTiming);
	}

	// A layer that keeps its kind keeps its clock, so a prop change never
	// rewinds the motion already on screen.
	private inheritClocks(layers: LayerState[]): LayerState[] {
		return layers.map((layer, i) => {
			const current = this.presentation[i];
			return current && current.kind === layer.kind ? { ...layer, clock: current.clock } : { ...layer };
		});
	}
}

function advanceClocks(layers: LayerState[], delta: number) {
	if (delta <= 0) return;
	for (const layer of layers) layer.clock += delta * layer.parameters.speed;
}

// Compatible layers blend field by field; anything else crossfades.
function blend(origin: LayerState[], target: LayerState[], progress: number): LayerState[] {
	const fade = Math.min(Math.max(progress, 0), 1);
	if (origin.length !== target.length) {
		return [...origin.map((layer) => faded(layer, 1 - fade)), ...target.map((layer) => faded(layer, fade))];
	}
	return origin.flatMap((from, i) => {
		const to = target[i];
		return isCompatible(from, to) ? [mixStates(from, to, progress)] : [faded(from, 1 - fade), faded(to, fade)];
	});
}
