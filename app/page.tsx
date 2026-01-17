"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Download, Wand2, ArrowRight } from "lucide-react";

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

function ImageWithCrop({
	side,
	src,
	x,
	y,
	rotation,
	scale,
	isSelected,
	isCropping,
	cropArea,
	onClick,
	onCropClick,
	onCropSave,
	onCropCancel,
	onCropAreaChange,
	imageRef,
}: {
	side: "front" | "back";
	src: string;
	x: number;
	y: number;
	rotation: number;
	scale: number;
	isSelected: boolean;
	isCropping: boolean;
	cropArea?: { x: number; y: number; width: number; height: number };
	onClick: () => void;
	onCropClick: () => void;
	onCropSave: () => void;
	onCropCancel: () => void;
	onCropAreaChange: (area: {
		x: number;
		y: number;
		width: number;
		height: number;
	}) => void;
	imageRef: (el: HTMLImageElement | null) => void;
}) {
	const [dragMode, setDragMode] = useState<
		| "move"
		| "create"
		| "resize-nw"
		| "resize-ne"
		| "resize-sw"
		| "resize-se"
		| null
	>(null);
	const dragStartRef = useRef<{
		x: number;
		y: number;
		area: typeof cropArea;
	} | null>(null);
	const imgRef = useRef<HTMLImageElement | null>(null);
	const overlayRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (isCropping && imgRef.current && !cropArea) {
			const img = imgRef.current;
			onCropAreaChange({
				x: 0,
				y: 0,
				width: img.width,
				height: img.height,
			});
		}
	}, [isCropping, cropArea, onCropAreaChange]);

	const startDrag = (
		e: React.MouseEvent<HTMLDivElement>,
		mode:
			| "move"
			| "create"
			| "resize-nw"
			| "resize-ne"
			| "resize-sw"
			| "resize-se"
		// corner-only
	) => {
		e.preventDefault();
		e.stopPropagation();
		const base = overlayRef.current ?? imgRef.current;
		if (!base || !cropArea) return;
		const rect = base.getBoundingClientRect();
		dragStartRef.current = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
			area: { ...cropArea },
		};
		setDragMode(mode);
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const base = overlayRef.current ?? imgRef.current;
		if (!dragMode || !base || !dragStartRef.current || !cropArea) return;
		e.preventDefault();
		e.stopPropagation();
		const rect = base.getBoundingClientRect();
		const currentX = e.clientX - rect.left;
		const currentY = e.clientY - rect.top;
		const dx = currentX - dragStartRef.current.x;
		const dy = currentY - dragStartRef.current.y;
		const start = dragStartRef.current.area!;

		const next = { ...start };

		if (dragMode === "move") {
			next.x = Math.min(
				Math.max(0, start.x + dx),
				rect.width - start.width
			);
			next.y = Math.min(
				Math.max(0, start.y + dy),
				rect.height - start.height
			);
		} else if (dragMode === "create") {
			const originX = dragStartRef.current.x;
			const originY = dragStartRef.current.y;
			const rawX = Math.min(originX, currentX);
			const rawY = Math.min(originY, currentY);
			const rawW = Math.abs(currentX - originX);
			const rawH = Math.abs(currentY - originY);
			next.x = Math.max(0, rawX);
			next.y = Math.max(0, rawY);
			next.width = Math.max(40, Math.min(rawW, rect.width - next.x));
			next.height = Math.max(40, Math.min(rawH, rect.height - next.y));
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
			// corner-only resizing handled above
		}

		onCropAreaChange(next);
	};

	const handleMouseUp = () => {
		setDragMode(null);
	};
	// Start a new selection by dragging on overlay outside current crop box
	const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		const base = overlayRef.current ?? imgRef.current;
		if (!base) return;
		const rect = base.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const insideCurrent =
			cropArea &&
			x >= cropArea.x &&
			x <= cropArea.x + cropArea.width &&
			y >= cropArea.y &&
			y <= cropArea.y + cropArea.height;
		if (insideCurrent) return;
		dragStartRef.current = { x, y, area: { x, y, width: 1, height: 1 } };
		setDragMode("create");
		onCropAreaChange({ x, y, width: 1, height: 1 });
	};

	const borderColor =
		side === "front" ? "border-primary" : "border-secondary";
	const ringColor = side === "front" ? "ring-primary" : "ring-secondary";

	return (
		<div
			className={`absolute ${isSelected ? `ring-2 ${ringColor}` : ""} ${
				isCropping ? "z-10" : ""
			}`}
			style={{
				transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`,
				transformOrigin: "top left",
			}}
			onClick={() => {
				if (!isCropping) {
					onClick();
				}
			}}
			onDoubleClick={() => {
				if (!isCropping) {
					onCropClick();
				}
			}}>
			<div className='relative'>
				<img
					ref={(el) => {
						imgRef.current = el;
						imageRef(el);
					}}
					src={src || "/placeholder.svg"}
					alt={side}
					className={`max-w-xs h-auto ${borderColor} rounded`}
					style={{ borderWidth: "2px" }}
				/>
				{isCropping && cropArea && (
					<div
						className='absolute inset-0 select-none'
						ref={overlayRef}
						onMouseDown={handleOverlayMouseDown}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						onMouseLeave={handleMouseUp}>
						{/* Dark overlay outside crop area */}
						<svg className='absolute inset-0 w-full h-full pointer-events-none'>
							<defs>
								<mask id={`crop-mask-${side}`}>
									<rect
										width='100%'
										height='100%'
										fill='white'
									/>
									<rect
										x={cropArea.x}
										y={cropArea.y}
										width={cropArea.width}
										height={cropArea.height}
										fill='black'
									/>
								</mask>
							</defs>
							<rect
								width='100%'
								height='100%'
								fill='rgba(0,0,0,0.5)'
								mask={`url(#crop-mask-${side})`}
							/>
						</svg>
						{/* Crop box */}
						<div
							className='absolute border-2 border-accent bg-transparent cursor-move'
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
								className='absolute w-3.5 h-3.5 -left-1.5 -top-1.5 rounded-full bg-accent border-2 border-background cursor-nw-resize shadow-sm transition-transform hover:scale-110'
							/>
							<div
								onMouseDown={(e) => startDrag(e, "resize-ne")}
								className='absolute w-3.5 h-3.5 -right-1.5 -top-1.5 rounded-full bg-accent border-2 border-background cursor-ne-resize shadow-sm transition-transform hover:scale-110'
							/>
							<div
								onMouseDown={(e) => startDrag(e, "resize-sw")}
								className='absolute w-3.5 h-3.5 -left-1.5 -bottom-1.5 rounded-full bg-accent border-2 border-background cursor-sw-resize shadow-sm transition-transform hover:scale-110'
							/>
							<div
								onMouseDown={(e) => startDrag(e, "resize-se")}
								className='absolute w-3.5 h-3.5 -right-1.5 -bottom-1.5 rounded-full bg-accent border-2 border-background cursor-se-resize shadow-sm transition-transform hover:scale-110'
							/>
							{/* Corner pointers only for simpler UX */}
						</div>
						{/* Crop controls */}
						<div className='absolute -bottom-12 left-0 right-0 flex gap-2 justify-center bg-background/80 backdrop-blur-sm rounded-md p-2 border border-border shadow-sm'>
							<Button
								onClick={(e) => {
									e.stopPropagation();
									onCropSave();
								}}
								size='sm'
								className='bg-primary hover:bg-primary/90 text-xs px-3 py-1'>
								Save Crop
							</Button>
							<Button
								onClick={(e) => {
									e.stopPropagation();
									onCropCancel();
								}}
								size='sm'
								variant='outline'
								className='text-xs px-3 py-1'>
								Cancel
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default function Home() {
	const [images, setImages] = useState<ImageState>({});
	const [selectedImage, setSelectedImage] = useState<"front" | "back">(
		"front"
	);
	const [bgRemovalLoading, setBgRemovalLoading] = useState(false);
	const [croppingImage, setCroppingImage] = useState<"front" | "back" | null>(
		null
	);
	const [cropAreas, setCropAreas] = useState<{
		front?: { x: number; y: number; width: number; height: number };
		back?: { x: number; y: number; width: number; height: number };
	}>({});
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const previewWrapRef = useRef<HTMLDivElement>(null);
	const [previewScale, setPreviewScale] = useState(1);
	const imageRefs = useRef<{
		front?: HTMLImageElement;
		back?: HTMLImageElement;
	}>({});
	const [downloadSettings, setDownloadSettings] = useState<DownloadSettings>({
		filename: "doc-master",
		format: "png",
	});

	// A4 dimensions in pixels (at 96 DPI)
	const A4_WIDTH = 616;
	const A4_HEIGHT = 956;
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

	// Preload IMG.LY assets for faster first run
	// useEffect(() => {
	// 	const config: ImglyConfig = {
	// 		device: "gpu",
	// 		output: { format: "image/png", type: "foreground", quality: 0.9 },
	// 	};
	// 	preloadImgly(config).catch(() => {});
	// }, []);

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

		// Use high DPI for quality (2x for retina displays)
		const dpr = window.devicePixelRatio || 2;
		const scaledWidth = A4_WIDTH * dpr;
		const scaledHeight = A4_HEIGHT * dpr;

		canvas.width = scaledWidth;
		canvas.height = scaledHeight;

		const ctx = canvas.getContext("2d");
		if (!ctx) return null;

		// Scale context to match DPI
		ctx.scale(dpr, dpr);

		// White background
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

						// Preview is half size, canvas is full size, so multiply positions by 2
						const canvasX = imgState.x * 2;
						const canvasY = imgState.y * 2;

						ctx.translate(canvasX, canvasY);
						ctx.rotate((imgState.rotation * Math.PI) / 180);
						ctx.scale(imgState.scale, imgState.scale);

						// Image source is already cropped if user saved a crop
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

	// const onRemoveBackground = async () => {
	// 	if (!images[selectedImage]) return;

	// 	setBgRemovalLoading(true);
	// 	try {
	// 		const blob = await imglyRemoveBackground(
	// 			images[selectedImage]!.src,
	// 			{
	// 				device: "gpu",
	// 				output: {
	// 					format: "image/png",
	// 					type: "foreground",
	// 					quality: 0.9,
	// 				},
	// 			} as ImglyConfig
	// 		);
	// 		const reader = new FileReader();
	// 		reader.onloadend = () => {
	// 			const dataUrl = reader.result as string;
	// 			updateImage({ src: dataUrl });
	// 		};
	// 		reader.readAsDataURL(blob);
	// 	} catch (error) {
	// 		console.error("Background removal failed:", error);
	// 	} finally {
	// 		setBgRemovalLoading(false);
	// 	}
	// };

	const startCrop = (side: "front" | "back") => {
		setCroppingImage(side);
		const img = imageRefs.current[side];
		if (img && !cropAreas[side]) {
			// Initialize crop area to cover full displayed image
			const rect = img.getBoundingClientRect();
			setCropAreas({
				...cropAreas,
				[side]: { x: 0, y: 0, width: rect.width, height: rect.height },
			});
		}
	};

	const saveCrop = (side: "front" | "back") => {
		const img = imageRefs.current[side];
		const crop = cropAreas[side];
		if (!img || !crop || !images[side]) return;

		// Convert displayed coordinates (affected by transforms) to natural image coordinates
		const rect = img.getBoundingClientRect();
		const scaleX = img.naturalWidth / rect.width;
		const scaleY = img.naturalHeight / rect.height;

		const naturalCrop = {
			x: crop.x * scaleX,
			y: crop.y * scaleY,
			width: crop.width * scaleX,
			height: crop.height * scaleY,
		};

		const canvas = document.createElement("canvas");
		canvas.width = naturalCrop.width;
		canvas.height = naturalCrop.height;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.drawImage(
			img,
			naturalCrop.x,
			naturalCrop.y,
			naturalCrop.width,
			naturalCrop.height,
			0,
			0,
			naturalCrop.width,
			naturalCrop.height
		);

		const croppedSrc = canvas.toDataURL("image/png");
		updateImage({ src: croppedSrc });
		setCroppingImage(null);
		setCropAreas({ ...cropAreas, [side]: undefined });
	};

	const cancelCrop = () => {
		setCroppingImage(null);
	};

	const handlePrint = async () => {
		const canvas = await renderCanvasComposition();
		if (!canvas) return;

		// Use high quality PNG for printing
		const dataUrl = canvas.toDataURL("image/png");

		const printWindow = window.open("", "", "width=800,height=600");
		if (printWindow) {
			printWindow.document.write(`
        <html>
          <head>
            <title>Doc Master Print</title>
            <style>
              @page { size: A4; margin: 0; }
              html, body { margin: 0; padding: 0; }
              .page {
                width: 210mm;
                height: 297mm;
                margin: 0;
                page-break-after: avoid;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #ffffff;
              }
              img {
                width: 210mm;
                height: 297mm;
                object-fit: contain;
              }
            </style>
          </head>
          <body>
            <div class="page">
              <img src="${dataUrl}" />
            </div>
          </body>
        </html>
      `);
			printWindow.document.close();
			printWindow.focus();
			setTimeout(() => printWindow.print(), 400);
		}
	};

	const downloadPDF = async () => {
		const canvas = await renderCanvasComposition();
		if (!canvas) return;

		const mime =
			downloadSettings.format === "jpeg" ? "image/jpeg" : "image/png";
		const ext = downloadSettings.format === "jpeg" ? "jpg" : "png";
		const baseName = downloadSettings.filename.trim() || "doc-master";

		// Use high quality for download (quality 0.95 for JPEG, default for PNG)
		const quality = downloadSettings.format === "jpeg" ? 0.95 : undefined;
		const dataUrl =
			quality !== undefined
				? canvas.toDataURL(mime, quality)
				: canvas.toDataURL(mime);

		const link = document.createElement("a");
		link.href = dataUrl;
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
							<div className='text-center lg:text-left space-y-4'>
								<div className='inline-flex items-center gap-2 bg-linear-to-r from-primary/15 to-secondary/15 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-xs font-semibold'>
									<span className='inline-block size-1.5 rounded-full bg-primary' />
									Professional Document Editor
								</div>
								<h1 className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-balance text-foreground tracking-tight'>
									Design, Align & Print{" "}
									<span className='text-primary'>
										Documents
									</span>
								</h1>
								<p className='text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl lg:max-w-3xl text-balance'>
									In-place cropping, background removal and
									precise A4 positioning for professional
									results.
								</p>
							</div>

							<div className='bg-card border border-border rounded-2xl overflow-hidden shadow-lg'>
								<div className='flex items-center justify-center bg-muted p-4'>
									<div
										ref={previewWrapRef}
										className='w-full flex justify-center overflow-hidden'
										style={{
											height: PREVIEW_H * previewScale,
										}}>
										<div
											className='relative bg-white rounded-lg shadow-md overflow-hidden border border-dashed border-muted-foreground/40'
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
														<ImageWithCrop
															side='front'
															src={
																images.front.src
															}
															x={images.front.x}
															y={images.front.y}
															rotation={
																images.front
																	.rotation
															}
															scale={
																images.front
																	.scale
															}
															isSelected={
																selectedImage ===
																"front"
															}
															isCropping={
																croppingImage ===
																"front"
															}
															cropArea={
																cropAreas.front
															}
															onClick={() => {
																setSelectedImage(
																	"front"
																);
																startCrop(
																	"front"
																);
															}}
															onCropClick={() =>
																startCrop(
																	"front"
																)
															}
															onCropSave={() =>
																saveCrop(
																	"front"
																)
															}
															onCropCancel={
																cancelCrop
															}
															onCropAreaChange={(
																area
															) =>
																setCropAreas({
																	...cropAreas,
																	front: area,
																})
															}
															imageRef={(el) => {
																imageRefs.current.front =
																	el ||
																	undefined;
															}}
														/>
													)}
													{images.back && (
														<ImageWithCrop
															side='back'
															src={
																images.back.src
															}
															x={images.back.x}
															y={images.back.y}
															rotation={
																images.back
																	.rotation
															}
															scale={
																images.back
																	.scale
															}
															isSelected={
																selectedImage ===
																"back"
															}
															isCropping={
																croppingImage ===
																"back"
															}
															cropArea={
																cropAreas.back
															}
															onClick={() => {
																setSelectedImage(
																	"back"
																);
																startCrop(
																	"back"
																);
															}}
															onCropClick={() =>
																startCrop(
																	"back"
																)
															}
															onCropSave={() =>
																saveCrop("back")
															}
															onCropCancel={
																cancelCrop
															}
															onCropAreaChange={(
																area
															) =>
																setCropAreas({
																	...cropAreas,
																	back: area,
																})
															}
															imageRef={(el) => {
																imageRefs.current.back =
																	el ||
																	undefined;
															}}
														/>
													)}
												</>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className='flex flex-col gap-4'>
								<div className='flex flex-col sm:flex-row gap-3'>
									<Button
										onClick={handlePrint}
										className='bg-accent hover:bg-accent/90 w-full sm:w-auto shadow-md'>
										<Download className='w-4 h-4 mr-2' />
										Print
									</Button>
									<Button
										onClick={downloadPDF}
										variant='outline'
										className='w-full sm:w-auto bg-transparent shadow-sm'>
										<ArrowRight className='w-4 h-4 mr-2' />
										Download
									</Button>
								</div>

								{/* Download settings */}
								<div className='flex flex-row gap-2 sm:items-center text-xs sm:text-sm text-muted-foreground'>
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
						</div>

						{/* Controls */}
						<div className='space-y-4 lg:space-y-6'>
							{/* Image Selection */}
							<div className='bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-md'>
								<h3 className='font-semibold mb-3 text-foreground'>
									Select Image
								</h3>
								<div className='inline-flex w-full gap-0 rounded-lg border border-border overflow-hidden'>
									{(["front", "back"] as const).map(
										(side) => (
											<button
												key={side}
												onClick={() =>
													setSelectedImage(side)
												}
												className={`flex-1 py-2.5 px-3 font-medium transition-all text-sm sm:text-base ${
													selectedImage === side
														? "bg-primary text-primary-foreground"
														: "bg-background text-foreground hover:bg-muted"
												}`}>
												{side.charAt(0).toUpperCase() +
													side.slice(1)}
											</button>
										)
									)}
								</div>
							</div>

							{/* Upload */}
							<div className='bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-md'>
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
									className='w-full shadow-sm'>
									<Upload className='w-4 h-4 mr-2' />
									Choose Image
								</Button>
							</div>

							{/* Adjustments */}
							{images[selectedImage] && (
								<>
									<div className='bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-5 shadow-md'>
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
											// onClick={onRemoveBackground}
											disabled={bgRemovalLoading}
											className='w-full bg-accent hover:bg-accent/90'>
											<Wand2 className='w-4 h-4 mr-2' />
											{bgRemovalLoading
												? "Removing..."
												: "Remove Background"}
										</Button>
									</div>

									{/* Clear */}
									<Button
										onClick={() => {
											const newImages = { ...images };
											delete newImages[selectedImage];
											setImages(newImages);
											setCropAreas({
												...cropAreas,
												[selectedImage]: undefined,
											});
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
					<div className='grid md:grid-cols-3 gap-6 md:gap-8 mt-12 md:mt-16'>
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
								className='bg-card border border-border rounded-2xl p-6 md:p-8 hover:border-primary/50 transition-colors shadow-md'>
								<div className='bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl'>
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
		</div>
	);
}
