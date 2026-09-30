"use client";

import Link from "next/link";
import { nextPalette } from "@/lib/brand-palette";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** The mark: the brand palette (dusk to start), lit from the top left. */
export function BrandMark({ className }: { className?: string }) {
	return (
		<span
			aria-hidden
			className={cn(
				"relative inline-block size-5 shrink-0 overflow-hidden rounded-[6px] bg-[linear-gradient(135deg,var(--brand-a),var(--brand-b)_55%,var(--brand-c))] shadow-[inset_0_0_0_1px_oklch(0_0_0/0.08)]",
				"after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_30%_25%,oklch(1_0_0/0.45),transparent_70%)]",
				className,
			)}
		/>
	);
}

/** Hovering the logo moves the whole brand, headline included, to the next palette. */
export function Brand({ className }: { className?: string }) {
	return (
		<Link
			href="/"
			onPointerEnter={(event) => event.pointerType === "mouse" && nextPalette()}
			className={cn(
				"flex items-center gap-2.5 rounded-md outline-offset-4 focus-visible:outline-2 focus-visible:outline-solid",
				className,
			)}
		>
			<BrandMark />
			<span className="text-[15px] font-semibold tracking-tight text-foreground">{site.name}</span>
		</Link>
	);
}
