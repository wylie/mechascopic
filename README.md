# Mechascopic

## Google Analytics

Google Analytics (GA4) is configured globally in `src/layouts/Layout.astro` and reads the measurement ID from `src/config.ts`.

To update the GA property, edit:

- `SITE.gaMeasurementId` in `src/config.ts`

Notes:

- GA loads only in production (`import.meta.env.PROD`).
- If `gaMeasurementId` is empty, the GA script will not load.
