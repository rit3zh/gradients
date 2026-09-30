import type { GradientLayer, GradientType } from "@/lib/engine/types";

export type GradientCategory = "geometric" | "surface" | "procedural" | "flow" | "lighting";

export interface CatalogEntry {
	type: Exclude<GradientType, "angular">;
	/** The exported component name. */
	component: string;
	category: GradientCategory;
	/** One line about what it looks like. */
	caption: string;
	/** A tasteful example, used for the live preview and its code sample. */
	example: GradientLayer;
	/** Painted behind the gradient for types that draw partly transparent. */
	backdrop?: string;
}

export const categories: { id: GradientCategory; label: string; description: string }[] = [
	{ id: "geometric", label: "Geometric", description: "Classic lines, rings and angles, drawn analytically." },
	{ id: "surface", label: "Surface", description: "Colors pinned to points and blended across the view." },
	{ id: "procedural", label: "Procedural", description: "Noise-driven fields with depth and sheen." },
	{ id: "flow", label: "Flow", description: "Folds, swells and ribbons that move on their own." },
	{ id: "lighting", label: "Lighting", description: "Light sources and falloff, for layering on top." },
];

export const catalog: CatalogEntry[] = [
	{
		type: "linear",
		component: "LinearGradient",
		category: "geometric",
		caption: "Angle or start and end points, with optional spin and flow.",
		example: { type: "linear", colors: ["#833AB4", "#FD1D1D", "#FCB045"], spin: 12 },
	},
	{
		type: "radial",
		component: "RadialGradient",
		category: "geometric",
		caption: "A circle or ellipse from any center.",
		example: { type: "radial", radius: 1.45, flow: 0.8, colors: ["#FDEFF9", "#EC38E3", "#3B095C", "#03001E"] },
	},
	{
		type: "conic",
		component: "ConicGradient",
		category: "geometric",
		caption: "A full turn of color around a center.",
		example: { type: "conic", spin: 20, colors: ["#FC00FF", "#7303C0", "#FF0080", "#FF5F6D", "#FC00FF"] },
	},
	{
		type: "sweep",
		component: "SweepGradient",
		category: "geometric",
		caption: "An arc between two angles, rotating in place.",
		backdrop: "#0F0C29",
		example: {
			type: "sweep",
			center: [0.5, 0.55],
			startAngle: -135,
			endAngle: 135,
			spin: 45,
			colors: ["#FC5C7D", "#C471ED", "#6A82FB"],
		},
	},
	{
		type: "diamond",
		component: "DiamondGradient",
		category: "geometric",
		caption: "Four-point falloff with flowing color.",
		example: { type: "diamond", flow: 0.15, colors: ["#FDB99B", "#CF8BF3", "#A770EF"] },
	},
	{
		type: "reflected",
		component: "ReflectedGradient",
		category: "geometric",
		caption: "Mirrored around a soft center line.",
		example: { type: "reflected", colors: ["#3224AE", "#FF66FF", "#FFC371"] },
	},
	{
		type: "mesh",
		component: "MeshGradient",
		category: "surface",
		caption: "A bicubic mesh with drifting control points.",
		example: {
			type: "mesh",
			rows: 3,
			columns: 3,
			drift: 0.9,
			speed: 0.6,
			colors: ["#7303C0", "#FF0080", "#FCB045", "#3224AE", "#EC38BC", "#FF5F6D", "#6A82FB", "#C471ED", "#FD1D1D"],
		},
	},
	{
		type: "freeform",
		component: "FreeformGradient",
		category: "surface",
		caption: "Color points blended by distance.",
		example: {
			type: "freeform",
			points: [
				[0.2, 0.2],
				[0.8, 0.25],
				[0.3, 0.75],
				[0.75, 0.8],
			],
			drift: 0.7,
			speed: 0.5,
			colors: ["#FF0080", "#7303C0", "#FF8C00", "#3224AE"],
		},
	},
	{
		type: "bilinear",
		component: "BilinearGradient",
		category: "surface",
		caption: "One color per corner.",
		example: { type: "bilinear", smoothness: 1, colors: ["#FC5C7D", "#FFC371", "#6A82FB", "#C471ED"] },
	},
	{
		type: "voronoi",
		component: "VoronoiGradient",
		category: "surface",
		caption: "Soft cells that slowly wander.",
		example: {
			type: "voronoi",
			cells: 9,
			smoothness: 0.45,
			drift: 0.6,
			speed: 0.5,
			colors: ["#FF0080", "#FF5F6D", "#C471ED", "#7303C0", "#EC38BC"],
		},
	},
	{
		type: "noise",
		component: "NoiseGradient",
		category: "procedural",
		caption: "Fractal noise mapped through your colors.",
		example: { type: "noise", speed: 0.3, colors: ["#23074D", "#B06AB3", "#FF5F6D"] },
	},
	{
		type: "aurora",
		component: "AuroraGradient",
		category: "procedural",
		caption: "Curtains of light over the night.",
		backdrop: "#03001E",
		example: { type: "aurora", colors: ["#7303C0", "#EC38BC", "#FF0080"] },
	},
	{
		type: "liquid",
		component: "LiquidGradient",
		category: "procedural",
		caption: "Domain-warped, glossy flow.",
		example: { type: "liquid", speed: 0.6, colors: ["#3224AE", "#EC38BC", "#FF5F6D", "#FFC371"] },
	},
	{
		type: "iridescent",
		component: "IridescentGradient",
		category: "procedural",
		caption: "Thin-film color with a moving sheen.",
		example: { type: "iridescent", speed: 0.5 },
	},
	{
		type: "holographic",
		component: "HolographicGradient",
		category: "procedural",
		caption: "Foil that shifts with device tilt.",
		example: { type: "holographic" },
	},
	{
		type: "wave",
		component: "WaveGradient",
		category: "flow",
		caption: "Layered swells rolling sideways.",
		example: { type: "wave", colors: ["#12C2E9", "#C471ED", "#F64F59"] },
	},
	{
		type: "silk",
		component: "SilkGradient",
		category: "flow",
		caption: "Folded fabric with a soft sheen.",
		example: { type: "silk", speed: 0.7, colors: ["#240B36", "#7303C0", "#FF66FF"] },
	},
	{
		type: "smoke",
		component: "SmokeGradient",
		category: "flow",
		caption: "Plumes twisting through each other.",
		example: { type: "smoke", speed: 0.5, colors: ["#03001E", "#7303C0", "#EC38BC", "#FDEFF9"] },
	},
	{
		type: "ribbon",
		component: "RibbonGradient",
		category: "flow",
		caption: "Twisting, shaded bands.",
		example: { type: "ribbon", colors: ["#C31432", "#FF0080", "#FFC371"] },
	},
	{
		type: "flux",
		component: "FluxGradient",
		category: "flow",
		caption: "A slow, turbulent blend.",
		example: { type: "flux", colors: ["#FF0080", "#7303C0", "#FF8C00"] },
	},
	{
		type: "interlace",
		component: "InterlaceGradient",
		category: "flow",
		caption: "A cosine sheet woven with fine lines.",
		example: { type: "interlace", colors: ["#4568DC", "#B06AB3", "#FF5F6D", "#4568DC"] },
	},
	{
		type: "strata",
		component: "StrataGradient",
		category: "flow",
		caption: "Layered ridges drifting past.",
		example: { type: "strata", colors: ["#23074D", "#833AB4", "#FD1D1D", "#FCB045"] },
	},
	{
		type: "sky",
		component: "SkyGradient",
		category: "lighting",
		caption: "Atmospheric falloff through a wide lens.",
		example: { type: "sky", preset: "dusk" },
	},
	{
		type: "glow",
		component: "GlowGradient",
		category: "lighting",
		caption: "A breathing light source.",
		backdrop: "#0F0C29",
		example: { type: "glow", radius: 1.1, speed: 1, colors: ["#FF66FF", "#7303C0", "#0F0C29"] },
	},
	{
		type: "spotlight",
		component: "SpotlightGradient",
		category: "lighting",
		caption: "A swaying cone of light.",
		backdrop: "#0F0C29",
		example: { type: "spotlight", speed: 1, spread: 36, colors: ["#FDEFF9", "#EC38BC", "#0F0C29"] },
	},
	{
		type: "vignette",
		component: "VignetteGradient",
		category: "lighting",
		caption: "Rounded falloff toward the edges.",
		backdrop: "#EC38BC",
		example: { type: "vignette", radius: 0.35 },
	},
];

export const catalogByType = Object.fromEntries(catalog.map((entry) => [entry.type, entry])) as Record<
	CatalogEntry["type"],
	CatalogEntry
>;

export const gradientHref = (type: CatalogEntry["type"]) => `/docs/gradients/${type}`;
