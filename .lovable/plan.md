# HMLR Assent identity-check prototype

A working, GOV.UK-styled research prototype: one coordinator, many people, each completing their own simulated GOV.UK One Login check, with shared progress, a printable summary, research scenarios and event export. All data is fictional and kept in the browser.

## Look and feel
- Official `govuk-frontend` package styles (header, footer, service navigation, beta phase banner, back links, buttons, inputs, radios, checkboxes, details, inset/warning text, notification banners, error summaries, summary lists/cards, tables, tags, panels).
- Header: HM Land Registry + "Check identities for an Assent application". Beta banner states this is a research prototype with simulated identity checks.
- Typography falls back to Arial (GDS Transport is licensed for service.gov.uk domains only).
- No dashboards, icons, gradients or progress charts. Table on desktop, summary cards on mobile.

## Citizen journey (coordinator)
1. `/` Start page — who it's for, what you need, others may be invited, each person checks themselves, paper AS1/AP1 still needed. "Start now" + link to `/other-ways`.
2. `/transfer` About the property transfer — address lines, postcode, optional title number, deceased owner name, your role (with help text). Creates reference e.g. `ASN-7K4P-2M9Q`.
3. `/people` People involved — empty state and populated state; progress sentence ("2 of 3 required identity checks are complete"); statuses: Not started, Invitation sent, In progress, Verified, Needs attention, Unable to verify, Using another route (GOV.UK tag colours plus text). "All requested identity checks are complete" banner with assurance caveat and "View identity-check summary".
4. `/people/add` and `/people/:id/edit` — names, multiple roles (checkboxes), email + confirm, "This is me", needs check (Yes/No/Not sure with legal caveat), route (One Login / existing / not decided). Full validation, error summary, value preservation, duplicate-person warning (same name or email → offer to add role to existing person instead).
5. `/people/:id` Identity check for [name] — all fields, actions (send/resend invitation, change email/role/route, remove with confirm page, view outcome). Changing name/email after verification warns that a new check is required and resets the result rather than reassigning it.
6. `/people/:id/invite` confirm → send: token generated, status + timestamp stored, notification banner, `/people/:id/invitation-preview` showing the simulated email with a working link.
7. `/summary` printable identity-check summary with the required prototype disclaimer, Print and Return actions.

## Invited person journey (separate layout, no coordinator data)
- `/invite/:token` — "You've been invited to prove your identity": reference, inviter, their role, how info is used. Minimal case detail, no other participants.
- `/invite/:token/one-login` — clearly labelled simulated One Login handoff with researcher outcome buttons: success, incomplete, unsuccessful, chose not to continue, additional verification needed.
- `/invite/:token/outcome` — success confirmation (date, route, linked to record, no need to verify others) or failure next steps, including "Use another way to prove your identity" (sets existing route).
- Coordinator's own check uses the same flow via "Prove your identity" on their person page.

## Research mode (`/research`, linked only from a "Prototype research tools" footer link)
- Load/reset scenarios A–F as specified, or blank.
- Journey A (add people first, default) / Journey B (coordinator verifies first, gating `/people` until done).
- List of invitation links per person for demos.
- Event log table with JSON and CSV export, clear log.

## Events recorded
Start viewed, service started, transfer submitted, person added/edited, route chosen, invitation sent/opened/resent, verification started/completed/failed, alternative route selected, returned to coordinator, summary viewed — with scenario id, participant count, roles, route, invite-to-completion time, last stage, mock outcome.

## Technical details
- Add `govuk-frontend`; import its compiled CSS in root head; init JS components client-side in `useEffect`. Routes as TanStack file routes, each with its own head metadata.
- `src/domain/types.ts` — AssentIdentityCase, Participant, Invitation, IdentityCheck, ActivityEvent exactly as in the brief.
- `src/domain/store.ts` — typed reducer-style store with localStorage persistence (read after hydration), `useSyncExternalStore` hook.
- `src/identity/provider.ts` — `IdentityVerificationProvider` interface; `MockOneLoginProvider` returns authentication + separate identity result, confidence (internal only), optional document type, no tokens/documents stored.
- `src/services/invitations.ts`, `src/research/events.ts` (record + export), `src/research/scenarios.ts`.
- `src/components/govuk/*` — thin React wrappers producing official GOV.UK markup.
- Status derivation and "required checks complete" logic covered by small vitest tests (counts, Not-sure handling, assurance exception not counting as satisfied).
- No backend, no real emails, no real One Login.
