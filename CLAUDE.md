# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

The static marketing site for FEConf 2026, a Korean frontend conference. It's a single long
scrolling page (`src/app/page.tsx`) built from section components, statically exported and
deployed to GitHub Pages.

## Commands

- `pnpm dev` — start the dev server
- `pnpm build` — static export (writes to `out/`, per `output: "export"` in `next.config.ts`)
- `pnpm start` — serve a production build
- `pnpm lint` — ESLint (flat config, `eslint.config.mjs`)
- `node scripts/generate-schedule-svg-v2.mjs` — regenerate
  `public/images/generated/full-schedule-overview.svg` from `SCHEDULE_GROUPS` in `src/data/site.ts`
  (see below); the script parses that array out of the `.ts` source with a regex, so keep the
  array's literal shape intact when editing schedule data

There is no test suite/framework configured in this repo.

## Architecture

**Content vs. presentation.** All copy, schedule data, sponsor lists, asset paths, etc. live in
`src/data/site.ts`. Section components under `src/components/sections/` are meant to stay purely
presentational, reading from that file rather than hardcoding text. When editing conference
content (schedule, sponsors, speakers, copy), edit `site.ts`, not the components.

**Asset paths.** Because the site deploys under a GitHub Pages sub-path, every static asset URL
must go through `assetPath()` (`src/lib/assetPath.ts`), which prefixes `NEXT_PUBLIC_BASE_PATH`.
Never hardcode a `/images/...`-style path directly in a component or in `site.ts` — wrap it.
`NEXT_PUBLIC_BASE_PATH` and `NEXT_PUBLIC_SITE_ORIGIN` are injected by
`.github/workflows/deploy.yml` at build time via `actions/configure-pages`; locally they're unset
(empty base path).

**Scroll/animation system.** The page relies on custom scroll-driven animation rather than a
library, coordinated through `src/hooks/useAnimation.ts`:
- All scroll/resize listeners across the page are coalesced into a single `requestAnimationFrame`
  via a shared subscriber set (`useScrollEffect`) — avoid adding new raw `scroll`/`resize`
  listeners in components; subscribe through this hook instead so layout is only read once per
  frame.
- `useCoverRise` drives the "sections rise into place while scrolling" effect used across
  section components; it tracks a stabilized viewport height (via the `--fc-vh` CSS var set in
  `src/app/layout.tsx`) to avoid jitter from mobile browser chrome resizing.
- `useInView` / `useStaggerChildren` handle simpler in-view fade/stagger reveals.
- Other animation-adjacent hooks: `useTypeMotion` (typing effect), `useConfetti` (click bursts,
  paired with `ClickFrame`'s `confettiText`/`animate` props), `useTicketStatus` (drives the
  ticket-open countdown/state using `TICKET_OPEN_AT`/`CONFERENCE_AT` from `site.ts`), `useMedia`.

**Global scripts injected in `<head>`** (`src/app/layout.tsx`): a stable-viewport-height script
(sets `--fc-vh`, avoiding resize jitter from mobile toolbar show/hide) and
`introScrollResetScript` from `src/components/IntroScrollReset.tsx`. Both run
`beforeInteractive` and are load-bearing for scroll behavior — don't move them into regular
client components without preserving that timing.

**Hero media/palette.** `HERO_MEDIA` in `site.ts` defines a small set of background video +
accent-color options; whichever one the hero picks at load is reused for schedule-card hover
color, story silhouettes, buddy snail tint, etc., so the whole page reads as one palette. If you
add a new hero media entry, it needs the same `accent`/`ramp` shape.

**Schedule data model.** `SCHEDULE_GROUPS` in `site.ts` models the printed schedule grid: each
group (main sessions / lightning talks / networking) has `halls` (columns) and `rows`, where each
row's `sessions` array has one entry per hall (or `null` for an empty cell), keyed positionally —
not by hall name — so a row's `sessions` array must stay in the same order as its group's `halls`
array. This structure is also what `scripts/generate-schedule-svg-v2.mjs` renders into the
downloadable schedule SVG/PNG.

## Deployment

Static export via `next build` (`output: "export"`), deployed to GitHub Pages by
`.github/workflows/deploy.yml` on push to `main`, publishing to
[fedgkr.github.io/feconf2026](https://fedgkr.github.io/feconf2026/), which redirects to the
production domain [2026.feconf.kr](https://2026.feconf.kr/) (that redirect is configured outside
this repo, e.g. at the domain/DNS level). Images are unoptimized (`images: { unoptimized: true
}`) since there's no server to run Next's image optimizer.
