'use client';

import React, { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { ArrowLeft } from 'lucide-react';
import Lightbox from '@/components/shared/Lightbox';

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

    // Add all images from image_urls
    if (newsItem.image_urls && newsItem.image_urls.length > 0) {
      newsItem.image_urls.forEach((url, i) => {
        collectedImages.push({ src: url, caption: i === 0 ? (newsItem.title || '') : `Image ${i + 1}` });
      });
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