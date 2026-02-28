// Astro config file
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://wylie.github.io/mechascopic/", // Update if using a custom domain
  integrations: [sitemap()],
  base: "/mechascopic/"
});
