"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Download, Wand2, ArrowRight, Scissors } from "lucide-react";
import ReactCrop, { type PixelCrop, type Crop } from "react-image-crop";

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
	const imgRef = useRef<HTMLImageElement | null>(null);
	const [cropPercent, setCropPercent] = useState<Crop | undefined>(undefined);
	const [completedCrop, setCompletedCrop] = useState<
		{ x: number; y: number; width: number; height: number } | undefined
	>(undefined);

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
			<div className='relative' style={{ width: 'fit-content', maxWidth: '320px' }}>
				{!isCropping && (
					<img
						ref={(el) => {
							imgRef.current = el;
							imageRef(el);
						}}
						src={src || "/placeholder.svg"}
						alt={side}
						className={`max-w-xs h-auto ${borderColor} rounded`}
						style={{ borderWidth: "2px", display: "block" }}
					/>
				)}
				{isCropping && (
					<div className='relative' style={{ width: 'fit-content', maxWidth: '320px' }}>
						<ReactCrop
							crop={cropPercent}
							onChange={(_, percentCrop) => {
								setCropPercent(percentCrop);
								const imgEl = imgRef.current;
								if (!imgEl || !percentCrop) return;
								onCropAreaChange({
									x: Math.round(
										((percentCrop.x ?? 0) / 100) *
											imgEl.width,
									),
									y: Math.round(
										((percentCrop.y ?? 0) / 100) *
											imgEl.height,
									),
									width: Math.round(
										((percentCrop.width ?? 0) / 100) *
											imgEl.width,
									),
									height: Math.round(
										((percentCrop.height ?? 0) / 100) *
											imgEl.height,
									),
								});
							}}
							onComplete={(c) => {
								setCompletedCrop({
									x: Math.round(c.x),
									y: Math.round(c.y),
									width: Math.round(c.width),
									height: Math.round(c.height),
								});
								onCropAreaChange({
									x: Math.round(c.x),
									y: Math.round(c.y),
									width: Math.round(c.width),
									height: Math.round(c.height),
								});
							}}
							keepSelection
							minWidth={40}
							minHeight={40}>
							<img
								ref={(el) => {
									imgRef.current = el;
									imageRef(el);
								}}
								src={src || "/placeholder.svg"}
								alt={side}
								className={`max-w-xs h-auto ${borderColor} rounded`}
								style={{ 
									borderWidth: "2px",
									maxWidth: "320px",
									width: "auto",
									height: "auto",
									display: "block"
								}}
								onLoad={(e) => {
									const el =
										e.currentTarget as HTMLImageElement;
									const w = el.width;
									const h = el.height;
									if (cropArea) {
										setCropPercent({
											unit: "%",
											x: (cropArea.x / w) * 100,
											y: (cropArea.y / h) * 100,
											width: (cropArea.width / w) * 100,
											height: (cropArea.height / h) * 100,
										});
									} else {
										setCropPercent({
											unit: "%",
											x: 5,
											y: 5,
											width: 90,
											height: 90,
										});
									}
								}}
							/>
						</ReactCrop>
						<div className='mt-3 flex gap-2 justify-center'>
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
		"front",
	);
	const [bgRemovalLoading, setBgRemovalLoading] = useState(false);
	const [croppingImage, setCroppingImage] = useState<"front" | "back" | null>(
		null,
	);
	const [cropAreas, setCropAreas] = useState<{
		front?: { x: number; y: number; width: number; height: number };
		back?: { x: number; y: number; width: number; height: number };
	}>({});
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fileInputRefFront = useRef<HTMLInputElement>(null);
	const fileInputRefBack = useRef<HTMLInputElement>(null);
	const previewWrapRef = useRef<HTMLDivElement>(null);
	const [previewScale, setPreviewScale] = useState(1);
	const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
	const imageRefs = useRef<{
		front?: HTMLImageElement;
		back?: HTMLImageElement;
	}>({});
	const [downloadSettings, setDownloadSettings] = useState<DownloadSettings>({
		filename: "doc-master",
		format: "png",
	});

	// A4 dimensions in pixels (at 96 DPI)
	const A4_WIDTH = 716;
	const A4_HEIGHT = 956;

	useEffect(() => {
		const el = previewWrapRef.current;
		if (!el) return;

		const updatePreviewSize = () => {
			// Calculate preview size based on screen width
			const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
			const baseWidth = isDesktop ? A4_WIDTH * 0.7 : A4_WIDTH * 0.4;
			const baseHeight = (baseWidth / A4_WIDTH) * A4_HEIGHT;
			
			setPreviewSize({ width: baseWidth, height: baseHeight });
			
			// Calculate scale to fit preview in container
			const containerWidth = el.clientWidth;
			if (containerWidth > 0) {
				const scale = Math.min(1, containerWidth / baseWidth);
				setPreviewScale(scale);
			}
		};

		updatePreviewSize();
		const ro = new ResizeObserver(updatePreviewSize);
		ro.observe(el);
		
		// Update on window resize for responsive preview size
		if (typeof window !== "undefined") {
			window.addEventListener('resize', updatePreviewSize);
		}
		
		return () => {
			ro.disconnect();
			if (typeof window !== "undefined") {
				window.removeEventListener('resize', updatePreviewSize);
			}
		};
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			const stored = window.localStorage.getItem(
				"doc-master-download-settings",
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
				JSON.stringify(next),
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
			imgState: NonNullable<ImageState["front"]>,
			side: "front" | "back",
		) =>
			new Promise<void>((resolve, reject) => {
				const img = new Image();
				img.onload = () => {
					try {
						ctx.save();

						// Calculate the scale factor from preview to full A4
						const currentPreviewWidth = previewSize.width || (A4_WIDTH * 0.6);
						const scaleFactor = A4_WIDTH / currentPreviewWidth;
						
						// Convert preview coordinates to canvas coordinates
						const canvasX = imgState.x * scaleFactor;
						const extraGap = side === "front" ? 0 : 50;
						const canvasY = (imgState.y * scaleFactor)-extraGap;

						// Get actual displayed size from preview image element
						const previewImg = imageRefs.current[side];
						let displayedWidth = img.width;
						let displayedHeight = img.height;
						
						if (previewImg) {
							// Get the actual rendered dimensions (accounting for preview scale transform)
							const rect = previewImg.getBoundingClientRect();
							// Remove the preview scale transform to get size in preview coordinates
							displayedWidth = rect.width / previewScale;
							displayedHeight = rect.height / previewScale;
						} else {
							// Fallback: calculate based on max-w-xs constraint (320px)
							const maxPreviewWidth = 320;
							if (img.width > maxPreviewWidth) {
								const ratio = maxPreviewWidth / img.width;
								displayedWidth = maxPreviewWidth;
								displayedHeight = img.height * ratio;
							}
						}

						// Scale displayed dimensions to canvas size
						// This is the size BEFORE applying the imgState.scale transform
						const baseCanvasWidth = displayedWidth * scaleFactor;
						const baseCanvasHeight = displayedHeight * scaleFactor;

						// Apply transforms in the same order as CSS: translate, rotate, scale
						ctx.translate(canvasX, canvasY);
						ctx.rotate((imgState.rotation * Math.PI) / 180);
						ctx.scale(imgState.scale, imgState.scale);

						// Draw image at base size (the scale transform is applied via ctx.scale above)
						ctx.drawImage(img, 0, 0, baseCanvasWidth, baseCanvasHeight);

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
			await drawImageOnCanvas(images.front, "front");
		}
		if (images.back) {
			await drawImageOnCanvas(images.back, "back");
		}

		return canvas;
	};

	const handleImageUpload = (side: "front" | "back", e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			const src = event.target?.result as string;
			// Calculate initial position - center horizontally
			const initialPreviewWidth = previewSize.width > 0 ? previewSize.width : A4_WIDTH * 0.6;
			
			// Create a temporary image to get actual dimensions
			const tempImg = new Image();
			tempImg.onload = () => {
				// Image max width is 320px (max-w-xs CSS constraint)
				const imageMaxWidth = 320;
				// Calculate the displayed width (constrained by max-w-xs)
				const naturalWidth = tempImg.width;
				const naturalHeight = tempImg.height;
				const displayedWidth = Math.min(naturalWidth, imageMaxWidth);
				const displayedHeight = (displayedWidth / naturalWidth) * naturalHeight;
				
				// Account for scale transform (0.6) - the visual width after scaling
				// Transform origin is "top left", so the visual width is displayedWidth * scale
				const visualWidth = displayedWidth * 0.6;
				
				// Center horizontally: (previewWidth - visualWidth) / 2
				const centeredX = (initialPreviewWidth - visualWidth) / 2;
				
				setImages({
					...images,
					[side]: {
						src,
						scale: 0.8,
						x: Math.max(0, centeredX-30), // Center horizontally
						y: side === "front" ? 50 : 240, // Preview gap
						rotation: 0,
					},
				});
				setSelectedImage(side);
			};
			tempImg.onerror = () => {
				// Fallback if image fails to load
				const imageMaxWidth = 320;
				const visualWidth = imageMaxWidth * 0.6;
				const centeredX = (initialPreviewWidth - visualWidth) / 2;
				setImages({
					...images,
					[side]: {
						src,
						scale: 0.6,
						x: Math.max(0, centeredX),
						y: side === "front" ? 40 : 180,
						rotation: 0,
					},
				});
				setSelectedImage(side);
			};
			tempImg.src = src;
		};
		reader.readAsDataURL(file);
	};

	const handleDeleteImage = (side: "front" | "back") => {
		const newImages = { ...images };
		delete newImages[side];
		setImages(newImages);
		setCropAreas({
			...cropAreas,
			[side]: undefined,
		});
		// If deleted image was selected, select the other one or front
		if (selectedImage === side) {
			const otherSide = side === "front" ? "back" : "front";
			setSelectedImage(images[otherSide] ? otherSide : "front");
		}
	};

	const updateImage = (updates: Partial<ImageState[keyof ImageState]>) => {
		if (images[selectedImage]) {
			setImages({
				...images,
				[selectedImage]: { ...images[selectedImage]!, ...updates },
			});
		}
	};

	const onRemoveBackground = async () => {
		if (!images[selectedImage]) return;
		setBgRemovalLoading(true);
		try {
			const response = await fetch("/api/remove-bg", {
				method: "POST",
				body: JSON.stringify({ image: images[selectedImage]?.src }),
				headers: {
					"Content-Type": "application/json",
				},
			});
			const data = await response.json();
			if (data.data) {
				updateImage({ src: data.data });
			}
		} catch (error) {
			console.error("Background removal failed:", error);
		}
		setBgRemovalLoading(false);
	};

	const startCrop = (side: "front" | "back") => {
		setCroppingImage(side);
		const img = imageRefs.current[side];
		if (img && !cropAreas[side]) {
			// Initialize crop area to cover full displayed image
			// Get the actual displayed size (accounting for CSS constraints and scale)
			const rect = img.getBoundingClientRect();
			// Use the image's natural displayed dimensions
			const displayedWidth = Math.min(img.naturalWidth, 320); // max-w-xs constraint
			const displayedHeight = (displayedWidth / img.naturalWidth) * img.naturalHeight;
			setCropAreas({
				...cropAreas,
				[side]: { x: 0, y: 0, width: displayedWidth, height: displayedHeight },
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
			naturalCrop.height,
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

							<div className='bg-card border border-border rounded-xl overflow-hidden shadow-lg'>
								<div className='flex items-center justify-center bg-muted p-4'>
									<div
										ref={previewWrapRef}
										className='w-full flex justify-center overflow-hidden'
										style={{
											height: previewSize.height > 0 ? previewSize.height * previewScale : 'auto',
										}}>
										<div
											className='relative bg-white rounded-lg shadow-md overflow-hidden border border-dashed border-muted-foreground/40'
											style={{
												width: previewSize.width > 0 ? previewSize.width : A4_WIDTH * 0.6,
												height: previewSize.height > 0 ? previewSize.height : (A4_WIDTH * 0.6 / A4_WIDTH) * A4_HEIGHT,
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
																	"front",
																);
															}}
															onCropClick={() =>
																startCrop(
																	"front",
																)
															}
															onCropSave={() =>
																saveCrop(
																	"front",
																)
															}
															onCropCancel={
																cancelCrop
															}
															onCropAreaChange={(
																area,
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
																	"back",
																);
															}}
															onCropClick={() =>
																startCrop(
																	"back",
																)
															}
															onCropSave={() =>
																saveCrop("back")
															}
															onCropCancel={
																cancelCrop
															}
															onCropAreaChange={(
																area,
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
										className='bg-linear-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-white font-semibold w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-200'>
										<Download className='w-4 h-4 mr-2' />
										Print
									</Button>
									<Button
										onClick={downloadPDF}
										className='w-full sm:w-auto bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200'>
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
							{/* Front Image Upload */}
							<div className='bg-card border border-border rounded-xl p-4 sm:p-6 shadow-md'>
								<h3 className='font-semibold mb-4 text-foreground text-sm sm:text-base'>
									Front Image
								</h3>
								{!images.front ? (
									<>
										<input
											ref={fileInputRefFront}
											type='file'
											accept='image/*'
											onChange={(e) => handleImageUpload("front", e)}
											className='hidden'
										/>
										<Button
											onClick={() =>
												fileInputRefFront.current?.click()
											}
											variant='outline'
											className='w-full shadow-sm hover:text-gray-500 hover:bg-primary/5 hover:border-primary/50 transition-all'>
											<Upload className='w-4 h-4 mr-2' />
											Upload Front
										</Button>
									</>
								) : (
									<div className='relative group'>
										<div
											onClick={() => setSelectedImage("front")}
											className={`relative overflow-hidden rounded-lg border-2 cursor-pointer transition-all ${
												selectedImage === "front"
													? "border-primary ring-2 ring-primary/20"
													: "border-border hover:border-primary/50"
											}`}>
											<img
												src={images.front.src}
												alt='Front'
												className='w-full h-auto max-h-48 object-contain'
											/>
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleDeleteImage("front");
												}}
												className='absolute top-2 cursor-pointer right-2 bg-destructive text-white rounded-full p-1.5 shadow-lg hover:bg-destructive/90 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100'>
												<Trash2 className='w-4 h-4 text-white' />
											</button>
										</div>
										{selectedImage === "front" && (
											<div className='mt-2 text-xs text-center text-primary font-medium'>
												Selected
											</div>
										)}
									</div>
								)}
							</div>

							{/* Back Image Upload */}
							<div className='bg-card border border-border rounded-xl p-4 sm:p-6 shadow-md'>
								<h3 className='font-semibold mb-4 text-foreground text-sm sm:text-base'>
									Back Image
								</h3>
								{!images.back ? (
									<>
										<input
											ref={fileInputRefBack}
											type='file'
											accept='image/*'
											onChange={(e) => handleImageUpload("back", e)}
											className='hidden'
										/>
										<Button
											onClick={() =>
												fileInputRefBack.current?.click()
											}
											variant='outline'
											className='w-full shadow-sm hover:text-gray-500 hover:bg-primary/5 hover:border-primary/50 transition-all'>
											<Upload className='w-4 h-4 mr-2' />
											Upload Back
										</Button>
									</>
								) : (
									<div className='relative group'>
										<div
											onClick={() => setSelectedImage("back")}
											className={`relative overflow-hidden rounded-lg border-2 cursor-pointer transition-all ${
												selectedImage === "back"
													? "border-primary ring-2 ring-primary/20"
													: "border-border hover:border-primary/50"
											}`}>
											<img
												src={images.back.src}
												alt='Back'
												className='w-full h-auto max-h-48 object-contain'
											/>
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleDeleteImage("back");
												}}
												className='absolute top-2 cursor-pointer right-2 bg-destructive text-white rounded-full p-1.5 shadow-lg hover:bg-destructive/90 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100'>
												<Trash2 className='w-4 h-4 text-white' />
											</button>
										</div>
										{selectedImage === "back" && (
											<div className='mt-2 text-xs text-center text-primary font-medium'>
												Selected
											</div>
										)}
									</div>
								)}
							</div>

							{/* Adjustments */}
							{images[selectedImage] && (
								<>
								{/* Tools */}
								<div className='bg-card border border-border rounded-xl p-4 sm:p-6 space-y-3'>
										<h3 className='font-semibold text-foreground mb-4 text-sm sm:text-base'>
											Tools
										</h3>
										<div className='flex flex-col gap-3'>
											<Button
												onClick={() => startCrop(selectedImage)}
												disabled={croppingImage === selectedImage}
												className='w-full bg-linear-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
												<Scissors className='w-4 h-4 mr-2' />
												{croppingImage === selectedImage ? "Cropping..." : "Crop Image"}
											</Button>
											<Button
												onClick={onRemoveBackground}
												disabled={bgRemovalLoading}
												className='w-full bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
												<Wand2 className={`w-4 h-4 mr-2 ${bgRemovalLoading ? 'animate-spin' : ''}`} />
												{bgRemovalLoading
													? "Removing Background..."
													: "Remove Background"}
											</Button>
										</div>
									</div>
									<div className='bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-5 shadow-md'>
										<h3 className='font-semibold text-foreground text-sm sm:text-base'>
											Image Controls
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
															e.target.value,
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
																e.target.value,
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
															e.target.value,
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
															e.target.value,
														),
													})
												}
												className='w-full'
											/>
										</div>
									</div>
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
