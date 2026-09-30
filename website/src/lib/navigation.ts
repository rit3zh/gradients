import { source } from "./source";
import type { SearchSuggestion } from "@/components/search/search-events";

/** Shown in search before anything is typed. */
const SUGGESTED = [
	"/docs",
	"/docs/installation",
	"/docs/quick-start",
	"/docs/gradients",
	"/docs/gradients/mesh",
	"/docs/guides/animation",
	"/docs/components/gradient-stack",
	"/docs/guides/performance",
];

export function searchSuggestions(): SearchSuggestion[] {
	return SUGGESTED.flatMap((url) => {
		const page = source.getPageByUrl(url);
		if (!page) return [];
		const section = page.slugs.length > 1 ? page.slugs[0].replace(/^\w/, (c) => c.toUpperCase()) : "Getting started";
		return [{ title: page.data.title, url: page.url, section }];
	});
}

/** Primary links in the home header. */
export const headerLinks = [
	{ label: "Docs", href: "/docs" },
	{ label: "Gradients", href: "/docs/gradients" },
	{ label: "Components", href: "/docs/components/gradient" },
];
