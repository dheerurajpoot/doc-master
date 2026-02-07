"use client";

import { useRef, useState } from "react";
import { removeBackground } from "@imgly/background-removal";
import { Button } from "@/components/ui/button";
import { Upload, Download, Loader2, X } from "lucide-react";

export default function RemoveBackground() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [originalImage, setOriginalImage] = useState<string | null>(null);
	const [processedImage, setProcessedImage] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const imageURL = URL.createObjectURL(file);
		setOriginalImage(imageURL);
		setProcessedImage(null);

		// Process the image
		setLoading(true);
		try {
			const blob = await removeBackground(file);

			// Convert blob to data URL
			const reader = new FileReader();
			reader.onloadend = () => {
				setProcessedImage(reader.result as string);
				setLoading(false);
			};
			reader.onerror = () => {
				console.error("Failed to read processed image");
				setLoading(false);
			};
			reader.readAsDataURL(blob);
		} catch (error) {
			console.error("Background removal failed:", error);
			setLoading(false);
		}
	};

	const handleDownload = () => {
		if (!processedImage) return;

		const link = document.createElement("a");
		link.download = "removed-bg.png";
		link.href = processedImage;
		link.click();
	};

	const handleReset = () => {
		setOriginalImage(null);
		setProcessedImage(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className='min-h-screen bg-background bg-linear-to-b from-background via-background to-muted mt-14 p-4 md:p-8'>
			<div className='max-w-6xl mx-auto'>
				<div className='text-center mb-8'>
					<h1 className='text-4xl md:text-5xl font-bold mb-4 text-foreground'>
						Free Background Remover
					</h1>
					<p className='text-lg text-muted-foreground'>
						Remove backgrounds from images using AI - completely
						free, no API needed
					</p>
				</div>

				{!originalImage ? (
					<div className='flex flex-col items-center justify-center gap-4 p-12 border-2 border-dashed border-border rounded-2xl bg-card'>
						<Upload className='w-16 h-16 text-muted-foreground' />
						<div className='text-center'>
							<label
								htmlFor='file-upload'
								className='cursor-pointer'>
								<Button asChild size='lg'>
									<span>
										<Upload className='w-4 h-4 mr-2' />
										Choose Image
									</span>
								</Button>
							</label>
							<input
								id='file-upload'
								ref={fileInputRef}
								type='file'
								accept='image/*'
								onChange={handleFileUpload}
								className='hidden'
							/>
							<p className='text-sm text-muted-foreground mt-4'>
								Support: JPG, PNG, WEBP
							</p>
						</div>
					</div>
				) : (
					<div className='space-y-6'>
						<div className='flex justify-center gap-4'>
							<Button onClick={handleReset} variant='outline'>
								<X className='w-4 h-4 mr-2' />
								Reset
							</Button>
							{processedImage && (
								<Button onClick={handleDownload}>
									<Download className='w-4 h-4 mr-2' />
									Download PNG
								</Button>
							)}
						</div>

						<div className='grid md:grid-cols-2 gap-6'>
							{/* Original Image */}
							<div className='space-y-2'>
								<h3 className='text-lg font-semibold text-foreground'>
									Original
								</h3>
								<div className='relative bg-card border border-border rounded-xl p-4 overflow-hidden'>
									<img
										src={originalImage}
										alt='Original'
										className='w-full h-auto rounded-lg'
									/>
								</div>
							</div>

							{/* Processed Image */}
							<div className='space-y-2'>
								<h3 className='text-lg font-semibold text-foreground'>
									Background Removed
								</h3>
								<div className='relative bg-card border border-border rounded-xl p-4 overflow-hidden'>
									{loading ? (
										<div className='flex flex-col items-center justify-center h-64 gap-4'>
											<Loader2 className='w-12 h-12 animate-spin text-primary' />
											<p className='text-muted-foreground'>
												Removing background...
											</p>
										</div>
									) : processedImage ? (
										<div
											className='relative'
											style={{
												backgroundImage:
													"linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
												backgroundSize: "20px 20px",
												backgroundPosition:
													"0 0, 0 10px, 10px -10px, -10px 0px",
											}}>
											<img
												src={processedImage}
												alt='Processed'
												className='w-full h-auto rounded-lg'
											/>
										</div>
									) : null}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Hidden canvas for potential future use */}
				<canvas ref={canvasRef} className='hidden' />
			</div>
		</div>
	);
}
