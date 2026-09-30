"use client";

import { GradientCanvas } from "@/components/gradient/gradient-canvas";

const SCENE = {
	layers: [
		{
			type: "mesh" as const,
			drift: 0.8,
			speed: 0.4,
			colors: ["#7B61FF", "#FF5FA2", "#FFB86B", "#3224AE", "#EC38BC", "#FF5F6D", "#6A82FB", "#C471ED", "#FD1D1D"],
		},
	],
};

/** "404" cut out of a drifting mesh, the way GradientText would draw it. */
export function LostMark() {
	return (
		<GradientCanvas
			scene={SCENE}
			decorate={(context, width, height) => {
				context.globalCompositeOperation = "destination-in";
				context.font = `800 ${height * 0.78}px ${getComputedStyle(document.body).fontFamily}`;
				context.textAlign = "center";
				context.textBaseline = "middle";
				context.fillText("404", width / 2, height * 0.54);
			}}
			className="h-40 w-80 max-w-full sm:h-48 sm:w-96"
		/>
	);
}
