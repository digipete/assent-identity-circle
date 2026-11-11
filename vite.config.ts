// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// STATIC_EXPORT=1 builds a fully static single-page site (for GitHub Pages).
// BASE_PATH sets the sub-folder the site is served from, e.g. "/my-repo/".
const isStatic = process.env["STATIC_EXPORT"] === "1";
const base = process.env["BASE_PATH"] || "/";

export default defineConfig({
  tanstackStart: isStatic
    ? {
        server: { entry: "server" },
        // Every page renders in the browser, so one prerendered "/" shell serves all routes
        // (copied to 404.html for deep links by the GitHub Pages workflow).
        pages: [{ path: "/" }],
        prerender: { enabled: true, autoStaticPathsDiscovery: false },
      }
    : {
        // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
        // nitro/vite builds from this
        server: { entry: "server" },
      },
  // Outside Lovable, nitro defaults to .output/public; pin it so the Pages workflow finds dist/client.
  ...(isStatic
    ? { nitro: { output: { dir: "dist", serverDir: "dist/server", publicDir: "dist/client" } } }
    : {}),
  vite: isStatic ? { base } : {},
});
