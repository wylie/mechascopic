// Astro config file
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const isProd = process.env.NODE_ENV === "production";
export default defineConfig({
  site: isProd ? "https://mechascopic.com/" : "http://localhost:4321/",
  integrations: [sitemap()],
  base: "/",
});
