// Astro config file
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // Keep a single canonical origin for sitemap and generated URLs.
  site: "https://mechascopic.com",
  integrations: [sitemap()],
  base: "/",
});
