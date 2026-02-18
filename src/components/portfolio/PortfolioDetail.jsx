import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, ExternalLink } from 'lucide-react';
import { getCategoryColorSync } from '@/utils/categoryColors';
import Lightbox from '@/components/shared/Lightbox';

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
                  {item.content ? (
                    <div dangerouslySetInnerHTML={{ __html: item.content }} />
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
                          <span key={type} className={`px-2 py-1 text-xs uppercase rounded ${getCategoryColorSync(type, 'portfolio')}`}>{getProjectTypeLabel(type)}</span>
                        ))
                      ) : (
                        <span className={`px-2 py-1 text-xs uppercase rounded ${getCategoryColorSync(item.project_type, 'portfolio')}`}>{getProjectTypeLabel(item.project_type)}</span>
                      )}
                    </div>
                  </div>

                  {/* Technologies Section */}
                  {item.technologies && item.technologies.length > 0 && (
                    <div className="pt-4 mt-4 border-t">
                      <h5 className="font-bold mb-2">Technologies</h5>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(item.technologies) ? (
                          item.technologies.map((tech, index) => (
                            <span 
                              key={index} 
                              className={`px-2 py-1 text-xs rounded border ${getCategoryColorSync(tech, 'portfolio_technologies')}`}
                            >
                              {tech}
                            </span>
                          ))
                        ) : (
                          <span 
                            className={`px-2 py-1 text-xs rounded border ${getCategoryColorSync(item.technologies, 'portfolio_technologies')}`}
                          >
                            {item.technologies}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

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
