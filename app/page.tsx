"use client";

import type React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Download, Wand2 } from "lucide-react";
import { removeBackground } from "@imgly/background-removal";
import { TransformableImage } from "@/components/TransformableImage";
import "react-image-crop/dist/ReactCrop.css";

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

// On-image controls component

export default function Home() {
	const [images, setImages] = useState<ImageState>({});
	const [selectedImage, setSelectedImage] = useState<"front" | "back">(
		"front"
	);
	const [bgRemovalLoading, setBgRemovalLoading] = useState(false);
	const [autoRemoveBg, setAutoRemoveBg] = useState(true);
	const [croppingImage, setCroppingImage] = useState<"front" | "back" | null>(
		null
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

	const A4_WIDTH = 716;
	const A4_HEIGHT = 956;

	useEffect(() => {
		const el = previewWrapRef.current;
		if (!el) return;

		const updatePreviewSize = () => {
			const isDesktop =
				typeof window !== "undefined" && window.innerWidth >= 768;
			const baseWidth = isDesktop ? A4_WIDTH * 0.55 : A4_WIDTH * 0.4;
			const baseHeight = (baseWidth / A4_WIDTH) * A4_HEIGHT;

			setPreviewSize({ width: baseWidth, height: baseHeight });

			const containerWidth = el.clientWidth;
			if (containerWidth > 0) {
				const scale = Math.min(1, containerWidth / baseWidth);
				setPreviewScale(scale);
			}
		};

		updatePreviewSize();
		const ro = new ResizeObserver(updatePreviewSize);
		ro.observe(el);

		if (typeof window !== "undefined") {
			window.addEventListener("resize", updatePreviewSize);
		}

		return () => {
			ro.disconnect();
			if (typeof window !== "undefined") {
				window.removeEventListener("resize", updatePreviewSize);
			}
		};
	}, []);

	const updateImage = useCallback(
		(updates: Partial<ImageState[keyof ImageState]>) => {
			if (images[selectedImage]) {
				setImages((prev) => ({
					...prev,
					[selectedImage]: { ...prev[selectedImage]!, ...updates },
				}));
			}
		},
		[images, selectedImage]
	);

	const renderCanvasComposition = useCallback(async () => {
		const canvas = canvasRef.current;
		if (!canvas) return null;

		const dpr = window.devicePixelRatio || 2;
		canvas.width = A4_WIDTH * dpr;
		canvas.height = A4_HEIGHT * dpr;

		const ctx = canvas.getContext("2d", {
			alpha: false,
			desynchronized: true,
		});
		if (!ctx) return null;

		ctx.scale(dpr, dpr);
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT);

		const drawImageOnCanvas = (
			imgState: NonNullable<ImageState["front"]>,
			side: "front" | "back"
		) =>
			new Promise<void>((resolve, reject) => {
				const img = new Image();
				img.onload = () => {
					try {
						ctx.save();
						const currentPreviewWidth =
							previewSize.width || A4_WIDTH * 0.55;
						const scaleFactor = A4_WIDTH / currentPreviewWidth;
						const canvasX = imgState.x * scaleFactor;
						const extraGap = side === "front" ? 0 : 50;
						const canvasY = imgState.y * scaleFactor - extraGap;

						const previewImg = imageRefs.current[side];
						let displayedWidth = img.width;
						let displayedHeight = img.height;

						if (previewImg) {
							const rect = previewImg.getBoundingClientRect();
							displayedWidth = rect.width / previewScale;
							displayedHeight = rect.height / previewScale;
						} else {
							const maxPreviewWidth = 280;
							if (img.width > maxPreviewWidth) {
								const ratio = maxPreviewWidth / img.width;
								displayedWidth = maxPreviewWidth;
								displayedHeight = img.height * ratio;
							}
						}

						const baseCanvasWidth = displayedWidth * scaleFactor;
						const baseCanvasHeight = displayedHeight * scaleFactor;

						// With center-center transform, translate to center point
						ctx.translate(canvasX, canvasY);
						ctx.rotate((imgState.rotation * Math.PI) / 180);
						ctx.scale(imgState.scale, imgState.scale);
						// Draw from center (offset by half width/height)
						ctx.drawImage(
							img,
							-baseCanvasWidth / 2,
							-baseCanvasHeight / 2,
							baseCanvasWidth,
							baseCanvasHeight
						);
						ctx.restore();
						resolve();
					} catch (e) {
						reject(e);
					}
				};
				img.onerror = reject;
				img.src = imgState.src;
			});

		if (images.front) await drawImageOnCanvas(images.front, "front");
		if (images.back) await drawImageOnCanvas(images.back, "back");

		return canvas;
	}, [images, previewSize, previewScale]);

	const handleImageUpload = useCallback(
		async (
			side: "front" | "back",
			e: React.ChangeEvent<HTMLInputElement>
		) => {
			const file = e.target.files?.[0];
			if (!file) return;

			if (file.size > 5 * 1024 * 1024) {
				console.warn("Large file detected, processing may take longer");
			}

			const reader = new FileReader();
			reader.onload = async (event) => {
				let src = event.target?.result as string;
				const initialPreviewWidth =
					previewSize.width > 0 ? previewSize.width : A4_WIDTH * 0.55;

				const tempImg = new Image();
				tempImg.onload = async () => {
					const imageMaxWidth = 280;
					const naturalWidth = tempImg.width;
					const naturalHeight = tempImg.height;
					const displayedWidth = Math.min(
						naturalWidth,
						imageMaxWidth
					);
					const displayedHeight =
						(displayedWidth / naturalWidth) * naturalHeight;

					// With center-center transform origin, position is the center point
					// Images are scaled to 0.8, so account for that in positioning
					const scaledHeight = displayedHeight * 0.8;

					// Calculate center X: preview center (horizontal center)
					const centerX = initialPreviewWidth / 2;

					// Calculate center Y:
					// Front: Half of scaled height + top padding
					// Back: Front position + scaled height + gap
					const topPadding = 40;
					const gapBetweenImages = 30;

					const centerY =
						side === "front"
							? scaledHeight / 2 + topPadding
							: scaledHeight / 2 +
							  topPadding +
							  scaledHeight +
							  gapBetweenImages;

					setImages((prev) => ({
						...prev,
						[side]: {
							src,
							scale: 0.8,
							x: centerX,
							y: centerY,
							rotation: 0,
						},
					}));
					setSelectedImage(side);

					if (autoRemoveBg) {
						setBgRemovalLoading(true);
						try {
							const blob = await removeBackground(file, {
								model: "isnet_quint8",
								output: {
									format: "image/png",
									quality: 0.8,
								},
							});

							// Auto-crop transparent areas
							const croppedBlob = await autoCropTransparentImage(
								blob
							);

							const processedSrc = await new Promise<string>(
								(resolve, reject) => {
									const bgReader = new FileReader();
									bgReader.onloadend = () => {
										if (
											bgReader.result &&
											typeof bgReader.result === "string"
										) {
											resolve(bgReader.result);
										} else {
											reject(
												new Error(
													"Failed to read processed image"
												)
											);
										}
									};
									bgReader.onerror = reject;
									bgReader.readAsDataURL(croppedBlob);
								}
							);

							setImages((prev) => ({
								...prev,
								[side]: {
									...prev[side]!,
									src: processedSrc,
								},
							}));
						} catch (error) {
							console.error(
								"Auto background removal failed:",
								error
							);
						} finally {
							setBgRemovalLoading(false);
						}
					}
				};
				tempImg.onerror = () => {
					const imageMaxWidth = 280;
					const estimatedHeight = 200; // Fallback estimated height
					const scaledHeight = estimatedHeight * 0.8;

					// With center-center, use center point
					const centerX = initialPreviewWidth / 2;
					const topPadding = 40;
					const gapBetweenImages = 30;
					const centerY =
						side === "front"
							? scaledHeight / 2 + topPadding
							: scaledHeight / 2 +
							  topPadding +
							  scaledHeight +
							  gapBetweenImages;

					setImages((prev) => ({
						...prev,
						[side]: {
							src,
							scale: 0.8,
							x: centerX,
							y: centerY,
							rotation: 0,
						},
					}));
					setSelectedImage(side);
				};
				tempImg.src = src;
			};
			reader.readAsDataURL(file);
		},
		[autoRemoveBg, previewSize]
	);

	const handleDeleteImage = (side: "front" | "back") => {
		const newImages = { ...images };
		delete newImages[side];
		setImages(newImages);
		setCropAreas({
			...cropAreas,
			[side]: undefined,
		});
		if (selectedImage === side) {
			const otherSide = side === "front" ? "back" : "front";
			setSelectedImage(images[otherSide] ? otherSide : "front");
		}
	};

	const onRemoveBackground = async () => {
		if (!images[selectedImage]) return;
		setBgRemovalLoading(true);
		try {
			const imageSrc = images[selectedImage]?.src;
			if (!imageSrc) {
				setBgRemovalLoading(false);
				return;
			}

			let imageBlob: Blob;
			if (imageSrc.startsWith("data:")) {
				const response = await fetch(imageSrc);
				imageBlob = await response.blob();
			} else {
				const response = await fetch(imageSrc);
				imageBlob = await response.blob();
			}

			const blob = await removeBackground(imageBlob, {
				model: "isnet_quint8",
				output: {
					format: "image/png",
				},
			});

			// Auto-crop transparent areas
			const croppedBlob = await autoCropTransparentImage(blob);

			const base64data = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onloadend = () => {
					if (reader.result && typeof reader.result === "string") {
						resolve(reader.result);
					} else {
						reject(new Error("Failed to read blob as data URL"));
					}
				};
				reader.onerror = () => {
					reject(new Error("Failed to convert blob to data URL"));
				};
				reader.readAsDataURL(croppedBlob);
			});

			updateImage({ src: base64data });
		} catch (error) {
			console.error("Background removal failed:", error);
		} finally {
			setBgRemovalLoading(false);
		}
	};

	// Auto-crop transparent areas from image
	const autoCropTransparentImage = async (blob: Blob): Promise<Blob> => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			const url = URL.createObjectURL(blob);

			img.onload = () => {
				try {
					// Create canvas to analyze the image
					const canvas = document.createElement("canvas");
					canvas.width = img.width;
					canvas.height = img.height;
					const ctx = canvas.getContext("2d", {
						willReadFrequently: true,
					});

					if (!ctx) {
						URL.revokeObjectURL(url);
						resolve(blob); // Return original if can't process
						return;
					}

					ctx.drawImage(img, 0, 0);
					const imageData = ctx.getImageData(
						0,
						0,
						img.width,
						img.height
					);
					const data = imageData.data;

					// Find content boundaries
					let minX = img.width;
					let minY = img.height;
					let maxX = 0;
					let maxY = 0;

					// Scan for non-transparent pixels
					for (let y = 0; y < img.height; y++) {
						for (let x = 0; x < img.width; x++) {
							const alpha = data[(y * img.width + x) * 4 + 3];
							if (alpha > 10) {
								// Consider pixels with alpha > 10 as content
								if (x < minX) minX = x;
								if (x > maxX) maxX = x;
								if (y < minY) minY = y;
								if (y > maxY) maxY = y;
							}
						}
					}

					// Add small padding (5% of content size)
					const contentWidth = maxX - minX;
					const contentHeight = maxY - minY;
					const paddingX = Math.max(
						5,
						Math.floor(contentWidth * 0.02)
					);
					const paddingY = Math.max(
						5,
						Math.floor(contentHeight * 0.02)
					);

					minX = Math.max(0, minX - paddingX);
					minY = Math.max(0, minY - paddingY);
					maxX = Math.min(img.width - 1, maxX + paddingX);
					maxY = Math.min(img.height - 1, maxY + paddingY);

					const cropWidth = maxX - minX + 1;
					const cropHeight = maxY - minY + 1;

					// Create cropped canvas
					const croppedCanvas = document.createElement("canvas");
					croppedCanvas.width = cropWidth;
					croppedCanvas.height = cropHeight;
					const croppedCtx = croppedCanvas.getContext("2d");

					if (!croppedCtx) {
						URL.revokeObjectURL(url);
						resolve(blob);
						return;
					}

					// Draw cropped content
					croppedCtx.drawImage(
						img,
						minX,
						minY,
						cropWidth,
						cropHeight,
						0,
						0,
						cropWidth,
						cropHeight
					);

					// Convert to blob
					croppedCanvas.toBlob(
						(croppedBlob) => {
							URL.revokeObjectURL(url);
							if (croppedBlob) {
								resolve(croppedBlob);
							} else {
								resolve(blob); // Return original on error
							}
						},
						"image/png",
						1.0
					);
				} catch (error) {
					URL.revokeObjectURL(url);
					console.error("Auto-crop failed:", error);
					resolve(blob); // Return original on error
				}
			};

			img.onerror = () => {
				URL.revokeObjectURL(url);
				reject(new Error("Failed to load image for auto-crop"));
			};

			img.src = url;
		});
	};

	const handleUpdateTransform = (
		side: "front" | "back",
		updates: {
			x?: number;
			y?: number;
			scale?: number;
			rotation?: number;
		}
	) => {
		if (images[side]) {
			setImages((prev) => ({
				...prev,
				[side]: { ...prev[side]!, ...updates },
			}));
		}
	};

	const startCrop = (side: "front" | "back") => {
		setCroppingImage(side);
		const img = imageRefs.current[side];
		if (img && !cropAreas[side]) {
			const displayedWidth = Math.min(img.naturalWidth, 280);
			const displayedHeight =
				(displayedWidth / img.naturalWidth) * img.naturalHeight;
			setCropAreas({
				...cropAreas,
				[side]: {
					x: 0,
					y: 0,
					width: displayedWidth,
					height: displayedHeight,
				},
			});
		}
	};

	const saveCrop = (side: "front" | "back") => {
		const img = imageRefs.current[side];
		const crop = cropAreas[side];
		if (!img || !crop || !images[side]) return;

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
		const quality = downloadSettings.format === "jpeg" ? 0.95 : undefined;
		const dataUrl =
			quality !== undefined
				? canvas.toDataURL(mime, quality)
				: canvas.toDataURL(mime);

		const link = document.createElement("a");
		link.href = dataUrl;
		link.download = `${baseName}.${ext}`;
		link.click();
	};

	return (
		<div className='min-h-[calc(100vh-124px)] bg-background mt-18 flex flex-col'>
			<main className='flex-1 pb-6 px-3 md:px-4 pt-4 max-w-7xl mx-auto w-full'>
				<div className='grid lg:grid-cols-[1fr_300px] gap-4'>
					{/* Preview */}
					<div className='space-y-3'>
						{/* Header with toggle */}
						<div className='flex items-center justify-between gap-4'>
							<div>
								<h1 className='text-2xl md:text-3xl font-bold text-foreground'>
									Doc Master
								</h1>
								<p className='text-xs text-muted-foreground'>
									Professional document editor
								</p>
							</div>
							<div className='flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2'>
								<span className='text-xs font-medium whitespace-nowrap'>
									Auto Remove BG
								</span>
								<button
									onClick={() =>
										setAutoRemoveBg(!autoRemoveBg)
									}
									className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
										autoRemoveBg
											? "bg-primary"
											: "bg-gray-300"
									}`}
									role='switch'
									aria-checked={autoRemoveBg}>
									<span
										className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
											autoRemoveBg
												? "translate-x-5"
												: "translate-x-1"
										}`}
									/>
								</button>
							</div>
						</div>

						{/* Preview Canvas */}
						<div className='bg-card border border-border rounded-lg overflow-hidden'>
							<div className='flex items-center justify-center bg-muted p-3'>
								<div
									ref={previewWrapRef}
									className='w-full flex justify-center overflow-hidden'
									style={{
										height:
											previewSize.height > 0
												? previewSize.height *
												  previewScale
												: "auto",
									}}>
									<div
										className='relative bg-white rounded shadow-md overflow-hidden border border-dashed border-muted-foreground/30'
										style={{
											width:
												previewSize.width > 0
													? previewSize.width
													: A4_WIDTH * 0.55,
											height:
												previewSize.height > 0
													? previewSize.height
													: ((A4_WIDTH * 0.55) /
															A4_WIDTH) *
													  A4_HEIGHT,
											transform: `scale(${previewScale})`,
											transformOrigin: "top left",
										}}>
										<canvas
											ref={canvasRef}
											width={A4_WIDTH}
											height={A4_HEIGHT}
											className='hidden'
										/>

										{!images.front && !images.back ? (
											<div className='w-full h-full flex items-center justify-center text-muted-foreground text-center px-4'>
												<div>
													<p className='text-sm font-semibold mb-1'>
														Upload Documents
													</p>
													<p className='text-xs'>
														Upload front & back
														images
													</p>
												</div>
											</div>
										) : (
											<>
												{images.front && (
													<TransformableImage
														side='front'
														src={images.front.src}
														x={images.front.x}
														y={images.front.y}
														rotation={
															images.front
																.rotation
														}
														scale={
															images.front.scale
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
														}}
														onCropClick={() =>
															startCrop("front")
														}
														onCropSave={() =>
															saveCrop("front")
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
														onUpdateTransform={(
															updates
														) =>
															handleUpdateTransform(
																"front",
																updates
															)
														}
														onDelete={() =>
															handleDeleteImage(
																"front"
															)
														}
														imageRef={(el) => {
															imageRefs.current.front =
																el || undefined;
														}}
													/>
												)}
												{images.back && (
													<TransformableImage
														side='back'
														src={images.back.src}
														x={images.back.x}
														y={images.back.y}
														rotation={
															images.back.rotation
														}
														scale={
															images.back.scale
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
														}}
														onCropClick={() =>
															startCrop("back")
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
														onUpdateTransform={(
															updates
														) =>
															handleUpdateTransform(
																"back",
																updates
															)
														}
														onDelete={() =>
															handleDeleteImage(
																"back"
															)
														}
														imageRef={(el) => {
															imageRefs.current.back =
																el || undefined;
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
						<div className='flex flex-col sm:flex-row gap-2'>
							<Button
								onClick={handlePrint}
								className='flex-1'
								variant='outline'>
								<Download className='w-4 h-4 mr-2' />
								Print
							</Button>
							<Button onClick={downloadPDF} className='flex-1'>
								<Download className='w-4 h-4 mr-2' />
								Download
							</Button>
						</div>

						{/* Download settings */}
						<div className='flex gap-2 text-xs'>
							<input
								value={downloadSettings.filename}
								onChange={(e) =>
									setDownloadSettings({
										...downloadSettings,
										filename: e.target.value,
									})
								}
								placeholder='Filename'
								className='flex-1 rounded border border-border bg-background px-2 py-1.5 text-xs'
							/>
							<select
								value={downloadSettings.format}
								onChange={(e) =>
									setDownloadSettings({
										...downloadSettings,
										format: e.target
											.value as DownloadSettings["format"],
									})
								}
								className='rounded border border-border bg-background px-2 py-1.5 text-xs'>
								<option value='png'>PNG</option>
								<option value='jpeg'>JPEG</option>
							</select>
						</div>
					</div>

					{/* Controls */}
					<div className='space-y-3'>
						{/* Upload Cards */}
						<div className='bg-card border border-border rounded-lg p-3'>
							<h3 className='font-semibold mb-2 text-sm'>
								Front Image
							</h3>
							{!images.front ? (
								<>
									<input
										ref={fileInputRefFront}
										type='file'
										accept='image/*'
										onChange={(e) =>
											handleImageUpload("front", e)
										}
										className='hidden'
									/>
									<Button
										onClick={() =>
											fileInputRefFront.current?.click()
										}
										variant='outline'
										size='sm'
										className='w-full'>
										<Upload className='w-3.5 h-3.5 mr-2' />
										Upload
									</Button>
								</>
							) : (
								<div
									onClick={() => setSelectedImage("front")}
									className={`relative rounded border-2 cursor-pointer transition-all ${
										selectedImage === "front"
											? "border-primary ring-2 ring-primary/20"
											: "border-border"
									}`}>
									<img
										src={images.front.src}
										alt='Front'
										className='w-full h-auto max-h-32 object-contain rounded'
									/>
								</div>
							)}
						</div>

						<div className='bg-card border border-border rounded-lg p-3'>
							<h3 className='font-semibold mb-2 text-sm'>
								Back Image
							</h3>
							{!images.back ? (
								<>
									<input
										ref={fileInputRefBack}
										type='file'
										accept='image/*'
										onChange={(e) =>
											handleImageUpload("back", e)
										}
										className='hidden'
									/>
									<Button
										onClick={() =>
											fileInputRefBack.current?.click()
										}
										variant='outline'
										size='sm'
										className='w-full'>
										<Upload className='w-3.5 h-3.5 mr-2' />
										Upload
									</Button>
								</>
							) : (
								<div
									onClick={() => setSelectedImage("back")}
									className={`relative rounded border-2 cursor-pointer transition-all ${
										selectedImage === "back"
											? "border-primary ring-2 ring-primary/20"
											: "border-border"
									}`}>
									<img
										src={images.back.src}
										alt='Back'
										className='w-full h-auto max-h-32 object-contain rounded'
									/>
								</div>
							)}
						</div>

						{/* Tools */}
						{images[selectedImage] && (
							<div className='bg-card border border-border rounded-lg p-3'>
								<h3 className='font-semibold mb-2 text-sm'>
									Tools
								</h3>
								<Button
									onClick={onRemoveBackground}
									disabled={bgRemovalLoading}
									size='sm'
									className='w-full'>
									<Wand2
										className={`w-3.5 h-3.5 mr-2 ${
											bgRemovalLoading
												? "animate-spin"
												: ""
										}`}
									/>
									{bgRemovalLoading
										? "Processing..."
										: "Remove BG"}
								</Button>
								<p className='text-xs text-muted-foreground mt-2'>
									💡 Drag corners to resize • Drag bottom
									handle to rotate
								</p>
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
