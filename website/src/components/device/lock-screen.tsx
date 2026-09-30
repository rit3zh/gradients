import { cn } from "@/lib/utils";
import type { Device } from "./device-frame";

/**
 * A believable lock screen over the wallpaper, so a gradient reads as
 * something on a real phone. The times match each frame's status bar, and
 * are static so server and client render the same thing.
 */
export function LockScreen({ device, tone = "light" }: { device: Device; tone?: "light" | "dark" }) {
	const color = tone === "light" ? "text-white" : "text-black/85";
	if (device === "iphone") {
		return (
			<div className={cn("pointer-events-none absolute inset-x-0 top-[13%] flex flex-col items-center", color)}>
				<p className="text-[clamp(8px,4.6cqw,13px)] font-semibold opacity-85">Tuesday, September 9</p>
				<p className="-mt-[0.1em] text-[clamp(40px,24cqw,84px)] leading-none font-semibold tracking-[-0.02em] [text-shadow:0_1px_24px_oklch(0_0_0/0.12)]">
					9:41
				</p>
			</div>
		);
	}
	return (
		<div className={cn("pointer-events-none absolute inset-x-0 top-[15%] flex flex-col items-center", color)}>
			<p className="text-center text-[clamp(44px,27cqw,92px)] leading-[0.86] font-normal tracking-[-0.03em] tabular-nums [text-shadow:0_1px_24px_oklch(0_0_0/0.12)]">
				{/* Matches the time drawn into the frame's own status bar. */}
				05
				<br />
				13
			</p>
			<p className="mt-[0.6em] text-[clamp(8px,4.4cqw,12px)] font-medium opacity-85">Tue, Sep 9</p>
		</div>
	);
}
