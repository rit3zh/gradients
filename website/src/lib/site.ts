// The facts every page, metadata block and link repeats, kept in one place.
export const site = {
	name: "Gradients",
	tagline: "GPU gradients for Expo",
	description:
		"27 native gradient types for React Native and Expo, rendered on the GPU with Metal on iOS and OpenGL ES on Android. Animated, composable, and nearly free when still.",
	url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
	repo: "https://github.com/rit3zh/expo-gradients",
	npm: "https://www.npmjs.com/package/@rit3zh/gradients",
	install: "npx expo install @rit3zh/gradients",
	author: { name: "rit3zh", url: "https://github.com/rit3zh" },
} as const;

/** Where a docs page's source lives, for "Edit on GitHub". */
export const editUrl = (path: string) => `${site.repo}/blob/main/website/content/docs/${path}`;
