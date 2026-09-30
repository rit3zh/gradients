import { Fragment } from "react";
import Link from "next/link";
import { PropInfo } from "./prop-info";
import { PROP_TABLES, type PropRow, type PropTableName } from "@/lib/gradients/props";

/** Backticks become code; the rest stays text. */
function Inline({ text }: { text: string }) {
	return (
		<>
			{text.split(/(`[^`]+`)/g).map((part, index) =>
				part.startsWith("`") ? (
					<code key={index} className="rounded-[5px] bg-accent px-1 py-px font-mono text-[0.9em] text-foreground">
						{part.slice(1, -1)}
					</code>
				) : (
					<Fragment key={index}>{part}</Fragment>
				),
			)}
		</>
	);
}

// One pill style for every name, type and default, as in spell-ui's table.
const PILL = "rounded-md bg-accent px-2 py-0.5 font-mono text-[12.5px] text-foreground/85";

/**
 * Props as a three-column table (prop, type, default), each value in a code
 * pill; a prop's description opens from the info button beside its name. On
 * a narrow screen the table scrolls sideways rather than squeezing types.
 */
export function PropsTable({ of, rows }: { of?: PropTableName; rows?: PropRow[] }) {
	const list: PropRow[] = rows ?? (of ? PROP_TABLES[of] : []);
	if (list.length === 0) {
		return (
			<div className="my-6 flex h-11 items-center justify-center rounded-xl border border-border text-sm text-muted-foreground">
				No additional props
			</div>
		);
	}
	return (
		<div className="no-scrollbar my-6 overflow-x-auto rounded-xl border border-border">
			<table className="w-full min-w-[34rem] border-collapse text-left">
				<thead className="border-b border-border bg-surface/60">
					<tr>
						{["Prop", "Type", "Default"].map((label) => (
							<th key={label} scope="col" className="px-4 py-2.5 text-[13px] font-medium text-muted-foreground">
								{label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{list.map((row) => (
						<tr key={row.name} className="border-b border-border align-middle last:border-b-0">
							<td className="px-4 py-3 whitespace-nowrap">
								<span className="flex items-center gap-1">
									<code className={PILL}>
										{row.name}
										{row.required && (
											<span className="text-destructive" aria-label="required">
												*
											</span>
										)}
									</code>
									<PropInfo name={row.name}>
										<Inline text={row.description} />
									</PropInfo>
								</span>
							</td>
							<td className="px-4 py-3">
								<code className={`${PILL} inline-block max-w-[22rem] break-words`}>{row.type}</code>
							</td>
							<td className="px-4 py-3 whitespace-nowrap">
								{row.default ? <code className={PILL}>{row.default}</code> : <span className="text-muted-foreground">–</span>}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

const SHARED = [
	{ id: "color", label: "color", href: "/docs/guides/colors#props" },
	{ id: "composition", label: "composition", href: "/docs/guides/composition#props" },
	{ id: "motion", label: "motion", href: "/docs/guides/animation#props" },
	{ id: "playback", label: "playback", href: "/docs/components/gradient#props" },
] as const;

/** The line under every gradient's own props, pointing to the shared ones. */
export function SharedProps({ without = [] }: { without?: (typeof SHARED)[number]["id"][] }) {
	const groups = SHARED.filter((group) => !without.includes(group.id));
	return (
		<p className="my-4 text-[14px] leading-relaxed text-muted-foreground">
			Also accepts the shared{" "}
			{groups.map((group, index) => (
				<Fragment key={group.id}>
					{index > 0 && (index === groups.length - 1 ? " and " : ", ")}
					<Link
						href={group.href}
						className="font-medium text-foreground underline decoration-foreground/25 underline-offset-[3px] hover:decoration-foreground"
					>
						{group.label}
					</Link>
				</Fragment>
			))}{" "}
			props.
		</p>
	);
}
