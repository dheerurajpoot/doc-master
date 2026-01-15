"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
	Upload,
	Trash2,
	Download,
	Wand2,
	Crop as Crop2,
	ArrowRight,
} from "lucide-react";

interface ImageState {
	front?: {
		src: string;
		scale: number;
		x: number;
		y: number;
		rotation: number;
	};
	back?: {
		src: string;
		scale: number;
		x: number;
		y: number;
		rotation: number;
	};
}

type DownloadSettings = {
	filename: string;
	format: "png" | "jpeg";
};

export default function Home() {
	const [images, setImages] = useState<ImageState>({});
	const [selectedImage, setSelectedImage] = useState<"front" | "back">(
		"front"
	);
	const [bgRemovalLoading, setBgRemovalLoading] = useState(false);
	const [isCropping, setIsCropping] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const cropCanvasRef = useRef<HTMLCanvasElement>(null);
	const cropImageRef = useRef<HTMLImageElement>(null);
	const previewWrapRef = useRef<HTMLDivElement>(null);
	const [previewScale, setPreviewScale] = useState(1);
	const [downloadSettings, setDownloadSettings] = useState<DownloadSettings>({
		filename: "doc-master-document",
		format: "png",
	});

	// A4 dimensions in pixels (at 96 DPI)
	const A4_WIDTH = 616;
	const A4_HEIGHT = 1056;
	const PREVIEW_W = A4_WIDTH / 2;
	const PREVIEW_H = A4_HEIGHT / 2;

	useEffect(() => {
		const el = previewWrapRef.current;
		if (!el) return;

		const ro = new ResizeObserver(() => {
			const width = el.clientWidth;
			if (!width) return;
			setPreviewScale(Math.min(1, width / PREVIEW_W));
		});

		ro.observe(el);
		return () => ro.disconnect();
	}, [PREVIEW_W]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			const stored = window.localStorage.getItem(
				"doc-master-download-settings"
			);
			if (stored) {
				const parsed = JSON.parse(stored) as DownloadSettings;
				if (
					parsed &&
					typeof parsed.filename === "string" &&
					(parsed.format === "png" || parsed.format === "jpeg")
				) {
					setDownloadSettings(parsed);
				}
			}
		} catch {
			// ignore
		}
	}, []);

	const persistDownloadSettings = (next: DownloadSettings) => {
		setDownloadSettings(next);
		if (typeof window === "undefined") return;
		try {
			window.localStorage.setItem(
				"doc-master-download-settings",
				JSON.stringify(next)
			);
		} catch {
			// ignore
		}
	};

	const renderCanvasComposition = async () => {
		const canvas = canvasRef.current;
		if (!canvas) return null;

		const ctx = canvas.getContext("2d");
		if (!ctx) return null;

		// White background
		ctx.clearRect(0, 0, A4_WIDTH, A4_HEIGHT);
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT);

		const drawImageOnCanvas = (
			imgState: NonNullable<ImageState["front"]>
		) =>
			new Promise<void>((resolve, reject) => {
				const img = new Image();
				img.onload = () => {
					try {
						ctx.save();
						ctx.translate(imgState.x, imgState.y);
						ctx.rotate((imgState.rotation * Math.PI) / 180);
						ctx.scale(imgState.scale, imgState.scale);
						ctx.drawImage(img, 0, 0);
						ctx.restore();
						resolve();
					} catch (e) {
						reject(e);
					}
				};
				img.onerror = reject;
				img.src = imgState.src;
			});

		if (images.front) {
			await drawImageOnCanvas(images.front);
		}
		if (images.back) {
			await drawImageOnCanvas(images.back);
		}

		return canvas;
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			const src = event.target?.result as string;
			setImages({
				...images,
				[selectedImage]: {
					src,
					scale: 0.5, // Slightly smaller than before
					x: (A4_WIDTH / 2) * 0.25, // Center horizontally
					y: selectedImage === "front" ? 40 : 180, // Front: top gap, Back: below front
					rotation: 0,
				},
			});
		};
		reader.readAsDataURL(file);
	};

	const updateImage = (updates: Partial<ImageState[keyof ImageState]>) => {
		if (images[selectedImage]) {
			setImages({
				...images,
				[selectedImage]: { ...images[selectedImage]!, ...updates },
			});
		}
	};

	const removeBackground = async () => {
		if (!images[selectedImage]) return;

		setBgRemovalLoading(true);
		try {
			const response = await fetch("/api/remove-bg", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ image: images[selectedImage]!.src }),
			});

			if (response.ok) {
				const { data } = await response.json();
				updateImage({ src: data });
			}
		} catch (error) {
			console.error("Background removal failed:", error);
		} finally {
			setBgRemovalLoading(false);
		}
	};

	const openCropTool = () => {
		setIsCropping(true);
	};

	const handleCropSave = (canvas: HTMLCanvasElement) => {
		const croppedSrc = canvas.toDataURL("image/png");
		updateImage({ src: croppedSrc });
		setIsCropping(false);
	};

	const handlePrint = async () => {
		const canvas = await renderCanvasComposition();
		if (!canvas) return;

		const printWindow = window.open("", "", "width=800,height=600");
		if (printWindow) {
			printWindow.document.write(`
        <html>
          <head>
            <title>Doc Master Print</title>
            <style>
              * { margin: 0; padding: 0; }
              body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #ffffff; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <img src="${canvas.toDataURL("image/png")}" />
          </body>
        </html>
      `);
			printWindow.document.close();
			setTimeout(() => printWindow.print(), 250);
		}
	};

	const downloadPDF = async () => {
		const canvas = await renderCanvasComposition();
		if (!canvas) return;

		const mime =
			downloadSettings.format === "jpeg" ? "image/jpeg" : "image/png";
		const ext = downloadSettings.format === "jpeg" ? "jpg" : "png";
		const baseName =
			downloadSettings.filename.trim() || "doc-master-document";

		const link = document.createElement("a");
		link.href = canvas.toDataURL(mime);
		link.download = `${baseName}.${ext}`;
		link.click();

		persistDownloadSettings(downloadSettings);
	};

	return (
		<div className='min-h-screen bg-linear-to-b from-background via-background to-muted flex flex-col md:pt-20 overflow-x-hidden'>
			<main className='flex-1 pb-20 md:pb-6 px-4 md:px-6 pt-6 md:pt-6'>
				{/* Home hero: Editor */}
				<section className='max-w-7xl mx-auto pt-18 md:pt-6 pb-10 md:pb-12'>
					<div className='grid lg:grid-cols-3 gap-6'>
						{/* Preview */}
						<div className='lg:col-span-2 space-y-4'>
							<div className='text-center lg:text-left space-y-3'>
								<div className='inline-flex items-center bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-semibold'>
									Professional document alignment
								</div>
								<h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-balance text-foreground leading-tight'>
									Align & Print Your{" "}
									<span className='text-primary'>
										Documents
									</span>{" "}
									with Precision
								</h1>
								<p className='text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl lg:max-w-none text-balance'>
									Upload front and back, position them on A4,
									remove backgrounds, crop, and print with one
									click.
								</p>
							</div>

							<div className='bg-card border-2 border-border rounded-xl overflow-hidden'>
								<div className='flex items-center justify-center bg-muted p-4'>
									<div
										ref={previewWrapRef}
										className='w-full flex justify-center overflow-hidden'
										style={{
											height: PREVIEW_H * previewScale,
										}}>
										<div
											className='relative bg-white rounded-md shadow-sm overflow-hidden'
											style={{
												width: PREVIEW_W,
												height: PREVIEW_H,
												transform: `scale(${previewScale})`,
												transformOrigin: "top left",
											}}>
											<canvas
												ref={canvasRef}
												width={A4_WIDTH}
												height={A4_HEIGHT}
												className='hidden'
											/>

											{/* A4 Preview */}
											{!images.front && !images.back ? (
												<div className='w-full h-full flex items-center justify-center text-muted-foreground text-center px-4'>
													<div>
														<p className='text-lg font-semibold mb-2'>
															Upload Your
															Documents
														</p>
														<p className='text-sm'>
															Upload front and
															back images to get
															started
														</p>
													</div>
												</div>
											) : (
												<>
													{images.front && (
														<div
															className={`absolute cursor-pointer ${
																selectedImage ===
																"front"
																	? "ring-2 ring-primary"
																	: ""
															}`}
															style={{
																transform: `translate(${images.front.x}px, ${images.front.y}px) rotate(${images.front.rotation}deg) scale(${images.front.scale})`,
																transformOrigin:
																	"top left",
															}}
															onClick={() =>
																setSelectedImage(
																	"front"
																)
															}>
															<img
																src={
																	images.front
																		.src ||
																	"/placeholder.svg"
																}
																alt='Front'
																className='max-w-xs h-auto border border-primary rounded'
															/>
														</div>
													)}
													{images.back && (
														<div
															className={`absolute cursor-pointer ${
																selectedImage ===
																"back"
																	? "ring-2 ring-secondary"
																	: ""
															}`}
															style={{
																transform: `translate(${images.back.x}px, ${images.back.y}px) rotate(${images.back.rotation}deg) scale(${images.back.scale})`,
																transformOrigin:
																	"top left",
															}}
															onClick={() =>
																setSelectedImage(
																	"back"
																)
															}>
															<img
																src={
																	images.back
																		.src ||
																	"/placeholder.svg"
																}
																alt='Back'
																className='max-w-xs h-auto border border-secondary rounded'
															/>
														</div>
													)}
												</>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className='flex flex-col sm:flex-row gap-3'>
								<Button
									onClick={handlePrint}
									className='bg-accent hover:bg-accent/90 w-full sm:w-auto'>
									<Download className='w-4 h-4 mr-2' />
									Print
								</Button>
								<Button
									onClick={downloadPDF}
									variant='outline'
									className='w-full sm:w-auto bg-transparent'>
									<ArrowRight className='w-4 h-4 mr-2' />
									Download
								</Button>
							</div>

							{/* Download settings */}
							<div className='mt-2 flex flex-col sm:flex-row gap-2 sm:items-center text-xs sm:text-sm text-muted-foreground'>
								<div className='flex-1 flex items-center gap-2'>
									<label className='whitespace-nowrap'>
										File name:
									</label>
									<input
										value={downloadSettings.filename}
										onChange={(e) =>
											persistDownloadSettings({
												...downloadSettings,
												filename: e.target.value,
											})
										}
										className='flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs sm:text-sm'
									/>
								</div>
								<div className='flex items-center gap-2'>
									<label>Format:</label>
									<select
										value={downloadSettings.format}
										onChange={(e) =>
											persistDownloadSettings({
												...downloadSettings,
												format: e.target
													.value as DownloadSettings["format"],
											})
										}
										className='rounded-md border border-border bg-background px-2 py-1 text-xs sm:text-sm'>
										<option value='png'>PNG</option>
										<option value='jpeg'>JPEG</option>
									</select>
								</div>
							</div>
						</div>

						{/* Controls */}
						<div className='space-y-4 lg:space-y-6'>
							{/* Image Selection */}
							<div className='bg-card border border-border rounded-xl p-4 sm:p-6'>
								<h3 className='font-semibold mb-3 text-foreground'>
									Select Image
								</h3>
								<div className='grid grid-cols-2 gap-2 sm:gap-3'>
									{(["front", "back"] as const).map(
										(side) => (
											<button
												key={side}
												onClick={() =>
													setSelectedImage(side)
												}
												className={`py-2.5 px-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
													selectedImage === side
														? "bg-primary text-primary-foreground"
														: "bg-muted text-foreground hover:bg-muted-foreground/20"
												}`}>
												{side.charAt(0).toUpperCase() +
													side.slice(1)}
											</button>
										)
									)}
								</div>
							</div>

							{/* Upload */}
							<div className='bg-card border border-border rounded-xl p-4 sm:p-6'>
								<h3 className='font-semibold mb-4 text-foreground'>
									Upload
								</h3>
								<input
									ref={fileInputRef}
									type='file'
									accept='image/*'
									onChange={handleImageUpload}
									className='hidden'
								/>
								<Button
									onClick={() =>
										fileInputRef.current?.click()
									}
									variant='outline'
									className='w-full'>
									<Upload className='w-4 h-4 mr-2' />
									Choose Image
								</Button>
							</div>

							{/* Adjustments */}
							{images[selectedImage] && (
								<>
									<div className='bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4'>
										<h3 className='font-semibold text-foreground'>
											Adjustments
										</h3>

										{/* Scale */}
										<div>
											<label className='text-sm font-medium text-foreground block mb-2'>
												Size:{" "}
												{(
													images[selectedImage]!
														.scale * 100
												).toFixed(0)}
												%
											</label>
											<input
												type='range'
												min='0.5'
												max='2'
												step='0.1'
												value={
													images[selectedImage]!.scale
												}
												onChange={(e) =>
													updateImage({
														scale: Number.parseFloat(
															e.target.value
														),
													})
												}
												className='w-full'
											/>
										</div>

										{/* Rotation */}
										<div>
											<label className='text-sm font-medium text-foreground block mb-2'>
												Rotation:{" "}
												{
													images[selectedImage]!
														.rotation
												}
												°
											</label>
											<input
												type='range'
												min='-45'
												max='45'
												step='1'
												value={
													images[selectedImage]!
														.rotation
												}
												onChange={(e) =>
													updateImage({
														rotation:
															Number.parseInt(
																e.target.value
															),
													})
												}
												className='w-full'
											/>
										</div>

										{/* Position X */}
										<div>
											<label className='text-sm font-medium text-foreground block mb-2'>
												Left-Right:{" "}
												{images[selectedImage]!.x}px
											</label>
											<input
												type='range'
												min='-200'
												max='400'
												step='5'
												value={images[selectedImage]!.x}
												onChange={(e) =>
													updateImage({
														x: Number.parseInt(
															e.target.value
														),
													})
												}
												className='w-full'
											/>
										</div>

										{/* Position Y */}
										<div>
											<label className='text-sm font-medium text-foreground block mb-2'>
												Top-Bottom:{" "}
												{images[selectedImage]!.y}px
											</label>
											<input
												type='range'
												min='0'
												max='600'
												step='5'
												value={images[selectedImage]!.y}
												onChange={(e) =>
													updateImage({
														y: Number.parseInt(
															e.target.value
														),
													})
												}
												className='w-full'
											/>
										</div>
									</div>

									{/* AI Tools */}
									<div className='bg-card border border-border rounded-xl p-4 sm:p-6 space-y-3'>
										<h3 className='font-semibold text-foreground mb-4'>
											AI Tools
										</h3>
										<Button
											onClick={removeBackground}
											disabled={bgRemovalLoading}
											className='w-full bg-accent hover:bg-accent/90'>
											<Wand2 className='w-4 h-4 mr-2' />
											{bgRemovalLoading
												? "Removing..."
												: "Remove Background"}
										</Button>
										<Button
											onClick={openCropTool}
											variant='outline'
											className='w-full bg-transparent'>
											<Crop2 className='w-4 h-4 mr-2' />
											Crop Image
										</Button>
									</div>

									{/* Clear */}
									<Button
										onClick={() => {
											const newImages = { ...images };
											delete newImages[selectedImage];
											setImages(newImages);
										}}
										variant='destructive'
										className='w-full'>
										<Trash2 className='w-4 h-4 mr-2' />
										Clear Image
									</Button>
								</>
							)}
						</div>
					</div>

					{/* Feature Cards */}
					<div className='grid md:grid-cols-3 gap-6 md:gap-8 mt-10 md:mt-14'>
						{[
							{
								icon: "✨",
								title: "AI Background Removal",
								description:
									"Free AI-powered background removal to clean up your documents automatically",
							},
							{
								icon: "✂️",
								title: "Precise Cropping",
								description:
									"Crop and align your documents with pixel-perfect precision on A4 paper",
							},
							{
								icon: "🖨️",
								title: "One-Click Printing",
								description:
									"Print your perfectly aligned documents directly from your browser",
							},
						].map((feature, idx) => (
							<div
								key={idx}
								className='bg-card border border-border rounded-xl p-6 md:p-8 hover:border-primary/50 transition-colors'>
								<div className='bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-2xl'>
									{feature.icon}
								</div>
								<h3 className='text-lg font-semibold text-foreground mb-2'>
									{feature.title}
								</h3>
								<p className='text-muted-foreground'>
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</section>
			</main>

			{isCropping && images[selectedImage] && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
					<div className='bg-card rounded-xl max-w-2xl w-full max-h-96 overflow-auto'>
						<div className='p-6 border-b border-border flex justify-between items-center sticky top-0 bg-card'>
							<h2 className='text-xl font-semibold'>
								Crop Image
							</h2>
							<button
								onClick={() => setIsCropping(false)}
								className='text-muted-foreground hover:text-foreground'>
								✕
							</button>
						</div>
						<div className='p-6 space-y-4'>
							<CropTool
								src={images[selectedImage]!.src}
								onSave={handleCropSave}
								onCancel={() => setIsCropping(false)}
								cropCanvasRef={cropCanvasRef}
								cropImageRef={cropImageRef}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function CropTool({
	src,
	onSave,
	onCancel,
	cropCanvasRef,
	cropImageRef,
}: {
	src: string;
	onSave: (canvas: HTMLCanvasElement) => void;
	onCancel: () => void;
	cropCanvasRef: React.RefObject<HTMLCanvasElement | null>;
	cropImageRef: React.RefObject<HTMLImageElement | null>;
}) {
	const [cropArea, setCropArea] = useState({
		x: 40,
		y: 40,
		width: 220,
		height: 220,
	});
	const [dragMode, setDragMode] = useState<
		"move" | "resize-nw" | "resize-ne" | "resize-sw" | "resize-se" | null
	>(null);
	const dragStartRef = useRef<{
		x: number;
		y: number;
		area: typeof cropArea;
	} | null>(null);

	const startDrag = (
		e: React.MouseEvent<HTMLDivElement>,
		mode: "move" | "resize-nw" | "resize-ne" | "resize-sw" | "resize-se"
	) => {
		e.preventDefault();
		if (!cropImageRef.current) return;
		const rect = cropImageRef.current.getBoundingClientRect();
		dragStartRef.current = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
			area: { ...cropArea },
		};
		setDragMode(mode);
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!dragMode || !cropImageRef.current || !dragStartRef.current) return;
		const rect = cropImageRef.current.getBoundingClientRect();
		const currentX = e.clientX - rect.left;
		const currentY = e.clientY - rect.top;
		const dx = currentX - dragStartRef.current.x;
		const dy = currentY - dragStartRef.current.y;
		const start = dragStartRef.current.area;

		let next = { ...start };

		if (dragMode === "move") {
			next.x = Math.min(
				Math.max(0, start.x + dx),
				rect.width - start.width
			);
			next.y = Math.min(
				Math.max(0, start.y + dy),
				rect.height - start.height
			);
		} else {
			if (dragMode.includes("nw")) {
				const newX = Math.max(0, start.x + dx);
				const newY = Math.max(0, start.y + dy);
				next.width = Math.max(40, start.width - (newX - start.x));
				next.height = Math.max(40, start.height - (newY - start.y));
				next.x = newX;
				next.y = newY;
			}
			if (dragMode.includes("ne")) {
				const newY = Math.max(0, start.y + dy);
				const newW = Math.max(40, start.width + dx);
				next.width = Math.min(newW, rect.width - start.x);
				next.height = Math.max(40, start.height - (newY - start.y));
				next.y = newY;
			}
			if (dragMode.includes("sw")) {
				const newX = Math.max(0, start.x + dx);
				const newH = Math.max(40, start.height + dy);
				next.width = Math.max(40, start.width - (newX - start.x));
				next.height = Math.min(newH, rect.height - start.y);
				next.x = newX;
			}
			if (dragMode.includes("se")) {
				next.width = Math.min(
					Math.max(40, start.width + dx),
					rect.width - start.x
				);
				next.height = Math.min(
					Math.max(40, start.height + dy),
					rect.height - start.y
				);
			}
		}

		setCropArea(next);
	};

	const handleMouseUp = () => {
		setDragMode(null);
	};

	const executeCrop = () => {
		if (!cropImageRef.current || !cropCanvasRef.current) return;
		const ctx = cropCanvasRef.current.getContext("2d");
		if (!ctx) return;

		cropCanvasRef.current.width = cropArea.width;
		cropCanvasRef.current.height = cropArea.height;
		ctx.drawImage(
			cropImageRef.current,
			cropArea.x,
			cropArea.y,
			cropArea.width,
			cropArea.height,
			0,
			0,
			cropArea.width,
			cropArea.height
		);
		onSave(cropCanvasRef.current);
	};

	return (
		<div className='space-y-4'>
			<div
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
				className='relative inline-block border-2 border-primary rounded bg-muted p-2'>
				<img
					ref={cropImageRef}
					src={src || "/placeholder.svg"}
					alt='Crop'
					className='max-w-sm h-auto block'
				/>
				<div
					className='absolute border-2 border-accent bg-accent/20 cursor-move'
					onMouseDown={(e) => startDrag(e, "move")}
					style={{
						left: cropArea.x,
						top: cropArea.y,
						width: cropArea.width,
						height: cropArea.height,
					}}>
					{/* Resize handles */}
					<div
						onMouseDown={(e) => startDrag(e, "resize-nw")}
						className='absolute w-3 h-3 -left-1.5 -top-1.5 rounded-full bg-accent border border-background cursor-nw-resize'
					/>
					<div
						onMouseDown={(e) => startDrag(e, "resize-ne")}
						className='absolute w-3 h-3 -right-1.5 -top-1.5 rounded-full bg-accent border border-background cursor-ne-resize'
					/>
					<div
						onMouseDown={(e) => startDrag(e, "resize-sw")}
						className='absolute w-3 h-3 -left-1.5 -bottom-1.5 rounded-full bg-accent border border-background cursor-sw-resize'
					/>
					<div
						onMouseDown={(e) => startDrag(e, "resize-se")}
						className='absolute w-3 h-3 -right-1.5 -bottom-1.5 rounded-full bg-accent border border-background cursor-se-resize'
					/>
				</div>
			</div>
			<div className='flex gap-3'>
				<Button
					onClick={executeCrop}
					className='bg-primary hover:bg-primary/90 flex-1'>
					Save Crop
				</Button>
				<Button
					onClick={onCancel}
					variant='outline'
					className='flex-1 bg-transparent'>
					Cancel
				</Button>
			</div>
			<canvas ref={cropCanvasRef} className='hidden' />
		</div>
	);
}
