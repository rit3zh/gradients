import { catalog, catalogByType, categories, gradientHref, type CatalogEntry } from "./gradients/catalog";
import { PROP_TABLES, type PropRow, type PropTableName } from "./gradients/props";
import { exampleCode } from "./gradients/to-code";
import { site } from "./site";
import rawDocs from "./raw-docs.generated.json";
import { source, type DocsPage } from "./source";

/** The Markdown twin of a docs page, at `/docs/<page>.mdx`. */
export const markdownUrl = (url: string) => `${url === "/docs" ? "/docs/index" : url}.mdx`;

const absolute = (path: string) => new URL(path, site.url).toString();

const fence = (code: string, lang = "tsx") => `\`\`\`${lang}\n${code}\n\`\`\``;

function table(rows: PropRow[]): string {
	const cell = (text: string) => text.replaceAll("|", "\\|");
	return [
		"| Prop | Type | Default | Description |",
		"| --- | --- | --- | --- |",
		...rows.map(
			(row) =>
				`| \`${row.name}\`${row.required ? " (required)" : ""} | \`${cell(row.type)}\` | ${row.default ? `\`${cell(row.default)}\`` : ""} | ${cell(row.description)} |`,
		),
	].join("\n");
}

const SHARED = {
	color: "/docs/guides/colors#props",
	composition: "/docs/guides/composition#props",
	motion: "/docs/guides/animation#props",
	playback: "/docs/components/gradient#props",
};

function sharedProps(without: string[]): string {
	const links = Object.entries(SHARED)
		.filter(([name]) => !without.includes(name))
		.map(([name, href]) => `[${name}](${absolute(href)})`);
	return `Also accepts the shared ${links.slice(0, -1).join(", ")} and ${links.at(-1)} props.`;
}

function gradientList(): string {
	return categories
		.map((group) => {
			const entries = catalog.filter((entry) => entry.category === group.id);
			const items = entries.map((entry) => `- [\`${entry.component}\`](${absolute(gradientHref(entry.type))}): ${entry.caption}`);
			return `### ${group.label}\n\n${items.join("\n")}`;
		})
		.join("\n\n");
}

/**
 * Turns the site's MDX into plain Markdown: live previews become the code
 * that produces them, data-driven tables become tables, and purely visual
 * blocks are dropped.
 */
function toMarkdown(mdx: string): string {
	return (
		mdx
			// Frontmatter is replaced by the title block.
			.replace(/^---\n[\s\S]*?\n---\n/, "")
			.replace(/<GradientExample type="(\w+)"[^>]*\/>/g, (_, type: CatalogEntry["type"]) => {
				const entry = catalogByType[type];
				return fence(exampleCode(entry.example, entry.backdrop));
			})
			.replace(/<PropsTable of="(\w+)" \/>/g, (_, name: PropTableName) => table(PROP_TABLES[name]))
			.replace(/<SharedProps(?: without=\{(\[[^\]]*\])\})? \/>/g, (_, list?: string) =>
				sharedProps(list ? (JSON.parse(list) as string[]) : []),
			)
			.replace(/<GradientGrid \/>/g, gradientList)
			// Comparison strips and self-closing previews only make sense on screen.
			// Their attributes never contain ">", so the first one ends the tag.
			.replace(/<Swatches\b[^>]*\/>\n?/g, "")
			.replace(/<Preview\b[^>]*\/>\n?/g, "")
			// A preview with children keeps them: they're its code.
			.replace(/<Preview\b[^>]*>\n?/g, "")
			.replace(/<\/Preview>\n?/g, "")
			.replace(/<Callout(?: type="\w+")?(?: title="([^"]*)")?>\n?([\s\S]*?)\n?<\/Callout>/g, (_, title = "Note", body: string) =>
				`> **${title}**\n>\n${body
					.trim()
					.split("\n")
					.map((line) => `> ${line.trim()}`)
					.join("\n")}`,
			)
			.replace(/<Card href="([^"]+)" title="([^"]+)">\s*([\s\S]*?)\s*<\/Card>/g, (_, href: string, title: string, body: string) =>
				`- [${title}](${absolute(href)}): ${body.trim()}`,
			)
			.replace(/<\/?(Cards|Steps|Step)>\n?/g, "")
			// Site-relative links work anywhere once they're absolute.
			.replace(/\]\((\/[^)]*)\)/g, (_, path: string) => `](${absolute(path)})`)
			.replace(/\n{3,}/g, "\n\n")
			.trim()
	);
}

/** A page as Markdown: title, description, then the body. */
export async function pageMarkdown(page: DocsPage): Promise<string> {
	// Read from the build-time bundle: getText("raw") hits the filesystem, which Workers don't have.
	const raw = (rawDocs as Record<string, string>)[page.path];
	if (raw === undefined) throw new Error(`No bundled source for ${page.path}; run \`npm run docs\`.`);
	const body = toMarkdown(raw);
	const description = page.data.description ? `\n\n> ${page.data.description}` : "";
	return `# ${page.data.title}${description}\n\nSource: ${absolute(page.url)}\n\n${body}\n`;
}

/** llms.txt: every page with a one-line summary. */
export function llmsIndex(): string {
	const lines = source.getPages().map((page) => {
		const summary = page.data.description ? `: ${page.data.description}` : "";
		return `- [${page.data.title}](${absolute(markdownUrl(page.url))})${summary}`;
	});
	return `# ${site.name}\n\n> ${site.description}\n\nEvery page is also available as Markdown by adding \`.mdx\` to its URL.\n\n## Docs\n\n${lines.join("\n")}\n`;
}
