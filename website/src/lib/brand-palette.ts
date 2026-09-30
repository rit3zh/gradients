// The brand's three colours live in CSS custom properties (--brand-a/b/c,
// defaults in styles/theme.css). Hovering the logo tweens them to the next
// palette here, frame by frame, so every browser shows the same smooth glide
// without relying on CSS transitions of custom properties. Nothing is saved,
// so every visit starts on dusk.

type Rgb = [number, number, number];
type Lab = [number, number, number];

export const PALETTES: [string, string, string][] = [
	["#7B61FF", "#FF5FA2", "#FFB86B"], // dusk, the library's default
	["#00F5A0", "#00D9F5", "#7B61FF"], // aurora
	["#FF5F6D", "#FF8A5C", "#FFC371"], // ember
	["#3224AE", "#6A82FB", "#00D9F5"], // lagoon
	["#833AB4", "#FD1D1D", "#FCB045"], // sunset
	["#EC38BC", "#7303C0", "#FF5F6D"], // bloom
];

const PROPS = ["--brand-a", "--brand-b", "--brand-c"] as const;
const DURATION = 1100;
// Each colour starts a beat after the one before, so the change flows across.
const STAGGER = 70;

// ─── Colour maths: mixing in OKLab keeps midpoints bright instead of muddy ───

const hexToRgb = (hex: string): Rgb => {
	const n = parseInt(hex.slice(1), 16);
	return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function rgbToLab([r, g, b]: Rgb): Lab {
	const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
	const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
	const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
	const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
	return [
		0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
		1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
		0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
	];
}

function labToHex([L, a, b]: Lab): string {
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
	const rgb = [
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
	];
	return `#${rgb
		.map((c) => Math.round(Math.min(1, Math.max(0, toGamma(c))) * 255).toString(16).padStart(2, "0"))
		.join("")}`;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// ─── State: where the colours are now, and where they're headed ───

let index = 0;
let current: Lab[] = PALETTES[0].map((hex) => rgbToLab(hexToRgb(hex)));
let frame = 0;

/** Glides the whole brand (logo, headline wave) to the next palette. */
export function nextPalette() {
	index = (index + 1) % PALETTES.length;
	const target = PALETTES[index].map((hex) => rgbToLab(hexToRgb(hex)));
	const root = document.documentElement.style;

	if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
		current = target;
		PROPS.forEach((prop, i) => root.setProperty(prop, labToHex(target[i])));
		return;
	}

	// Start from wherever the colours are right now, so a quick second hover
	// turns smoothly instead of jumping back to a palette's end state.
	const from = current.map((lab) => [...lab] as Lab);
	const start = performance.now();
	cancelAnimationFrame(frame);

	const tick = (now: number) => {
		let done = true;
		current = from.map((origin, i) => {
			const t = Math.min(1, Math.max(0, (now - start - i * STAGGER) / DURATION));
			if (t < 1) done = false;
			const k = ease(t);
			return origin.map((value, axis) => value + (target[i][axis] - value) * k) as Lab;
		});
		PROPS.forEach((prop, i) => root.setProperty(prop, labToHex(current[i])));
		frame = done ? 0 : requestAnimationFrame(tick);
	};
	frame = requestAnimationFrame(tick);
}
