'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import Lightbox from '@/components/shared/Lightbox';

/**
 * Configurable inline gallery viewer.
 *
 * @param {Array}  images           - Array of { src, caption } objects
 * @param {string} className        - Optional extra class names
 * @param {Object} settings         - Display settings (see DEFAULT_SETTINGS below)
 */

const DEFAULT_SETTINGS = {
  mode: 'manual',       // 'manual' | 'slideshow'
  interval: 4,          // seconds between slides (slideshow only)
  object_fit: 'contain',// 'contain' | 'cover' | 'scale-down'
  aspect_ratio: 'auto', // 'auto' | '16/9' | '4/3' | '1/1' | '3/2'
  max_height: '70vh',   // CSS value, used when aspect_ratio is 'auto' and fill_height is false
  fill_height: false,   // stretch to fill the parent container's full height
  contrast_boost: 1.0,  // boost contrast to recover thin lines lost during downscaling
                        // (try 1.3–1.6 for score/notation images, 1.0 = off)
  ken_burns: false,     // slow zoom+pan effect during slide dwell time (best with cover)
  ken_burns_scale: 1.12,// how far to zoom in (1.08 = subtle, 1.15 = dramatic)
  frame: 'none',        // 'none' | 'shadow' | 'border' | 'polaroid'
  border_radius: 'none',// 'none' | 'sm' | 'md' | 'lg'
  background: 'light',  // 'light' | 'dark' | 'transparent'
  show_thumbnails: true,
  show_counter: true,
  show_arrows: true,
};


const BG_CLASS = {
  light: 'bg-gray-100',
  dark: 'bg-gray-900',
  transparent: 'bg-transparent',
};

const RADIUS_CLASS = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-xl',
};

const FRAME_CLASS = {
  none: '',
  shadow: 'shadow-lg',
  border: 'border-2 border-gray-300',
  polaroid: 'border-8 border-b-[40px] border-white shadow-xl',
};

export default function InlineGallery({ images = [], className = '', settings: settingsProp = {} }) {
  const s = { ...DEFAULT_SETTINGS, ...settingsProp };
  const isSlideshow = s.mode === 'slideshow';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const intervalRef = useRef(null);
  // Tracks how many times each slide has been visited so the Ken Burns
  // animation restarts fresh every time a slide comes into view.
  const visitKeysRef = useRef({});

  const prev = useCallback(() => {
    setCurrentIndex(i => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setCurrentIndex(i => (i + 1) % images.length);
  }, [images.length]);

  // Increment visit counter for the active slide so Ken Burns animation restarts
  useEffect(() => {
    visitKeysRef.current[currentIndex] = (visitKeysRef.current[currentIndex] || 0) + 1;
  }, [currentIndex]);

  // Slideshow auto-advance (pauses while lightbox is open)
  useEffect(() => {
    if (!isSlideshow || images.length <= 1 || lightboxOpen) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex(i => (i + 1) % images.length);
    }, s.interval * 1000);
    return () => clearInterval(intervalRef.current);
  }, [isSlideshow, s.interval, images.length, lightboxOpen]);

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

  const containerStyle = s.aspect_ratio !== 'auto' ? { aspectRatio: s.aspect_ratio } : {};
  const imgStyle = {
    objectFit: s.object_fit,
    ...(s.contrast_boost !== 1.0 ? { filter: `contrast(${s.contrast_boost})` } : {}),
    ...(s.aspect_ratio === 'auto' && !s.fill_height ? { maxHeight: s.max_height } : {}),
    ...(isSlideshow ? { cursor: 'pointer' } : {}),
  };

  const radiusClass = RADIUS_CLASS[s.border_radius] ?? '';
  const bgClass = BG_CLASS[s.background] ?? BG_CLASS.light;
  const frameClass = FRAME_CLASS[s.frame] ?? '';
  const fillH = s.fill_height;

  return (
    <div className={`select-none ${fillH ? 'h-full flex flex-col' : ''} ${className}`}>
      {/* Ken Burns keyframes — injected once per render when enabled */}
      {s.ken_burns && (
        <style>{`
          @keyframes kb0 { from { transform: scale(${s.ken_burns_scale}) translate(-5%, -4%); } to { transform: scale(${s.ken_burns_scale}) translate(5%, 3%); } }
          @keyframes kb1 { from { transform: scale(${s.ken_burns_scale}) translate(6%, -3%); } to { transform: scale(${s.ken_burns_scale}) translate(-5%, 4%); } }
          @keyframes kb2 { from { transform: scale(${s.ken_burns_scale}) translate(-4%, 5%); } to { transform: scale(${s.ken_burns_scale}) translate(4%, -5%); } }
          @keyframes kb3 { from { transform: scale(${s.ken_burns_scale}) translate(0%, -6%); } to { transform: scale(${s.ken_burns_scale}) translate(0%, 5%); } }
          @keyframes kb4 { from { transform: scale(${s.ken_burns_scale}) translate(-6%, 0%); } to { transform: scale(${s.ken_burns_scale}) translate(6%, 0%); } }
        `}</style>
      )}

      {/* Main image area */}
      <div
        className={`relative overflow-hidden ${bgClass} ${radiusClass} ${frameClass} ${fillH ? 'flex-1' : ''}`}
        style={containerStyle}
      >
        {/* Sliding strip — all images in a row, translated to show the current one */}
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{
            width: `${images.length * 100}%`,
            transform: `translateX(-${safeIndex * (100 / images.length)}%)`,
          }}
        >
          {images.map((img, i) => {
            const isActive = i === safeIndex;
            const kenBurnsStyle = s.ken_burns && isActive ? {
              animation: `kb${i % 5} ${s.interval}s ease-in-out forwards`,
            } : {};
            return (
              <div
                key={i}
                className="flex-shrink-0 h-full"
                style={{ width: `${100 / images.length}%` }}
              >
                <img
                  // Key change on each visit forces the animation to restart from scratch
                  key={isActive ? `kb-${i}-${visitKeysRef.current[i] || 0}` : i}
                  src={img.src}
                  alt={img.caption || `Image ${i + 1}`}
                  className={`w-full ${s.aspect_ratio !== 'auto' || fillH ? 'h-full' : ''}`}
                  style={{ ...imgStyle, ...kenBurnsStyle }}
                  onClick={isSlideshow ? () => setLightboxOpen(true) : undefined}
                />
              </div>
            );
          })}
        </div>

        {/* Prev button */}
        {s.show_arrows && images.length > 1 && (
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-200 text-black p-2 hover:bg-gray-300 transition-colors shadow"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Next button */}
        {s.show_arrows && images.length > 1 && (
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-200 text-black p-2 hover:bg-gray-300 transition-colors shadow"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Expand to fullscreen (hidden in slideshow — the whole image is clickable instead) */}
        {!isSlideshow && (
          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute top-2 right-2 bg-gray-200 text-black p-2 hover:bg-gray-300 transition-colors shadow"
            title="View fullscreen"
            aria-label="Open fullscreen"
          >
            <Maximize2 size={16} />
          </button>
        )}

        {/* Counter */}
        {s.show_counter && images.length > 1 && (
          <div className="absolute bottom-2 left-2 bg-gray-200/80 text-black text-xs font-mono px-2 py-1">
            {safeIndex + 1} / {images.length}
          </div>
        )}

        {/* Slideshow progress dots */}
        {isSlideshow && images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === safeIndex
                    ? 'bg-white scale-125 shadow'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip (manual mode only) */}
      {s.show_thumbnails && !isSlideshow && images.length > 1 && (
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
