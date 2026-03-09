# Mechascopic

## Newsletter (Local-First)

Newsletters are stored locally in `src/content/newsletter/` and rendered by Astro routes:

- `src/pages/newsletter/index.astro` for the archive list
- `src/pages/newsletter/[slug].astro` for individual issues

To publish a new issue:

1. Create a new Markdown file in `src/content/newsletter/`.
1. Add frontmatter:

```md
---
title: "Your issue title"
description: "1-2 sentence summary"
issueNumber: 2
pubDate: 2026-03-20
beehiivUrl: https://mechascopic.beehiiv.com/p/your-post-slug
draft: false
---
```

3. Add the issue body in Markdown below the frontmatter.
4. Run `npm run build` to verify and publish.

Set `draft: true` to keep an issue out of production pages.

### Newsletter Signup (Beehiiv)

Home page newsletter signup posts to `POST /api/newsletter/subscribe` and keeps users on the site.

Required server environment variables:

```bash
BEEHIIV_API_KEY=bh_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BEEHIIV_PUBLICATION_ID=pub_xxxxxxxxxxxxxxxx
```

If either value is missing, the subscribe API returns a configuration error.

## Deploying To Vercel

This project is configured for Astro server output with the Vercel adapter.

Vercel project settings:

- Framework preset: `Astro`
- Build command: `npm run build`
- Output directory: leave default for Astro

Set these environment variables in Vercel:

- `PUBLIC_GA_MEASUREMENT_ID`
- `BEEHIIV_API_KEY`
- `BEEHIIV_PUBLICATION_ID`

After connecting the GitHub repo in Vercel, pushes to `main` can deploy automatically.

## Google Analytics

Google Analytics (GA4) is configured globally in `src/layouts/Layout.astro` and reads the measurement ID from an environment variable.

To set the GA property, create a `.env` file in the project root:

```bash
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Notes:

- GA loads whenever `PUBLIC_GA_MEASUREMENT_ID` is set.
- Tracking is skipped automatically on `localhost` and `127.0.0.1`.
- If `PUBLIC_GA_MEASUREMENT_ID` is empty, the GA script will not load.
