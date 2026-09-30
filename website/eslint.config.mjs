import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
	...nextVitals,
	...nextTs,
	globalIgnores([
		".next/**",
		".open-next/**",
		".source/**",
		"out/**",
		"build/**",
		"inspo/**",
		"next-env.d.ts",
		"cloudflare-env.d.ts",
		"src/lib/engine/shaders/generated.ts",
	]),
]);
