"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { GradientCanvas } from "./gradient-canvas";
import type { CatalogEntry } from "@/lib/gradients/catalog";
import { gradientHref } from "@/lib/gradients/catalog";

const HOVER_QUERY = "(hover: hover)";
const subscribe = (onChange: () => void) => {
	const media = matchMedia(HOVER_QUERY);
	media.addEventListener("change", onChange);
	return () => media.removeEventListener("change", onChange);
};

/**
 * Still at rest, alive under the pointer. Phones have no hover, so tiles
 * there simply play while on screen.
 */
export function GradientTile({ entry }: { entry: CatalogEntry }) {
	const [active, setActive] = useState(false);
	const canHover = useSyncExternalStore(subscribe, () => matchMedia(HOVER_QUERY).matches, () => true);

	return (
		<Link
			href={gradientHref(entry.type)}
			onPointerEnter={() => setActive(true)}
			onPointerLeave={() => setActive(false)}
			onFocus={() => setActive(true)}
			onBlur={() => setActive(false)}
			className="group/tile flex flex-col gap-2.5 rounded-2xl p-1.5 @min-[520px]:gap-3 @min-[520px]:p-2 outline-offset-2 transition-[background-color] duration-200 ease-out hover:bg-surface focus-visible:outline-2 focus-visible:outline-solid"
		>
			<div
				className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-[inset_0_0_0_1px_oklch(0_0_0/0.06)]"
				style={{ background: entry.backdrop }}
			>
				<GradientCanvas
					scene={{ layers: [entry.example] }}
					paused={canHover && !active}
					className="absolute inset-0 transition-transform duration-500 ease-out-quart group-hover/tile:scale-[1.03]"
					style={entry.backdrop ? { background: "transparent" } : undefined}
				/>
			</div>
			<div className="px-1 pb-1">
				<p className="flex items-baseline justify-between gap-2">
					<span className="text-[14px] font-medium text-foreground">{entry.component.replace("Gradient", "")}</span>
					{/* Two tiles to a row on phones leave room for the name only. */}
					<code className="hidden truncate font-mono text-[11px] text-muted-foreground @min-[520px]:block">{`<${entry.component} />`}</code>
				</p>
				<p className="mt-0.5 hidden text-[13px] leading-snug text-muted-foreground @min-[520px]:block">{entry.caption}</p>
			</div>
		</Link>
	);
}
