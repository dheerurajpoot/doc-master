import { type NextRequest, NextResponse } from "next/server";
import { removeBackground } from "@imgly/background-removal-node";

export async function POST(request: NextRequest) {
	try {
		const { image } = await request.json();

		if (!image) {
			return NextResponse.json(
				{ message: "No image provided" },
				{ status: 400 },
			);
		}

		// Convert base64 data URL to Blob
		let imageSource: Blob | Buffer;
		
		if (image.startsWith("data:")) {
			// Extract base64 data and content type
			const [prefix, base64] = image.split(",");
			const match = prefix.match(/data:(.*?);base64/);
			const contentType = match?.[1] || "image/png";
			
			// Convert base64 to Buffer
			const buffer = Buffer.from(base64, "base64");
			
			// Create Blob from Buffer
			imageSource = new Blob([buffer], { type: contentType });
		} else {
			// If it's already a URL or file path, use it directly
			imageSource = image;
		}

		const blob = await removeBackground(imageSource);

		const buffer = await blob.arrayBuffer();
		const base64 = Buffer.from(buffer).toString("base64");
		const processedImage = `data:image/png;base64,${base64}`;

		return NextResponse.json({
			data: processedImage,
			message: "Background removed successfully",
		});
	} catch (error) {
		console.error("Background removal error:", error);
		return NextResponse.json(
			{ 
				message: error instanceof Error ? error.message : "Failed to process image",
				error: String(error)
			},
			{ status: 500 },
		);
	}
}
