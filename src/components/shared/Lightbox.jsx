'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * Shared Lightbox component with zoom + drag-to-pan.
 * Props: { images: Array<{src, caption?}>, startIndex: number, onClose: () => void }
 */
export default function Lightbox({ images, startIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);

  const resetZoom = useCallback(() => {
    setIsZoomed(false);
    setPan({ x: 0, y: 0 });
  }, []);

  const nextImage = useCallback((e) => {
    e && e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
    resetZoom();
  }, [images.length, resetZoom]);

  const prevImage = useCallback((e) => {
    e && e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    resetZoom();
  }, [images.length, resetZoom]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextImage, prevImage, onClose]);

  useEffect(() => {
    setCurrentIndex(startIndex);
    resetZoom();
  }, [startIndex, resetZoom]);

  // Mouse handlers for drag-to-pan
  const handleMouseDown = useCallback((e) => {
    if (!isZoomed) return;
    e.preventDefault();
    isDragging.current = true;
    didDrag.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
  }, [isZoomed, pan]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      didDrag.current = true;
    }
    setPan({
      x: panStart.current.x + dx,
      y: panStart.current.y + dy,
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Touch handlers for mobile drag-to-pan
  const handleTouchStart = useCallback((e) => {
    if (!isZoomed || e.touches.length !== 1) return;
    isDragging.current = true;
    didDrag.current = false;
    dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    panStart.current = { ...pan };
  }, [isZoomed, pan]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging.current || e.touches.length !== 1) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      didDrag.current = true;
    }
    setPan({
      x: panStart.current.x + dx,
      y: panStart.current.y + dy,
    });
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Toggle zoom on image click (only if not dragging)
  const handleImageClick = useCallback((e) => {
    e.stopPropagation();
    if (didDrag.current) return;
    if (isZoomed) {
      resetZoom();
    } else {
      setIsZoomed(true);
      setPan({ x: 0, y: 0 });
    }
  }, [isZoomed, resetZoom]);

  if (!images || images.length === 0) return null;
  const safeIndex = Math.min(currentIndex, images.length - 1);
  const currentImage = images[safeIndex];

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white p-2 rounded-full text-black hover:bg-gray-100 transition-colors z-[210] shadow-lg"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      {/* Image container */}
      <div
        className="relative w-full max-w-6xl max-h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`relative flex-grow flex items-center justify-center overflow-hidden select-none ${
            isZoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            key={currentImage.src}
            src={currentImage.src}
            alt={currentImage.caption || `Image ${currentIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain transition-transform duration-200"
            style={{
              transform: isZoomed
                ? `scale(2.5) translate(${pan.x / 2.5}px, ${pan.y / 2.5}px)`
                : 'scale(1)',
              transformOrigin: 'center center',
              pointerEvents: 'auto',
            }}
            onClick={handleImageClick}
            draggable={false}
          />
        </div>

        {/* Caption */}
        {currentImage.caption && (
          <div className="text-center text-white p-4">
            <p className="text-lg">{currentImage.caption}</p>
          </div>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="text-center text-white/60 text-sm pb-2">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-gray-200 p-3 rounded-full text-black hover:bg-gray-300 transition-colors z-[210] shadow-lg"
            aria-label="Previous"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-gray-200 p-3 rounded-full text-black hover:bg-gray-300 transition-colors z-[210] shadow-lg"
            aria-label="Next"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}
    </div>
  );
}
