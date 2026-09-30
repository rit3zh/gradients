# Gradients website

The documentation site: Next.js 16, Fumadocs (headless), Tailwind CSS 4, shadcn/ui on Base UI, deployed to Cloudflare with OpenNext.

Every phone preview runs the library's own GLSL shaders in the browser through WebGL2, so what the docs show is what ships.

## Develop

```bash
npm install      # also generates the Fumadocs collections (.source)
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with MDX hot reload |
| `npm run build` | Production build (every page is static) |
| `npm run typecheck` | Regenerates collections, then `tsc` |
| `npm run lint` | ESLint |
| `npm run shaders` | Re-syncs shaders from `android/src/main/assets` |
| `npm run preview` / `deploy` | OpenNext build, then preview or deploy on Cloudflare |

## Writing docs

Pages live in `content/docs` as MDX. Sidebar order and section labels come from each folder's `meta.json` (`---Label---` starts a section, `...folder` inlines a folder).

Components available in MDX (see `src/components/mdx/index.tsx`):

| Component | Use |
| --- | --- |
| `<GradientExample type="mesh" />` | Live preview plus generated code, from the catalog |
| `<Preview gradient={{...}}>```code```</Preview>` | Live iPhone and Pixel preview with your own code block |
| `<Swatches items={[...]} />` | Side-by-side live strips for comparing a prop |
| `<PropsTable of="linear" />` | Props from `src/lib/gradients/props.ts` |
| `<GradientGrid />` | Every gradient as live tiles |
| `<Callout>`, `<Steps>`, `<Cards>` | Prose blocks |

Fenced code blocks support `title="..."`, `// [!code highlight]` and friends, and `tab="..."` on consecutive blocks for tabs.

## Layout

```
content/docs/            MDX pages and meta.json navigation
scripts/sync-shaders.mjs Copies GLSL from the Android module
public/devices/          iPhone and Pixel frames (sneas/telephone, MIT)
src/
  app/                   Routes: home, docs, search index, sitemap, 404
  components/
    ui/                  shadcn primitives (Base UI)
    layout/              Brand, headers, footer, theme toggle, mobile nav
    docs/                Sidebar, table of contents, breadcrumb, pager
    search/              ⌘K dialog on the static Fumadocs index
    mdx/                 Everything MDX renders: prose, code, blocks
    device/              Phone frames, screens and the preview stage
    gradient/            React bridge to the engine, tiles
    home/                Landing page sections
    shared/              Copy button, install command
  lib/
    engine/              WebGL2 port of the Android renderer
    gradients/           Catalog, prop reference, code generation
    source.ts            Fumadocs loader
  styles/                Theme tokens, base styles, code highlighting
```

### The preview engine

`src/lib/engine` mirrors the native renderer file for file: layer normalization (`layer/`), color ramps in sRGB, linear and OKLab (`color/`), the animator with timing curves and springs (`animation/`), one encoder per gradient type (`programs/`), and a renderer that assembles the same composite shader variants (`render/`). One shared WebGL2 context renders every preview on the page and copies each into its own canvas; previews off screen cost nothing, and a still preview renders once.

When the shaders change, run `npm run shaders`.
