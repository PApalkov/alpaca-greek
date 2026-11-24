import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // Relative base so the same build works on any static host and inside Capacitor.
  base: "./",
  // The whole word deck (~1300 cards with examples) ships inside the bundle so the app works offline.
  build: { chunkSizeWarningLimit: 1200 },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Alpaca Greek",
        short_name: "Alpaca Greek",
        description: "Учим греческий: слова, падежи, прогресс",
        lang: "ru",
        theme_color: "#FBF5EA",
        background_color: "#FBF5EA",
        display: "standalone",
        start_url: ".",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2,json}"],
      },
    }),
  ],
});
