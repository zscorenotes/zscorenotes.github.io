import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PortfolioGallery({ item, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!item || !item.image_urls || item.image_urls.length === 0) {
    return null;
  }

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % item.image_urls.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex - 1 + item.image_urls.length) % item.image_urls.length);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        nextImage(e);
      } else if (e.key === 'ArrowLeft') {
        prevImage(e);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [item.image_urls]);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}
      </style>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-[120]"
        aria-label="Close gallery"
      >
        <X size={32} />
      </button>

      <div className="relative w-full max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-video bg-black flex items-center justify-center">
            <img
              key={item.image_urls[currentIndex]}
              src={item.image_urls[currentIndex]}
              alt={`${item.title} - Image ${currentIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain"
            />
        </div>

        <div className="bg-white/10 text-white p-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">{item.title}</h3>
            <p className="text-sm text-gray-300">{item.composer}</p>
          </div>
          <div className="font-mono text-sm">
            {currentIndex + 1} / {item.image_urls.length}
          </div>
        </div>
      </div>

      {item.image_urls.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full text-white hover:bg-white/40 transition-colors z-[120]"
            aria-label="Previous image"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full text-white hover:bg-white/40 transition-colors z-[120]"
            aria-label="Next image"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}
    </div>
  );
}