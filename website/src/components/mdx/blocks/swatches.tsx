"use client";

import { GradientCanvas } from "@/components/gradient/gradient-canvas";
import type { GradientLayer } from "@/lib/engine";
import { cn } from "@/lib/utils";

interface Swatch {
	label: string;
	/** A short note under the label, like the prop value. */
	note?: string;
	gradient?: GradientLayer;
	layers?: GradientLayer[];
	backdrop?: string;
	/** View-level grain, like the `grain` prop. */
	grain?: number;
}

/** Side-by-side live strips for comparing one prop's values. */
export function Swatches({ items, tall = false }: { items: Swatch[]; tall?: boolean }) {
	return (
		<div
			className={cn(
				"my-6 grid gap-3",
				items.length === 2 ? "grid-cols-2" : items.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3",
			)}
		>
			{items.map((item) => (
				<figure key={item.label} className="flex flex-col gap-2">
					<div
						className={cn("relative overflow-hidden rounded-xl", tall ? "aspect-[3/4]" : "aspect-[16/7]")}
						style={{ background: item.backdrop }}
					>
						<GradientCanvas
							scene={{ layers: item.layers ?? (item.gradient ? [item.gradient] : []), grain: item.grain }}
							className="absolute inset-0"
							style={item.backdrop ? { background: "transparent" } : undefined}
						/>
					</div>
					<figcaption className="flex items-baseline justify-between gap-2 px-0.5">
						<span className="text-[13px] font-medium text-foreground">{item.label}</span>
						{item.note && <code className="truncate font-mono text-[11px] text-muted-foreground">{item.note}</code>}
					</figcaption>
				</figure>
			))}
		</div>
	);
}
