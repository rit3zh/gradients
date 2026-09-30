import Link from "next/link";
import { ArrowRight, MoveRight } from "lucide";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "./section-heading";

// From PERFORMANCE.md: Release builds, measured with the built-in profiler.
const STATS = [
	{ value: "0 ms", label: "per frame for a still gradient", note: "Drawn once, then nothing runs." },
	{ value: "0.2–0.4 ms", label: "main thread per animated view", note: "iOS, full screen, every type but mesh." },
	{ value: "60 fps", label: "with 24 animated views", note: "iOS, zero dropped frames." },
	{ value: "0", label: "JavaScript work per frame", note: "Motion lives on the native clock." },
];

export function Benchmarks() {
	return (
		<section className="border-y bg-surface/60">
			<div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-28">
				<div className="flex flex-wrap items-end justify-between gap-6">
					<SectionHeading eyebrow="Performance" title="Fast enough to forget about.">
						Still gradients cost nothing after their first frame. Animated ones share one frame clock, render at the
						resolution their detail needs, and never touch the JavaScript thread.
					</SectionHeading>
					<Link href="/docs/guides/performance" className="group/perf flex items-center gap-1.5 text-[14px] font-medium">
						Benchmarks
						<Icon icon={ArrowRight} hover={MoveRight} className="size-3.5" />
					</Link>
				</div>
				<dl className="mt-14 grid overflow-hidden rounded-2xl bg-border shadow-[inset_0_0_0_1px_var(--border)] [gap:1px] sm:grid-cols-2 lg:grid-cols-4">
					{STATS.map((stat) => (
						<div key={stat.label} className="flex flex-col gap-2 bg-background p-6 sm:p-7">
							<dt className="order-2 text-[14px] font-medium text-foreground">{stat.label}</dt>
							<dd className="order-1 text-[34px] leading-none font-semibold tracking-[-0.03em] text-foreground tabular-nums">
								{stat.value}
							</dd>
							<dd className="order-3 text-[13px] text-muted-foreground">{stat.note}</dd>
						</div>
					))}
				</dl>
			</div>
		</section>
	);
}
