"use client";

import React, { useRef, useState, useEffect } from "react";
import { Scissors, Trash2, RotateCw } from "lucide-react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface TransformableImageProps {
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
	onUpdateTransform: (updates: {
		x?: number;
		y?: number;
		scale?: number;
		rotation?: number;
	}) => void;
	onDelete: () => void;
	imageRef: (el: HTMLImageElement | null) => void;
}

export function TransformableImage({
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
	onUpdateTransform,
	onDelete,
	imageRef,
}: TransformableImageProps) {
	const imgRef = useRef<HTMLImageElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [cropPercent, setCropPercent] = useState<Crop | undefined>(undefined);
	const [isDragging, setIsDragging] = useState(false);
	const [isRotating, setIsRotating] = useState(false);
	const [isResizing, setIsResizing] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [initialScale, setInitialScale] = useState(1);
	const [centerPoint, setCenterPoint] = useState({ x: 0, y: 0 });
	const [initialAngle, setInitialAngle] = useState(0);
	const [startRotation, setStartRotation] = useState(0);

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

	// Global mouse event handlers for smooth transformations
	useEffect(() => {
		const handleGlobalMouseMove = (e: MouseEvent) => {
			if (isDragging) {
				const newX = e.clientX - dragStart.x;
				const newY = e.clientY - dragStart.y;
				onUpdateTransform({ x: newX, y: newY });
			} else if (isRotating) {
				// Calculate rotation angle smoothly
				const dx = e.clientX - centerPoint.x;
				const dy = e.clientY - centerPoint.y;
				const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);

				// Calculate the angle difference from initial
				let angleDiff = currentAngle - initialAngle;

				// Normalize angle difference to -180 to 180 range
				while (angleDiff > 180) angleDiff -= 360;
				while (angleDiff < -180) angleDiff += 360;

				// Apply the rotation relative to start rotation
				const newRotation = startRotation + angleDiff;
				onUpdateTransform({ rotation: Math.round(newRotation) });
			} else if (isResizing) {
				// Calculate scale based on distance from center
				const dx = e.clientX - centerPoint.x;
				const dy = e.clientY - centerPoint.y;
				const distance = Math.sqrt(dx * dx + dy * dy);
				const initialDistance = Math.sqrt(
					Math.pow(dragStart.x - centerPoint.x, 2) +
						Math.pow(dragStart.y - centerPoint.y, 2)
				);
				if (initialDistance > 0) {
					const scaleChange = distance / initialDistance;
					const newScale = Math.max(
						0.3,
						Math.min(3, initialScale * scaleChange)
					);
					onUpdateTransform({ scale: newScale });
				}
			}
		};

		const handleGlobalMouseUp = () => {
			setIsDragging(false);
			setIsRotating(false);
			setIsResizing(false);
		};

		if (isDragging || isRotating || isResizing) {
			document.addEventListener("mousemove", handleGlobalMouseMove);
			document.addEventListener("mouseup", handleGlobalMouseUp);
		}

		return () => {
			document.removeEventListener("mousemove", handleGlobalMouseMove);
			document.removeEventListener("mouseup", handleGlobalMouseUp);
		};
	}, [
		isDragging,
		isRotating,
		isResizing,
		dragStart,
		centerPoint,
		initialScale,
		onUpdateTransform,
	]);

	const borderColor =
		side === "front" ? "border-primary" : "border-secondary";
	const ringColor = side === "front" ? "ring-primary" : "ring-secondary";

	// Calculate center point for rotation
	const getImageCenter = () => {
		if (!imgRef.current) return { x: 0, y: 0 };
		const rect = imgRef.current.getBoundingClientRect();
		return {
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2,
		};
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		if (isCropping || !isSelected) return;
		e.stopPropagation();
		setIsDragging(true);
		setDragStart({ x: e.clientX - x, y: e.clientY - y });
	};

	const handleStartRotate = (e: React.MouseEvent) => {
		if (!imgRef.current) return;
		e.stopPropagation();
		e.preventDefault();

		// Use image center for rotation
		const center = getImageCenter();
		setCenterPoint(center);

		// Store the current rotation at start
		setStartRotation(rotation);

		// Calculate initial angle from center to mouse position
		const dx = e.clientX - center.x;
		const dy = e.clientY - center.y;
		const mouseAngle = Math.atan2(dy, dx) * (180 / Math.PI);
		setInitialAngle(mouseAngle);
		setIsRotating(true);
	};

	const handleStartResize = (e: React.MouseEvent, corner: string) => {
		if (!imgRef.current) return;
		e.stopPropagation();
		e.preventDefault();

		// Use image center for scaling
		const center = getImageCenter();
		setCenterPoint(center);
		setDragStart({ x: e.clientX, y: e.clientY });
		setInitialScale(scale);
		setIsResizing(true);
	};

	const handleSize = 10;
	const rotateHandleOffset = 30; // Positive value for bottom

	return (
		<div
			ref={containerRef}
			className={`absolute group ${
				isSelected ? `ring-2 ${ringColor}` : ""
			} ${isCropping ? "z-10" : ""}`}
			style={{
				left: 0,
				top: 0,
				// When cropping, don't apply rotation to container (keep crop box fixed)
				transform: isCropping
					? `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`
					: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
				cursor: isDragging
					? "grabbing"
					: isSelected && !isCropping
					? "move"
					: "pointer",
			}}
			onClick={() => {
				if (!isCropping) {
					onClick();
				}
			}}
			onMouseDown={handleMouseDown}>
			<div
				className='relative'
				style={{ width: "fit-content", maxWidth: "280px" }}>
				{!isCropping && (
					<>
						<img
							ref={(el) => {
								imgRef.current = el;
								imageRef(el);
							}}
							src={src || "/placeholder.svg"}
							alt={side}
							className={`max-w-[280px] h-auto ${borderColor} rounded select-none`}
							style={{
								borderWidth: "2px",
								display: "block",
								pointerEvents: "none",
							}}
							draggable={false}
						/>
						{isSelected && imgRef.current && (
							<>
								{/* Corner resize handles */}
								<div
									className='absolute bg-white border-2 border-primary rounded-sm cursor-nwse-resize hover:scale-125 transition-transform z-30'
									style={{
										width: handleSize,
										height: handleSize,
										left: -handleSize / 2,
										top: -handleSize / 2,
									}}
									onMouseDown={(e) =>
										handleStartResize(e, "nw")
									}
								/>
								<div
									className='absolute bg-white border-2 border-primary rounded-sm cursor-nesw-resize hover:scale-125 transition-transform z-30'
									style={{
										width: handleSize,
										height: handleSize,
										right: -handleSize / 2,
										top: -handleSize / 2,
									}}
									onMouseDown={(e) =>
										handleStartResize(e, "ne")
									}
								/>
								<div
									className='absolute bg-white border-2 border-primary rounded-sm cursor-nesw-resize hover:scale-125 transition-transform z-30'
									style={{
										width: handleSize,
										height: handleSize,
										left: -handleSize / 2,
										bottom: -handleSize / 2,
									}}
									onMouseDown={(e) =>
										handleStartResize(e, "sw")
									}
								/>
								<div
									className='absolute bg-white border-2 border-primary rounded-sm cursor-nwse-resize hover:scale-125 transition-transform z-30'
									style={{
										width: handleSize,
										height: handleSize,
										right: -handleSize / 2,
										bottom: -handleSize / 2,
									}}
									onMouseDown={(e) =>
										handleStartResize(e, "se")
									}
								/>

								{/* Rotation handle - Bottom center with arrow icon */}
								<div
									className='absolute left-1/2 -translate-x-1/2 z-30'
									style={{ bottom: -rotateHandleOffset }}>
									<div
										className='w-0.5 bg-primary mx-auto'
										style={{
											height:
												Math.abs(rotateHandleOffset) -
												20,
										}}
									/>
									<div
										className='w-7 h-7 bg-primary rounded-full cursor-grab active:cursor-grabbing hover:scale-110 transition-transform border-2 border-white flex items-center justify-center shadow-lg'
										onMouseDown={handleStartRotate}
										style={{
											transform: isRotating
												? "scale(1.1)"
												: "scale(1)",
										}}>
										<RotateCw className='w-4 h-4 text-white' />
									</div>
								</div>

								{/* Action buttons */}
								<div className='absolute top-1 right-1 flex gap-1 bg-black/60 rounded-lg p-1 z-30'>
									<button
										onClick={(e) => {
											e.stopPropagation();
											onCropClick();
										}}
										className='p-1.5 bg-white/90 hover:bg-white rounded text-gray-700 transition-colors'
										title='Crop'>
										<Scissors className='w-3.5 h-3.5' />
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											onDelete();
										}}
										className='p-1.5 bg-red-500 hover:bg-red-600 rounded text-white transition-colors'
										title='Delete'>
										<Trash2 className='w-3.5 h-3.5' />
									</button>
								</div>
							</>
						)}
					</>
				)}
				{isCropping && (
					<div
						className='relative'
						style={{ width: "fit-content", maxWidth: "280px" }}>
						<ReactCrop
							crop={cropPercent}
							onChange={(_, percentCrop) => {
								setCropPercent(percentCrop);
								const imgEl = imgRef.current;
								if (!imgEl || !percentCrop) return;
								onCropAreaChange({
									x: Math.round(
										((percentCrop.x ?? 0) / 100) *
											imgEl.width
									),
									y: Math.round(
										((percentCrop.y ?? 0) / 100) *
											imgEl.height
									),
									width: Math.round(
										((percentCrop.width ?? 0) / 100) *
											imgEl.width
									),
									height: Math.round(
										((percentCrop.height ?? 0) / 100) *
											imgEl.height
									),
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
								className={`max-w-[280px] h-auto ${borderColor} rounded`}
								style={{
									borderWidth: "2px",
									maxWidth: "280px",
									display: "block",
									// Apply rotation to image when cropping so crop box stays fixed
									transform: `rotate(${rotation}deg)`,
									transformOrigin: "center center",
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
						<div className='mt-2 flex gap-2 justify-center'>
							<button
								onClick={(e) => {
									e.stopPropagation();
									onCropSave();
								}}
								className='px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90'>
								Save
							</button>
							<button
								onClick={(e) => {
									e.stopPropagation();
									onCropCancel();
								}}
								className='px-3 py-1 text-xs border border-border rounded hover:bg-muted'>
								Cancel
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
