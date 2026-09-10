This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

This project uses [pnpm](https://pnpm.io) (pinned via the `packageManager` field in
`package.json`, enforced by Corepack) — `npm`/`yarn`/`bun` will refuse to run.

First, install dependencies and run the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment

This site is statically exported (`output: "export"`) and deployed to GitHub Pages via
`.github/workflows/deploy.yml` on every push to `main`, publishing to
[fedgkr.github.io/feconf2026](https://fedgkr.github.io/feconf2026/), which redirects to the
production domain [2026.feconf.kr](https://2026.feconf.kr/) (configured outside this repo).
