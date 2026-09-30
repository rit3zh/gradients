import { GradientTile } from "@/components/gradient/gradient-tile";
import { catalog, categories, type GradientCategory } from "@/lib/gradients/catalog";

/** Every gradient of a category (or all of them), as live tiles. */
export function GradientGrid({ category }: { category?: GradientCategory }) {
	const groups = category ? categories.filter((group) => group.id === category) : categories;
	return (
		<div className="@container my-8 flex flex-col gap-10">
			{groups.map((group) => (
				<section key={group.id} aria-labelledby={`grid-${group.id}`}>
					{!category && (
						<div className="mb-3 flex items-baseline justify-between gap-4 px-2">
							<h3 id={`grid-${group.id}`} className="text-[15px] font-semibold tracking-tight text-foreground">
								{group.label}
							</h3>
							<p className="hidden text-[13px] text-muted-foreground sm:block">{group.description}</p>
						</div>
					)}
					<div className="-mx-2 grid grid-cols-2 gap-1 @min-[860px]:grid-cols-3">
						{catalog
							.filter((entry) => entry.category === group.id)
							.map((entry) => (
								<GradientTile key={entry.type} entry={entry} />
							))}
					</div>
				</section>
			))}
		</div>
	);
}
