import Link from "next/link";
import { ArrowRight, MoveRight } from "lucide";
import { Icon } from "@/components/ui/icon";
import { GradientTile } from "@/components/gradient/gradient-tile";
import { catalogByType } from "@/lib/gradients/catalog";
import { SectionHeading } from "./section-heading";
import { reveal } from "@/lib/reveal";

const FEATURED = ["mesh", "aurora", "liquid", "holographic", "silk", "strata"] as const;

export function FeaturedGradients() {
	return (
		<section className="mx-auto max-w-6xl px-4 pt-8 pb-16 sm:px-6 sm:pb-28 lg:pt-4">
			<div className="flex flex-wrap items-end justify-between gap-6">
				<SectionHeading eyebrow="27 types" title="Every gradient, one API.">
					Geometric classics, bicubic meshes, procedural noise, flowing fabric and light. Each is a component with typed
					props, and each can be a layer in a stack.
				</SectionHeading>
				<Link
					{...reveal(3)}
					href="/docs/gradients"
					className="group/all flex items-center gap-1.5 text-[14px] font-medium text-foreground"
				>
					See all 27
					<Icon icon={ArrowRight} hover={MoveRight} className="size-3.5" />
				</Link>
			</div>
			<div className="@container mt-12">
				<div className="-mx-2 grid grid-cols-2 gap-1 @min-[860px]:grid-cols-3">
					{FEATURED.map((type, index) => (
						<div key={type} {...reveal(index)}>
							<GradientTile entry={catalogByType[type]} />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
