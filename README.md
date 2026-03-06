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

Home page newsletter signup posts to `src/pages/api/newsletter/subscribe.ts`.

Add these env vars to `.env` (and your host secrets):

```bash
BEEHIIV_API_KEY=your_beehiiv_api_key
BEEHIIV_PUBLICATION_ID=your_beehiiv_publication_id
```

How to get them:

1. In Beehiiv, create an API key with permission to manage subscriptions.
1. Find your publication ID in Beehiiv settings/API area.

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
