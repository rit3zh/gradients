import type { SkyPreset } from "../types";

// Default palettes, copied from src/helpers/palette.helper.ts in the library.
export const PALETTES = {
	dusk: ["#7B61FF", "#FF5FA2", "#FFB86B"],
	ocean: ["#22D3EE", "#6366F1"],
	aurora: ["#00F5A0", "#00D9F5", "#7B61FF", "#FF4FD8"],
	liquid: ["#1E1B4B", "#7C3AED", "#EC4899", "#F59E0B", "#FDE68A"],
	spectrum: ["#FFB3C7", "#FFE5A3", "#B5F5C8", "#A7D8FF", "#D7B8FF", "#FFB3C7"],
	noise: ["#0F172A", "#6366F1", "#F472B6", "#FDE68A"],
	corners: ["#FF6B6B", "#FFD166", "#4D96FF", "#6BCB77"],
	mesh: [
		"#FF6B6B",
		"#FFD166",
		"#06D6A0",
		"#8338EC",
		"#EF476F",
		"#118AB2",
		"#3A86FF",
		"#FB5607",
		"#FFBE0B",
		"#7B61FF",
		"#00D9F5",
		"#FF4FD8",
	],
	glow: ["rgba(139, 92, 246, 0.95)", "rgba(236, 72, 153, 0.5)", "rgba(236, 72, 153, 0)"],
	light: ["rgba(255, 255, 255, 0.95)", "rgba(255, 255, 255, 0)"],
	interlace: ["#FFE08A", "#DD850C", "#800675", "#007AD7", "#7FDAFF", "#DDFFE3", "#FFE08A"],
	strata: ["#F2A65A", "#B3472E", "#3A1C1F", "#0B0B10"],
	reflected: ["#FDF2F8", "#F9A8D4", "#A855F7", "#312E81"],
} as const satisfies Record<string, readonly string[]>;

export const closed = (palette: readonly string[]) => [...palette, palette[0]];

// From src/helpers/sky.helper.ts.
export const SKY_PRESETS: Record<SkyPreset, { extinction: [number, number, number]; tint: string }> = {
	clear: { extinction: [0.1, 0.3, 0.6], tint: "#FFFFFF" },
	overcast: { extinction: [0.18, 0.2, 0.28], tint: "#FFF2CC" },
	dusk: { extinction: [0.1, 0.2, 0.8], tint: "#FFBF80" },
	tropical: { extinction: [0.03, 0.2, 0.9], tint: "#FFFFFF" },
	ember: { extinction: [0.4, 0.06, 0.01], tint: "#FFFFFF" },
	verdant: { extinction: [0.1, 0.2, 0.01], tint: "#FFFFFF" },
};
