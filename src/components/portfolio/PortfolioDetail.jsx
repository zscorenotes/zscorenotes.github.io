import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTagColor } from '@/utils/tagColors';

/**
 * A reusable Lightbox component for displaying images in a full-screen overlay.
 * @param {{
 * images: Array<{src: string, caption?: string}>;
 * startIndex: number;
 * onClose: () => void;
 * }} props
 */
const Lightbox = ({ images, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  // Keyboard navigation for the lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]); // Re-bind if index changes

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
        <div className="text-center text-white p-4">
          {currentImage.caption && <p>{currentImage.caption}</p>}
          <p className="text-sm text-gray-400">{currentIndex + 1} / {images.length}</p>
        </div>
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
 * A modal component to display detailed information about a portfolio item.
 * @param {{
 * item: object; // The portfolio item object
 * onClose: () => void;
 * }} props
 */
export default function PortfolioDetail({ item, onClose }) {
  // State to manage the lightbox for image viewing
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    images: [],
    startIndex: 0
  });

  // Effect to handle closing the modal with the Escape key and disabling body scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Close modal only if lightbox is not open
      if (e.key === 'Escape' && !lightboxState.isOpen) {
        onClose();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function to re-enable scroll
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, lightboxState.isOpen]);

  if (!item) return null;

  const allImages = (item.image_urls || []).map(url => ({ src: url, caption: '' }));

  /**
   * Opens the lightbox with a set of images.
   * @param {number} startIndex - The index of the image to show first.
   */
  const openLightbox = (startIndex) => {
    setLightboxState({
      isOpen: true,
      images: allImages,
      startIndex
    });
  };

  /**
   * Closes the lightbox.
   */
  const closeLightbox = () => {
    setLightboxState({
      isOpen: false,
      images: [],
      startIndex: 0
    });
  };
  
  const getProjectTypeLabel = (type) => {
    const labels = {
      score_engraving: "Score Engraving",
      orchestration: "Orchestration",
      audio_programming: "Audio Programming",
      consultation: "Consultation"
    };
    return labels[type] || type;
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
          aria-labelledby="portfolio-detail-title"
        >
          {/* Header with close button */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 id="portfolio-detail-title" className="text-2xl font-bold">
              {item.title}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-black">
              <X size={24} />
            </button>
          </div>

          {/* Main Content */}
          <div className="p-8 space-y-8">
            {/* Main Image Gallery */}
            {allImages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => openLightbox(0)} className="block aspect-video bg-gray-100 group">
                    <img src={allImages[0].src} alt={item.title} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                </button>
                <div className="grid grid-cols-2 gap-4">
                    {allImages.slice(1, 5).map((img, index) => (
                        <button key={index} onClick={() => openLightbox(index + 1)} className="block aspect-square bg-gray-100 group">
                            <img src={img.src} alt={`${item.title} - image ${index + 2}`} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                        </button>
                    ))}
                </div>
              </div>
            )}
            
            {/* Project Details */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <h3 className="text-xl font-bold border-b pb-2">About this Project</h3>
                <div className="prose max-w-none text-gray-700">
                  {item.detailed_description ? (
                    <div dangerouslySetInnerHTML={{ __html: item.detailed_description }} />
                  ) : (
                    <ReactMarkdown>
                      {item.description || 'No description available.'}
                    </ReactMarkdown>
                  )}
                </div>

                {/* Render dynamic content blocks */}
                {item.content_blocks && item.content_blocks.map((block, index) => (
                    <div key={index} className="mt-6">
                        {block.type === 'heading' && <h4 className="text-lg font-bold mt-4 mb-2">{block.content}</h4>}
                        {block.type === 'paragraph' && <p className="text-gray-700">{block.content}</p>}
                        {block.type === 'markdown' && <div className="prose max-w-none text-gray-700"><ReactMarkdown>{block.content}</ReactMarkdown></div>}
                    </div>
                ))}

              </div>
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-6 space-y-4">
                  <h4 className="font-bold text-lg">Project Info</h4>
                  <div className="text-sm space-y-3">
                    {item.composer && <p><strong>Composer:</strong> {item.composer}</p>}
                    {item.publisher && <p><strong>Publisher:</strong> {item.publisher}</p>}
                    {item.instrumentation && <p><strong>Forces:</strong> {item.instrumentation}</p>}
                    {item.completion_year && <p><strong>Year:</strong> {item.completion_year}</p>}
                  </div>
                  
                  <div className="pt-4 mt-4 border-t">
                    <h5 className="font-bold mb-2">Project Types</h5>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(item.project_type) ? (
                        item.project_type.map((type) => (
                          <span key={type} className={`px-2 py-1 text-xs uppercase rounded ${getTagColor(type, 'portfolio')}`}>{getProjectTypeLabel(type)}</span>
                        ))
                      ) : (
                        <span className={`px-2 py-1 text-xs uppercase rounded ${getTagColor(item.project_type, 'portfolio')}`}>{getProjectTypeLabel(item.project_type)}</span>
                      )}
                    </div>
                  </div>

                  {item.external_link && (
                    <div className="pt-4 mt-4 border-t">
                      <a 
                        href={item.external_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-black text-white py-2 px-4 hover:bg-gray-800 transition-colors"
                      >
                        <ExternalLink size={16} />
                        <span>{item.external_link_text || "View Project"}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Conditionally render the lightbox */}
      {lightboxState.isOpen && <Lightbox {...lightboxState} onClose={closeLightbox} />}
    </>
  );
}
