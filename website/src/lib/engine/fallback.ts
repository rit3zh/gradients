import type { GradientLayer } from "./types";
import { PALETTES } from "./layer/presets";

const DEFAULT_COLORS: Partial<Record<GradientLayer["type"], readonly string[]>> = {
	radial: PALETTES.dusk,
	sweep: PALETTES.ocean,
	wave: PALETTES.ocean,
	reflected: PALETTES.reflected,
	mesh: PALETTES.mesh.slice(0, 9),
	freeform: PALETTES.corners,
	bilinear: PALETTES.corners,
	voronoi: PALETTES.mesh.slice(0, 6),
	noise: PALETTES.noise,
	smoke: PALETTES.noise,
	aurora: PALETTES.aurora,
	liquid: PALETTES.liquid,
	iridescent: PALETTES.spectrum,
	holographic: PALETTES.spectrum,
	interlace: PALETTES.interlace,
	strata: PALETTES.strata,
	sky: ["#9ec5ff", "#e8f1ff"],
};

/**
 * A CSS stand-in painted before the first WebGL frame (and on the server),
 * so a preview never flashes empty.
 */
export function fallbackBackground(layers: readonly GradientLayer[]): string {
	const layer = layers.find((candidate) => candidate.type !== "vignette") ?? layers[0];
	if (!layer) return "transparent";
	const colors = layer.colors ?? DEFAULT_COLORS[layer.type] ?? PALETTES.dusk;
	const stops = colors.length === 1 ? [colors[0], colors[0]] : colors;
	return `linear-gradient(${layer.angle ?? 180}deg, ${stops.join(", ")})`;
}
