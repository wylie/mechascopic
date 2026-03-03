# Mechascopic

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
