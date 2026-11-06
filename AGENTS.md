<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- GOV.UK Frontend CSS is served as a static copy from `public/govuk/` (Vite's CSS pipeline rejects its IE hacks); refresh it from `node_modules/govuk-frontend/dist` when upgrading. Tailwind is not used.
- All prototype state lives in the browser (`src/domain/store.ts`, localStorage) and pages render inside `<ClientOnly>` to avoid hydration mismatches; no backend.
- Identity checks go through the `IdentityVerificationProvider` interface (`src/identity/provider.ts`) so the mock can be swapped for a real One Login integration without UI changes.
- Status and progress rules live in `src/domain/logic.ts` with tests in `logic.test.ts`.
- GitHub Pages deploy: `STATIC_EXPORT=1 BASE_PATH=/<repo>/ vite build` prerenders one "/" shell into `dist/client` (copied to 404.html in `.github/workflows/deploy-pages.yml`); all asset/link paths must use `import.meta.env.BASE_URL` so the site works from a sub-folder.
