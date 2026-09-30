"use client";

import { DeviceFrame } from "@/components/device/device-frame";
import { Screen } from "@/components/device/screens";
import type { GradientScene } from "@/lib/engine";
import { catalogByType } from "@/lib/gradients/catalog";

const MESH: GradientScene = { layers: [catalogByType.mesh.example] };

const NIGHT: GradientScene = {
	layers: [
		{ type: "aurora", colors: ["#00F5A0", "#00D9F5", "#7B61FF", "#FF4FD8"] },
		{ type: "glow", center: [0.5, 1], radius: 1.6, colors: ["rgba(123, 97, 255, 0.45)", "rgba(123, 97, 255, 0)"] },
		{ type: "vignette", intensity: 0.6 },
	],
};

const shared = { demo: "wallpaper", paused: false, interactive: false, lock: true, tone: "light", text: "" } as const;

const scene = (type: "liquid" | "holographic"): GradientScene => ({ layers: [catalogByType[type].example] });

// A fanned stack, left to right, each overlapping the one before it: the
// outer phones tilt away and sit lower, the inner two stand nearly upright.
const FAN = [
	{ device: "iphone", scene: MESH, rotate: -9, y: "9%" },
	{ device: "pixel", scene: NIGHT, rotate: -3, y: "2%", backdrop: "#03001E" },
	{ device: "iphone", scene: scene("liquid"), rotate: 3, y: "0%" },
	{ device: "pixel", scene: scene("holographic"), rotate: 9, y: "8%" },
] as const;

/** Four phones, alternating platforms, each running a different live scene. */
export function HeroDevices() {
	return (
		<div className="relative mx-auto flex w-full max-w-5xl items-start justify-center pb-[6%] [--device-h:clamp(240px,52vw,520px)]">
			<div
				aria-hidden
				className="stage-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_72%)]"
			/>
			{FAN.map((phone, index) => (
				<div
					key={index}
					className="relative shrink-0 not-first:-ml-[calc(var(--device-h)*0.14)]"
					style={{ transform: `translateY(${phone.y}) rotate(${phone.rotate}deg)`, zIndex: index }}
				>
					<DeviceFrame device={phone.device}>
					<Screen
						{...shared}
						device={phone.device}
						scene={phone.scene}
						{...("backdrop" in phone ? { backdrop: phone.backdrop } : {})}
					/>
					</DeviceFrame>
				</div>
			))}
		</div>
	);
}
