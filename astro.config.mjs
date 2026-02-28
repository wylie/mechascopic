// Astro config file
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://mechascopic.com", // Update to your deployed URL
  integrations: [],
  markdown: {
    shikiConfig: {
      theme: "github-dark",
    },
  },
  experimental: {
    contentCollections: true,
  },
});
