import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTagColorSync } from '@/utils/tagColors';

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
 * A gallery component to display images within the service detail content.
 * @param {{
 *   images: Array<{src: string, caption?: string}>;
 *   onImageClick: (index: number) => void;
 * }} props
 */
const ServiceGallery = ({ images, onImageClick }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-8">
    {images.map((img, index) => (
      <button key={index} onClick={() => onImageClick(index)} className="block bg-gray-100 group overflow-hidden focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
        <div className="aspect-square">
          <img src={img.src} alt={img.caption || `Service image ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        {img.caption && <p className="text-xs text-gray-500 mt-2 text-center truncate">{img.caption}</p>}
      </button>
    ))}
  </div>
);

/**
 * A modal component to display detailed information about a service.
 * Renders rich content from `content_blocks` and handles image lightboxes.
 * @param {{
 *   service: object; // The service object
 *   onClose: () => void;
 * }} props
 */
export default function ServiceDetail({ service, onClose }) {
  // State to manage the image lightbox
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

  if (!service) return null;
  
  const openLightbox = (images, startIndex) => {
    setLightboxState({
      isOpen: true,
      images,
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
    return getTagColorSync(category, 'services');
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
          aria-labelledby="service-detail-title"
        >
          {/* Header Image */}
          {service.cover_image_url && (
             <div className="w-full h-64 bg-gray-200 flex-shrink-0">
                <img src={service.cover_image_url} alt={service.title} className="w-full h-full object-cover" />
             </div>
          )}

          {/* Main Content */}
          <div className="p-8 flex-grow">
            <div className="flex items-center space-x-4 mb-4">
                <span className={`px-3 py-1 text-xs tracking-wider uppercase rounded-full ${getCategoryColor(service.category)}`}>
                    {service.category}
                </span>
                {service.featured && (
                    <span className="px-3 py-1 text-xs tracking-wider uppercase bg-black text-white">Featured</span>
                )}
            </div>

            <h1 id="service-detail-title" className="text-4xl font-black mb-6">
                {service.title}
            </h1>
            
            <div className="prose max-w-none text-gray-800">
                {/* Render dynamic content blocks */}
                {service.content_blocks && service.content_blocks.length > 0 ? (
                  service.content_blocks.map((block, index) => (
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
                       {block.type === 'gallery' && (
                        <ServiceGallery images={block.images} onImageClick={(imageIndex) => openLightbox(block.images, imageIndex)} />
                      )}
                    </div>
                  ))
                ) : (
                  // Use HTML detailed_description if available, otherwise fallback to markdown description
                  service.detailed_description ? (
                    <div dangerouslySetInnerHTML={{ __html: service.detailed_description }} />
                  ) : (
                    <ReactMarkdown>{service.description}</ReactMarkdown>
                  )
                )}
            </div>
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