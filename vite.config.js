import { defineConfig } from "vite"
import { resolve } from "path"

export default defineConfig({
	plugins: [],
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, "index.html"),
				gallery: resolve(__dirname, "gallery.html"),
				shop: resolve(__dirname, "shop.html"),
				product: resolve(__dirname, "product.html"),
			},
		},
	},
})
