import type { LayerState } from "../layer/layer-state";
import { KINDS, type Kind } from "../layer/record";
import { flux, interlace, ribbon, silk, smoke, strata, wave } from "./flow";
import { conic, diamond, linear, radial, reflected, sweep } from "./geometric";
import { glow, sky, spotlight, vignette } from "./lighting";
import { aurora, holographic, iridescent, liquid, noise } from "./procedural";
import type { GradientProgram } from "./program";
import { bilinear, freeform, mesh, voronoi } from "./surface";

const PROGRAMS: Record<Kind, GradientProgram> = {
	linear,
	radial,
	conic,
	sweep,
	diamond,
	reflected,
	mesh,
	freeform,
	bilinear,
	noise,
	voronoi,
	glow,
	spotlight,
	vignette,
	aurora,
	liquid,
	iridescent,
	wave,
	silk,
	smoke,
	ribbon,
	flux,
	holographic,
	interlace,
	sky,
	strata,
};

/** In shader ordinal order. */
export const programs: readonly GradientProgram[] = KINDS.map((kind) => PROGRAMS[kind]);

export const programFor = (kind: Kind) => PROGRAMS[kind];

export const kindIndex = (kind: Kind) => KINDS.indexOf(kind);

export const isLayerAnimated = (state: LayerState) => programFor(state.kind).isAnimated?.(state) ?? false;
