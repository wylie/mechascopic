// Astro config file
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

export default defineConfig({
  // Keep a single canonical origin for sitemap and generated URLs.
  site: "https://mechascopic.com",
  output: "server",
  adapter: vercel(),
  integrations: [sitemap()],
  base: "/",
});
