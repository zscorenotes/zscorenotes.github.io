'use client';

import React, { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * Lightbox component for displaying images in full-screen overlay
 */
export function Lightbox({ images, startIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const nextImage = useCallback((e) => {
    e && e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback((e) => {
    e && e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

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
  }, [startIndex]);

  if (!images || images.length === 0) return null;
  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-[210]"
        aria-label="Close"
      >
        <X size={32} />
      </button>

      <div className="relative w-full max-w-5xl max-h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex-grow flex items-center justify-center">
          <img
            key={currentImage.src}
            src={currentImage.src}
            alt={currentImage.caption || `Image ${currentIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain"
          />
        </div>
        {currentImage.caption && (
          <div className="text-center text-white p-4">
            <p>{currentImage.caption}</p>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full text-white hover:bg-white/40 transition-colors z-[210]"
            aria-label="Previous"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full text-white hover:bg-white/40 transition-colors z-[210]"
            aria-label="Next"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Client component for back navigation
 */
export function BackToFeedButton() {
  const handleBackToFeed = useCallback((e) => {
    e.preventDefault();
    window.location.href = '/projects';
  }, []);

  return (
    <button
      onClick={handleBackToFeed}
      className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors font-medium"
    >
      <ArrowLeft size={16} />
      <span className="hidden sm:inline">Back to Projects</span>
      <span className="sm:hidden">Back</span>
    </button>
  );
}

/**
 * Client component for breadcrumb navigation
 */
export function BackToBreadcrumb() {
  const handleBack = useCallback((e) => {
    e.preventDefault();
    window.location.href = '/projects';
  }, []);

  return (
    <button onClick={handleBack} className="hover:text-black transition-colors">
      Projects
    </button>
  );
}

/**
 * Context for lightbox functionality
 */
const LightboxContext = createContext();

/**
 * Client component for managing lightbox state and interactions
 */
export function ImageGallery({ newsItem, children }) {
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    images: [],
    startIndex: 0
  });

  const openLightbox = useCallback((startIndex = 0) => {
    if (!newsItem) return;

    const collectedImages = [];

    // Add main image if available
    if (newsItem.image_urls && newsItem.image_urls.length > 0) {
      collectedImages.push({ src: newsItem.image_urls[0], caption: newsItem.title || '' });
    }

    // Add images from content blocks
    if (newsItem.content_blocks) {
      newsItem.content_blocks.forEach(block => {
        if (block.type === 'image') {
          collectedImages.push({ src: block.src, caption: block.caption || '' });
        }
      });
    }

    // Filter for unique images by src
    const uniqueImagesMap = new Map();
    collectedImages.forEach(img => {
      if (!uniqueImagesMap.has(img.src)) {
        uniqueImagesMap.set(img.src, img);
      }
    });
    const uniqueImages = Array.from(uniqueImagesMap.values());

    setLightboxState({
      isOpen: true,
      images: uniqueImages,
      startIndex
    });
  }, [newsItem]);

  const closeLightbox = () => {
    setLightboxState({ isOpen: false, images: [], startIndex: 0 });
  };

  return (
    <LightboxContext.Provider value={{ openLightbox }}>
      {children}
      
      {/* Lightbox */}
      {lightboxState.isOpen && (
        <Lightbox
          images={lightboxState.images}
          startIndex={lightboxState.startIndex}
          onClose={closeLightbox}
        />
      )}
    </LightboxContext.Provider>
  );
}

/**
 * Client component for clickable images
 */
export function ClickableImage({ src, alt, className, index = 0 }) {
  const context = useContext(LightboxContext);
  
  const handleClick = () => {
    if (context?.openLightbox) {
      context.openLightbox(index);
    }
  };

  return (
    <button onClick={handleClick} className="block w-full group">
      <img
        src={src}
        alt={alt}
        className={`${className} transition-transform duration-300 group-hover:scale-105`}
      />
    </button>
  );
}

/**
 * Client component for title updates
 */
export function TitleUpdater({ title }) {
  useEffect(() => {
    if (!title) return;

    const originalTitle = document.title;
    document.title = `${title} | ZSCORE Studio`;

    return () => {
      document.title = originalTitle;
    };
  }, [title]);

  return null;
}