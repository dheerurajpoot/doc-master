import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Doc Master",
		short_name: "Doc Master",
		description:
			"Align, crop, and prepare your documents for printing on A4 paper with AI-powered background removal. Free, fast, and professional.",
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#000000",
		orientation: "portrait",
		id: "/",
		icons: [
			{
				src: "/favicon-192x192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/favicon-512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
		screenshots: [
			{
				src: "/docmaster.png",
				sizes: "1200x630",
				type: "image/png",
				label: "Docmaster",
			},
		],
	};
}
