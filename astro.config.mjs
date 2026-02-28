// Astro config file
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://wylie.github.io/mechascopic/", // Update if using a custom domain
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
