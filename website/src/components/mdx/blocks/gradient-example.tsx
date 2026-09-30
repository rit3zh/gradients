import { DevicePreview, type DevicePreviewProps } from "@/components/device/device-preview";
import { catalogByType, type CatalogEntry } from "@/lib/gradients/catalog";
import { exampleSteps } from "@/lib/gradients/to-code";
import type { GradientLayer } from "@/lib/engine/types";
import { CodeMorph } from "../code/code-morph";

/**
 * A gradient type's live preview with the exact code that produces it,
 * as a morph from the minimal version to the full one. Both come from the
 * same object, so they can't drift apart.
 */
export function GradientExample({
	type,
	gradient,
	...preview
}: { type: CatalogEntry["type"]; gradient?: Partial<GradientLayer> } & Omit<DevicePreviewProps, "gradient" | "children">) {
	const entry = catalogByType[type];
	const layer = { ...entry.example, ...gradient, type: entry.type } as GradientLayer;
	return (
		<DevicePreview
			gradient={layer}
			backdrop={entry.backdrop}
			interactive={type === "holographic" || type === "iridescent"}
			{...preview}
		>
			<CodeMorph steps={exampleSteps(layer, preview.backdrop ?? entry.backdrop)} />
		</DevicePreview>
	);
}
