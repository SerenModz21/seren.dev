import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
	site: "https://seren.dev",
	integrations: [react(), sitemap({ lastmod: new Date() })],
	vite: { plugins: [tailwindcss()] },
	image: { domains: ["avatars.githubusercontent.com"] },
});
