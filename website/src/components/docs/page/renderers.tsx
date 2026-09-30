import type { ReactNode } from "react";
import { ArrowUpRight, MoveUpRight } from "lucide";
import { MetalIcon, OpenGLIcon } from "@/components/icons";
import { Icon } from "@/components/ui/icon";

// Each platform's native renderer, linked to its official documentation.
const RENDERERS: { name: string; platform: string; href: string; logo: ReactNode }[] = [
	{
		name: "Metal",
		platform: "iOS",
		href: "https://developer.apple.com/documentation/metal",
		logo: <MetalIcon className="size-[18px] rounded-[5px] shadow-[0_1px_2px_oklch(0_0_0/0.15)]" />,
	},
	{
		name: "OpenGL ES",
		platform: "Android",
		href: "https://developer.android.com/develop/ui/views/graphics/agsl",
		logo: <OpenGLIcon className="h-3.5 w-auto text-[#5586a4] dark:text-[#7fa9c4]" />,
	},
];

/** Which GPU APIs draw the page's gradients, one quiet chip each. */
export function Renderers() {
	return (
		<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
			<span className="text-[12.5px] text-muted-foreground/70">Rendered natively with</span>
			<div className="flex flex-wrap items-center gap-1.5">
				{RENDERERS.map((renderer) => (
					<a
						key={renderer.name}
						href={renderer.href}
						target="_blank"
						rel="noreferrer"
						title={`${renderer.name} documentation`}
						className="group/chip flex h-8 items-center gap-2 rounded-full bg-surface pr-2.5 pl-1.5 text-[12.5px] outline-offset-2 transition-[background-color,scale] duration-200 ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-solid active:scale-[0.97]"
					>
						<span className="grid h-5 min-w-5 place-items-center px-0.5">{renderer.logo}</span>
						<span className="font-medium text-foreground">{renderer.name}</span>
						<span className="text-muted-foreground">{renderer.platform}</span>
						<Icon
							icon={ArrowUpRight}
							hover={MoveUpRight}
							className="size-3 text-muted-foreground opacity-50 transition-opacity duration-200 group-hover/chip:opacity-100"
						/>
					</a>
				))}
			</div>
		</div>
	);
}
