import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from "date-fns";

/**
 * A reusable Lightbox component for displaying images in a full-screen overlay.
 * @param {{
 *   images: Array<{src: string, caption?: string}>;
 *   startIndex: number;
 *   onClose: () => void;
 * }} props
 */
const Lightbox = ({ images, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const nextImage = (e) => {
    e && e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e && e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) return null;
  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in"
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
};


/**
 * A modal component to display the full content of a news item.
 * @param {{
 *   item: object; // The news item object
 *   onClose: () => void;
 * }} props
 */
export default function NewsDetail({ item, onClose }) {
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    images: [],
    startIndex: 0
  });
  
  // Effect to handle closing modal with Escape key and disabling body scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !lightboxState.isOpen) {
        onClose();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, lightboxState.isOpen]);

  if (!item) return null;

  const allImages = (item.image_urls || []).map(url => ({ src: url, caption: '' }));
  
  const openLightbox = (startIndex) => {
    setLightboxState({
      isOpen: true,
      images: allImages,
      startIndex
    });
  };

  const closeLightbox = () => {
    setLightboxState({
      isOpen: false,
      images: [],
      startIndex: 0
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      project_update: "bg-blue-100 text-blue-800",
      technology: "bg-purple-100 text-purple-800",
      industry_news: "bg-green-100 text-green-800",
      announcement: "bg-orange-100 text-orange-800",
      tutorial: "bg-pink-100 text-pink-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[150] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div className="fixed inset-0 z-[151] flex items-center justify-center p-4">
        <div
          className="bg-white w-full max-w-4xl h-full max-h-[90vh] overflow-y-auto flex flex-col animate-slide-up-fade"
          role="dialog"
          aria-modal="true"
          aria-labelledby="news-detail-title"
        >
          {/* Optional Header Image */}
          {allImages.length > 0 && (
            <div className="w-full h-64 bg-gray-200">
                <img src={allImages[0]} alt={item.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Main Content */}
          <div className="p-8 flex-grow">
            <div className="flex items-center space-x-4 mb-4">
                <span className={`px-3 py-1 text-xs tracking-wider uppercase rounded-full ${getCategoryColor(item.category)}`}>
                    {item.category.replace('_', ' ')}
                </span>
                {item.publication_date && (
                    <span className="text-sm text-gray-500">
                    {format(new Date(item.publication_date), 'MMMM d, yyyy')}
                    </span>
                )}
            </div>

            <h1 id="news-detail-title" className="text-4xl font-black mb-6">
                {item.title}
            </h1>
            
            <div className="prose max-w-none text-gray-800">
                {/* Render dynamic content blocks */}
                {item.content_blocks && item.content_blocks.length > 0 ? (
                  item.content_blocks.map((block, index) => (
                    <div key={index}>
                      {block.type === 'heading' && <h2 className="text-2xl font-bold mt-6 mb-3">{block.content}</h2>}
                      {block.type === 'paragraph' && <p>{block.content}</p>}
                      {block.type === 'markdown' && <ReactMarkdown>{block.content}</ReactMarkdown>}
                      {block.type === 'image' && (
                        <figure className="my-6">
                          <img src={block.src} alt={block.caption || `Content image ${index}`} className="w-full h-auto" />
                          {block.caption && <figcaption className="text-center text-sm text-gray-500 mt-2">{block.caption}</figcaption>}
                        </figure>
                      )}
                    </div>
                  ))
                ) : (
                  // Fallback to the main content field if content_blocks is empty
                  <ReactMarkdown>{item.content}</ReactMarkdown>
                )}
            </div>
            
            {item.tags && item.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                    <h3 className="font-bold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, tagIndex) => (
                        <span 
                        key={tagIndex} 
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                        #{tag}
                        </span>
                    ))}
                    </div>
                </div>
            )}
            
            {item.external_link && (
                <div className="mt-8 pt-6 border-t">
                    <a 
                    href={item.external_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-black text-white py-2 px-4 hover:bg-gray-800 transition-colors"
                    >
                    <ExternalLink size={16} />
                    <span>{item.external_link_text || "Read More"}</span>
                    </a>
                </div>
            )}
          </div>
          
          {/* Close button in footer */}
          <div className="p-6 border-t border-gray-200 sticky bottom-0 bg-white z-10 text-right">
             <button
                onClick={onClose}
                className="bg-gray-200 text-black px-6 py-2 hover:bg-gray-300 transition-colors"
             >
                Close
            </button>
          </div>
        </div>
      </div>
      {/* Conditionally render the lightbox */}
      {lightboxState.isOpen && <Lightbox {...lightboxState} onClose={closeLightbox} />}
    </>
  );
}