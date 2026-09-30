"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import NumericText from "@numeric-text/react";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const TEXT = { duration: 460 };

/**
 * Text that changes like SwiftUI's `.numericText`: only the characters that
 * differ roll through, and the box around them glides to its new width
 * instead of snapping, so whatever sits next to it moves smoothly too.
 */
export function AnimatedLabel({
	value,
	lead,
	className,
}: {
	value: string;
	/** Space before the text, kept only while there is text, so an empty label takes no room. */
	lead?: string;
	className?: string;
}) {
	const inner = useRef<HTMLSpanElement>(null);
	const [width, setWidth] = useState<number>();

	useEffect(() => {
		const element = inner.current;
		if (!element) return;
		const observer = new ResizeObserver(([entry]) => setWidth(entry.borderBoxSize[0].inlineSize));
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	return (
		<motion.span
			className={cn("relative inline-flex", className)}
			initial={false}
			animate={width === undefined ? undefined : { width }}
			transition={spring.smooth}
		>
			<span ref={inner} className={cn("inline-flex w-max shrink-0 whitespace-nowrap", value && lead)}>
				<NumericText value={value} transition={TEXT} aria-live="polite" />
			</span>
		</motion.span>
	);
}
