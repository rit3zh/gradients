import type { GradientLayer } from "@/lib/engine/types";
import { catalogByType } from "./catalog";

function literal(value: unknown, indent: string): string {
	if (typeof value === "string") return `'${value}'`;
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	if (Array.isArray(value)) {
		const items = value.map((item) => literal(item, `${indent}  `));
		const inline = `[${items.join(", ")}]`;
		// Short arrays stay on one line; long ones get a line per item.
		if (inline.length <= 56) return inline;
		return `[\n${items.map((item) => `${indent}  ${item},`).join("\n")}\n${indent}]`;
	}
	if (value && typeof value === "object") {
		const entries = Object.entries(value).map(([key, item]) => `${key}: ${literal(item, `${indent}  `)}`);
		return `{ ${entries.join(", ")} }`;
	}
	return "undefined";
}

function prop(name: string, value: unknown, indent: string) {
	if (value === true) return `${indent}${name}`;
	if (typeof value === "string") return `${indent}${name}="${value}"`;
	return `${indent}${name}={${literal(value, indent)}}`;
}

export const componentName = (type: GradientLayer["type"]) =>
	type === "angular" ? "AngularGradient" : catalogByType[type].component;

/** A gradient layer as the JSX you'd write in an app. */
export function layerToJsx(layer: GradientLayer, indent: string, style = "StyleSheet.absoluteFill"): string {
	const { type, ...options } = layer;
	const lines = [
		...(style ? [`${indent}  style={${style}}`] : []),
		...Object.entries(options).map(([name, value]) => prop(name, value, `${indent}  `)),
	];
	return `${indent}<${componentName(type)}\n${lines.join("\n")}\n${indent}/>`;
}

/**
 * A complete, copyable screen for one gradient. A backdrop becomes the
 * parent view's background, exactly as the preview shows it.
 */
export function exampleCode(layer: GradientLayer, backdrop?: string): string {
	const imports = backdrop ? "StyleSheet, View" : "StyleSheet";
	const body = backdrop
		? `    <View style={{ flex: 1, backgroundColor: '${backdrop}' }}>\n${layerToJsx(layer, "      ")}\n    </View>`
		: layerToJsx(layer, "    ");
	return `import { ${componentName(layer.type)} } from '@rit3zh/gradients';
import { ${imports} } from 'react-native';

export function Background() {
  return (
${body}
  );
}`;
}

/**
 * The example as steps for a code morph: the smallest version that renders
 * (just the colors), then the full example, so the morph shows exactly which
 * props the example adds. A one-prop example is a single step.
 */
export function exampleSteps(layer: GradientLayer, backdrop?: string) {
	const { type, ...options } = layer;
	const base = "colors" in options ? "colors" : Object.keys(options)[0];
	const extra = Object.keys(options).filter((name) => name !== base);
	const full = { label: "Example", title: "The gradient in the preview above", code: exampleCode(layer, backdrop) };
	if (!base || extra.length === 0) return [full];

	const minimal = { type, [base]: options[base as keyof typeof options] } as GradientLayer;
	const added = extra.length > 1 ? `${extra.slice(0, -1).join(", ")} and ${extra.at(-1)}` : extra[0];
	return [
		{ label: "Basic", title: `Just ${base}, all it needs to render`, code: exampleCode(minimal, backdrop) },
		{ ...full, title: `Adds ${added}, as in the preview` },
	];
}
