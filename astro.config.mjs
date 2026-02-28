// Astro config file
import { defineConfig } from "astro/config";
import github from "@astrojs/github";

export default defineConfig({
  site: "https://wylie.github.io/mechascopic/", // Update if using a custom domain
  integrations: [github()],
  outDir: "dist",
  base: "/mechascopic/",
  markdown: {
    shikiConfig: {
      theme: "github-dark",
    },
  },
  experimental: {
    contentCollections: true,
  },
});
