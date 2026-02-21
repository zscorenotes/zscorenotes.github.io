'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import Lightbox from '@/components/shared/Lightbox';

/**
 * Inline gallery viewer with prev/next navigation, thumbnail strip,
 * and an expand button that opens the shared fullscreen Lightbox.
 *
 * @param {Array} images - Array of { src, caption } objects
 * @param {string} className - Optional extra class names
 */
export default function InlineGallery({ images = [], className = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const prev = useCallback(() => {
    setCurrentIndex(i => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setCurrentIndex(i => (i + 1) % images.length);
  }, [images.length]);

  // Keyboard navigation (only when lightbox is not open)
  useEffect(() => {
    if (lightboxOpen) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, prev, next]);

  if (!images || images.length === 0) return null;

  const safeIndex = Math.min(currentIndex, images.length - 1);
  const currentImage = images[safeIndex];

  return (
    <div className={`select-none ${className}`}>
      {/* Main image area */}
      <div className="relative bg-gray-100 overflow-hidden">
        <img
          key={currentImage.src}
          src={currentImage.src}
          alt={currentImage.caption || `Image ${safeIndex + 1}`}
          className="w-full max-h-[70vh] object-contain"
        />

        {/* Prev button */}
        {images.length > 1 && (
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-200 text-black p-2 hover:bg-gray-300 transition-colors shadow"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Next button */}
        {images.length > 1 && (
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-200 text-black p-2 hover:bg-gray-300 transition-colors shadow"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Expand to fullscreen */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute top-2 right-2 bg-gray-200 text-black p-2 hover:bg-gray-300 transition-colors shadow"
          title="View fullscreen"
          aria-label="Open fullscreen"
        >
          <Maximize2 size={16} />
        </button>

        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-2 bg-gray-200 text-black text-xs font-mono px-2 py-1">
            {safeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-1 p-2 bg-gray-50 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`flex-shrink-0 w-14 h-14 overflow-hidden border-2 transition-all ${
                i === safeIndex
                  ? 'border-black opacity-100'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
              aria-label={`Go to image ${i + 1}`}
            >
              <img
                src={img.src}
                alt={img.caption || `Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={images}
          startIndex={safeIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
