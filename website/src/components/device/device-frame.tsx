import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Device = "iphone" | "pixel";

/**
 * Frames from sneas/telephone (MIT), exported as static SVG. The screen area
 * is transparent, so the frame sits on top of live content. Insets and corner
 * radii are the component's own, as percentages of the screen box.
 *
 * Size it with `--device-h` (e.g. `[--device-h:440px]`); the width follows.
 * Both are explicit because Safari resolves `aspect-ratio` inconsistently
 * inside shrink-to-fit flex items, which let the frame and screen drift apart.
 */
const DEVICES = {
	iphone: {
		label: "iPhone 16 Pro Max",
		width: 415,
		height: 843,
		screen: { left: "3.4%", right: "3.4%", top: "1.32%", bottom: "1.32%" },
		radius: "13.1% / 6.17%",
	},
	pixel: {
		label: "Pixel 9 Pro",
		width: 353,
		height: 745,
		screen: { left: "4.1%", right: "4.8%", top: "2.05%", bottom: "1.8%" },
		radius: "13.9% / 6.24%",
	},
} as const;

export function DeviceFrame({
	device,
	ink = "light",
	className,
	children,
}: {
	device: Device;
	/** Status bar color: light for dark screens, dark for light ones. */
	ink?: "light" | "dark";
	className?: string;
	children: ReactNode;
}) {
	const spec = DEVICES[device];
	return (
		<div
			className={cn("relative isolate shrink-0 select-none", className)}
			style={{
				height: "var(--device-h, 440px)",
				width: `calc(var(--device-h, 440px) * ${spec.width} / ${spec.height})`,
			}}
			role="img"
			aria-label={`${spec.label} showing the preview`}
		>
			<div className="@container absolute overflow-hidden bg-black" style={{ ...spec.screen, borderRadius: spec.radius }}>
				{children}
			</div>
			<Image
				src={`/devices/${device}-ink-${ink}.svg`}
				alt=""
				width={spec.width}
				height={spec.height}
				unoptimized
				priority
				draggable={false}
				className="pointer-events-none relative z-10 size-full drop-shadow-[0_24px_40px_oklch(0_0_0/0.18)] dark:drop-shadow-[0_24px_48px_oklch(0_0_0/0.6)]"
			/>
		</div>
	);
}
