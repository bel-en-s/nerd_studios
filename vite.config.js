import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/nerd_studios/",

  build: {
    outDir: "docs",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        gallery: resolve(__dirname, "gallery.html"),
        shop: resolve(__dirname, "shop.html"),
        product: resolve(__dirname, "product.html"),
      },
    },
  },
});