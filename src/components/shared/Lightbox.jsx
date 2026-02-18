'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const MIN_SCALE = 1;
const MAX_SCALE = 8;
const SCROLL_ZOOM_FACTOR = 0.15;

/**
 * Shared Lightbox component with scroll-to-zoom + drag-to-pan.
 * Props: { images: Array<{src, caption?}>, startIndex: number, onClose: () => void }
 */
export default function Lightbox({ images, startIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);
  const containerRef = useRef(null);

  const isZoomed = scale > 1;

  const resetZoom = useCallback(() => {
    setScale(1);
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === '0' || e.key === 'r') resetZoom();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextImage, prevImage, onClose, resetZoom]);

  useEffect(() => {
    setCurrentIndex(startIndex);
    resetZoom();
  }, [startIndex, resetZoom]);

  // Scroll/trackpad to pan around the image when zoomed
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();

      setPan((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Prevent body scroll while lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

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

  // Touch handlers for mobile
  const lastTouchDist = useRef(null);
  const lastTouchCenter = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      // Pinch start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.hypot(dx, dy);
      lastTouchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    } else if (e.touches.length === 1 && isZoomed) {
      isDragging.current = true;
      didDrag.current = false;
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStart.current = { ...pan };
    }
  }, [isZoomed, pan]);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);

      if (lastTouchDist.current) {
        const factor = dist / lastTouchDist.current;
        setScale((prev) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev * factor)));
      }
      lastTouchDist.current = dist;
    } else if (e.touches.length === 1 && isDragging.current) {
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
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    lastTouchDist.current = null;
    lastTouchCenter.current = null;
    // Snap back if zoomed out below 1
    setScale((prev) => {
      if (prev < 1) {
        setPan({ x: 0, y: 0 });
        return 1;
      }
      return prev;
    });
  }, []);

  // Double-click to toggle zoom
  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    if (isZoomed) {
      resetZoom();
    } else {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const cx = e.clientX - rect.left - rect.width / 2;
        const cy = e.clientY - rect.top - rect.height / 2;
        const newScale = 3;
        setPan({
          x: cx - newScale * (cx / 1),
          y: cy - newScale * (cy / 1),
        });
        setScale(newScale);
      }
    }
  }, [isZoomed, resetZoom]);

  // Zoom button handlers
  const zoomIn = useCallback((e) => {
    e.stopPropagation();
    setScale((prev) => Math.min(MAX_SCALE, prev * 1.5));
  }, []);

  const zoomOut = useCallback((e) => {
    e.stopPropagation();
    setScale((prev) => {
      const next = prev / 1.5;
      if (next <= 1) {
        setPan({ x: 0, y: 0 });
        return 1;
      }
      return next;
    });
  }, []);

  if (!images || images.length === 0) return null;
  const safeIndex = Math.min(currentIndex, images.length - 1);
  const currentImage = images[safeIndex];

  const zoomPercent = Math.round(scale * 100);

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-gray-200 p-2 rounded-full text-black hover:bg-gray-300 transition-colors z-[210] shadow-lg"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      {/* Zoom controls */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-[210]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={zoomOut}
          disabled={scale <= MIN_SCALE}
          className="bg-gray-200 p-2 rounded-full text-black hover:bg-gray-300 transition-colors shadow-lg disabled:opacity-30"
          aria-label="Zoom out"
        >
          <ZoomOut size={18} />
        </button>
        <span className="bg-gray-200 text-black text-xs font-mono min-w-[3rem] text-center px-2 py-1 rounded-full shadow-lg">
          {zoomPercent}%
        </span>
        <button
          onClick={zoomIn}
          disabled={scale >= MAX_SCALE}
          className="bg-gray-200 p-2 rounded-full text-black hover:bg-gray-300 transition-colors shadow-lg disabled:opacity-30"
          aria-label="Zoom in"
        >
          <ZoomIn size={18} />
        </button>
        {isZoomed && (
          <button
            onClick={(e) => { e.stopPropagation(); resetZoom(); }}
            className="bg-gray-200 p-2 rounded-full text-black hover:bg-gray-300 transition-colors shadow-lg ml-1"
            aria-label="Reset zoom"
          >
            <RotateCcw size={18} />
          </button>
        )}
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`relative flex-grow flex items-center justify-center w-full select-none ${
            isZoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleDoubleClick}
        >
          <img
            key={currentImage.src}
            src={currentImage.src}
            alt={currentImage.caption || `Image ${currentIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain"
            style={{
              transform: `scale(${scale}) translate(${pan.x / scale}px, ${pan.y / scale}px)`,
              transformOrigin: 'center center',
              transition: isDragging.current ? 'none' : 'transform 0.15s ease-out',
            }}
            draggable={false}
          />
        </div>

        {/* Caption + counter bar */}
        <div className="flex-shrink-0 text-center text-white pb-4 pt-2 pointer-events-none">
          {currentImage.caption && (
            <p className="text-base mb-1">{currentImage.caption}</p>
          )}
          {images.length > 1 && (
            <p className="text-white/50 text-sm">
              {safeIndex + 1} / {images.length}
            </p>
          )}
        </div>
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
