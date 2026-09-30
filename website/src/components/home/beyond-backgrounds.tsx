import Link from "next/link";
import { DeviceFrame, type Device } from "@/components/device/device-frame";
import { Screen, type Demo } from "@/components/device/screens";
import type { GradientScene } from "@/lib/engine";
import { SectionHeading } from "./section-heading";

const SHOWCASE: {
	demo: Demo;
	device: Device;
	title: string;
	href: string;
	body: string;
	scene: GradientScene;
}[] = [
	{
		demo: "text",
		device: "iphone",
		title: "GradientText",
		href: "/docs/components/gradient-text",
		body: "Any gradient, masked to native text.",
		scene: { layers: [{ type: "silk", speed: 0.8, colors: ["#FC00FF", "#FF5F6D", "#FFC371"] }] },
	},
	{
		demo: "border",
		device: "pixel",
		title: "GradientBorder",
		href: "/docs/components/gradient-border",
		body: "Anti-aliased rings that spin for free.",
		scene: {
			layers: [{ type: "conic", spin: 30, colors: ["#FC00FF", "#FF0080", "#FFC371", "#833AB4", "#FC00FF"] }],
			border: { width: 4, radius: 22 },
		},
	},
	{
		demo: "mask",
		device: "iphone",
		title: "GradientMask",
		href: "/docs/components/gradient-mask",
		body: "One continuous gradient behind any shapes.",
		scene: {
			layers: [
				{
					type: "mesh",
					drift: 0.8,
					speed: 0.5,
					colors: ["#FC5C7D", "#6A82FB", "#C471ED", "#FFC371", "#FF0080", "#7303C0", "#12C2E9", "#F64F59", "#3224AE"],
				},
			],
		},
	},
];

export function BeyondBackgrounds() {
	return (
		<section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-28">
			<SectionHeading eyebrow="Beyond backgrounds" title="Text, borders and masks.">
				The same renderer paints type, outlines and any shape you can draw, and keeps animating inside them.
			</SectionHeading>
			{/* A swipeable row on phones, three columns from there up. */}
			<div className="no-scrollbar -mx-4 mt-12 flex snap-x snap-mandatory gap-8 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mt-14 sm:grid sm:snap-none sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0">
				{SHOWCASE.map((item) => (
					<Link key={item.title} href={item.href} className="group/show flex shrink-0 snap-center flex-col items-center gap-6">
						<DeviceFrame
							device={item.device}
							className="transition-transform duration-500 ease-out-quart [--device-h:400px] group-hover/show:-translate-y-1.5 sm:[--device-h:330px] lg:[--device-h:440px]"
						>
							<Screen
								device={item.device}
								scene={item.scene}
								demo={item.demo}
								paused={false}
								interactive={false}
								lock={false}
								tone="light"
								text="Aa"
							/>
						</DeviceFrame>
						<div className="text-center">
							<p className="font-mono text-[13px] font-medium text-foreground">{`<${item.title} />`}</p>
							<p className="mt-1 text-[14px] text-muted-foreground">{item.body}</p>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
