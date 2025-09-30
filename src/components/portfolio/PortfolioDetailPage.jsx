'use client';

import React, { useState, useEffect, useCallback } from 'react';
import * as ContentManager from '@/lib/content-manager-clean';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight, X, Calendar, User, Layers, Music } from 'lucide-react';
import { format } from "date-fns";
import { getCategoryColorSSR } from '@/utils/categoryColorsSSR';

/**
 * A reusable Lightbox component for displaying images in a full-screen overlay.
 */
const Lightbox = ({ images, startIndex, onClose }) => {
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
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-[210]"
        aria-label="Close"
      >
        <X size={32} />
      </button>

      <div className="relative w-full max-w-6xl max-h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex-grow flex items-center justify-center">
          <img
            key={currentImage.src}
            src={currentImage.src}
            alt={currentImage.caption || `Image ${currentIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain"
          />
        </div>
        {currentImage.caption && (
            <div className="text-center text-white p-4">
                <p className="text-lg">{currentImage.caption}</p>
            </div>
        )}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/20 p-3 rounded-full text-white hover:bg-white/40 transition-colors z-[210]"
            aria-label="Previous"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/20 p-3 rounded-full text-white hover:bg-white/40 transition-colors z-[210]"
            aria-label="Next"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}
    </div>
  );
};

/**
 * Dedicated page for displaying individual portfolio projects with artistic flair
 */
export default function PortfolioDetailPage({ portfolioId, portfolioSlug }) {
  const router = useRouter();
  const [portfolioItem, setPortfolioItem] = useState(null);
  const [allPortfolio, setAllPortfolio] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    images: [],
    startIndex: 0
  });
  const [showInlineGallery, setShowInlineGallery] = useState(false);

  // Handler to navigate back to portfolio section
  const handleBackToPortfolio = useCallback((e) => {
    e.preventDefault();
    window.location.href = '/#portfolio';
  }, []);

  // Memoize loadPortfolioItem to prevent it from being recreated on every render
  const loadPortfolioItem = useCallback(async () => {
    if (!portfolioId && !portfolioSlug) {
      setError('No portfolio item identifier provided.');
      setIsLoading(false);
      return;
    }
    try {
      // Load all content from ContentManager for finding the item
      const contentData = await ContentManager.getAllContent();
      const allPortfolioData = contentData.portfolio || [];
      setAllPortfolio(allPortfolioData);
      
      // Find the specific portfolio item by slug first, then by ID for backward compatibility
      let foundItem;
      if (portfolioSlug) {
        // Try to find by slug first
        foundItem = allPortfolioData.find(item => item.slug === portfolioSlug);
        // If not found by slug, try by ID (in case the URL param is actually an ID)
        if (!foundItem) {
          foundItem = allPortfolioData.find(item => item.id === portfolioSlug);
        }
      } else if (portfolioId) {
        foundItem = allPortfolioData.find(item => item.id === portfolioId);
      }
      
      if (foundItem) {
        // Load the item with HTML content for display
        const itemWithHTML = await ContentManager.getContentWithHTML('portfolio', foundItem.id);
        setPortfolioItem(itemWithHTML);
      } else {
        setError('Portfolio project not found.');
      }
    } catch (err) {
      setError('Failed to load portfolio project.');
      console.error('Error loading portfolio project:', err);
    } finally {
      setIsLoading(false);
    }
  }, [portfolioId, portfolioSlug]);

  useEffect(() => {
    loadPortfolioItem();
  }, [loadPortfolioItem]);

  // Simple page title update only
  useEffect(() => {
    if (!portfolioItem) return;

    // Update page title only
    const originalTitle = document.title;
    document.title = `${portfolioItem.title} | ZSCORE Studio`;

    // Simple cleanup - just restore original title
    return () => {
      document.title = originalTitle;
    };
  }, [portfolioItem]);

  const getCategoryColor = (category) => {
    return getCategoryColorSSR(category, 'portfolio', null);
  };

  const getProjectTypeColor = (projectType) => {
    return getCategoryColorSSR(projectType, 'portfolio', null);
  };

  const openLightbox = useCallback((startIndex = 0) => {
    if (!portfolioItem) return;

    const collectedImages = [];

    // Add all images from portfolio item
    if (portfolioItem.image_urls && portfolioItem.image_urls.length > 0) {
      portfolioItem.image_urls.forEach((url, index) => {
        collectedImages.push({ 
          src: url, 
          caption: `${portfolioItem.title} - Image ${index + 1}` 
        });
      });
    }

    // Add images from content blocks
    if (portfolioItem.content_blocks) {
      portfolioItem.content_blocks.forEach(block => {
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
  }, [portfolioItem]);

  const closeLightbox = () => {
    setLightboxState({ isOpen: false, images: [], startIndex: 0 });
  };

  // Get related projects (same project type, excluding current, limit to 3)
  const relatedProjects = allPortfolio
    .filter(item => {
      const isCurrentItem = portfolioSlug 
        ? (item.slug === portfolioSlug || item.id === portfolioSlug)
        : item.id === portfolioId;
      return !isCurrentItem && item.project_type?.some(type => 
        portfolioItem?.project_type?.includes(type)
      );
    })
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-3 border-black border-t-transparent rounded-full mx-auto mb-6"></div>
          <p className="text-gray-700 text-lg">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolioItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-center p-6">
        <div>
          <h1 className="text-3xl font-bold mb-6">Project Not Found</h1>
          <p className="text-gray-600 mb-8 text-lg">{error || 'The requested project could not be found.'}</p>
          <button
            onClick={handleBackToPortfolio}
            className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 hover:bg-gray-800 transition-colors text-lg"
          >
            <ArrowLeft size={24} />
            Back to Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Skip Links */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-black text-white px-4 py-2 z-50">
        Skip to content
      </a>

      {/* Header with Artistic Flair */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="w-[85%] mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Left: Back Button */}
            <button 
              onClick={handleBackToPortfolio}
              className="inline-flex items-center gap-3 text-sm text-gray-600 hover:text-black transition-colors font-medium group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back to Portfolio</span>
              <span className="sm:hidden">Back</span>
            </button>

            {/* Center: Logo */}
            <Link 
              href="/" 
              className="absolute left-1/2 transform -translate-x-1/2 font-black text-xl hover:text-gray-600 transition-colors"
            >
              ZSCORE<span className="font-extralight">.studio</span>
            </Link>

            {/* Right: placeholder */}
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="w-[85%] mx-auto px-6 py-4 text-sm text-gray-500">
        <nav className="flex items-center space-x-2">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>›</span>
          <button onClick={handleBackToPortfolio} className="hover:text-black transition-colors">Portfolio</button>
          <span>›</span>
          <span className="text-gray-900 font-medium">{portfolioItem.title}</span>
        </nav>
      </div>

      {/* Portfolio Hero Section - Different Layout Order */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen flex items-center">
        <div className="w-[85%] mx-auto px-6 py-20">
          {/* Content First - Different from News */}
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            
            {/* Left: Project Information */}
            <div className="lg:col-span-5 order-1 lg:order-1">
              {/* Year & Project Types - Top */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                {portfolioItem.year && (
                  <span className="text-2xl font-bold text-gray-400">
                    {portfolioItem.year}
                  </span>
                )}
                <div className="flex flex-wrap gap-2">
                  {portfolioItem.project_type?.map((type, index) => (
                    <span 
                      key={index}
                      className={`px-3 py-1 text-xs font-bold tracking-widest uppercase border ${getProjectTypeColor(type)}`}
                    >
                      {type.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Title - Positioned Differently */}
              <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black mb-8 leading-none tracking-tighter">
                <span className="block bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
                  {portfolioItem.title}
                </span>
              </h1>

              {/* Key Details in Cards */}
              <div className="grid grid-cols-1 gap-4 mb-8">
                {portfolioItem.composer && (
                  <div className="bg-white/80 backdrop-blur-sm p-4 border border-gray-200/50 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 flex items-center justify-center">
                        {/* Simple filled half note - no animation for contrast with services */}
                        <svg 
                          className="w-5 h-4 text-gray-600" 
                          viewBox="0 0 28.61 23.47" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M28.61,8.26c0,9.04-11.13,15.21-18.87,15.21-4.96,0-9.74-3.3-9.74-8.26C0,6.26,11.12,0,18.87,0c5.57,0,9.74,3.22,9.74,8.26Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Composer</span>
                        <span className="text-lg font-medium text-gray-900">{portfolioItem.composer}</span>
                      </div>
                    </div>
                  </div>
                )}
                {portfolioItem.client && (
                  <div className="bg-white/80 backdrop-blur-sm p-4 border border-gray-200/50 shadow-sm">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-gray-600" />
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Client</span>
                        <span className="text-lg font-medium text-gray-900">{portfolioItem.client}</span>
                      </div>
                    </div>
                  </div>
                )}
                {portfolioItem.instrumentation && (
                  <div className="bg-white/80 backdrop-blur-sm p-4 border border-gray-200/50 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Layers size={18} className="text-gray-600" />
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Instrumentation</span>
                        <span className="text-lg font-medium text-gray-900">{portfolioItem.instrumentation}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description Last */}
              {portfolioItem.description && (
                <p className="text-xl text-gray-700 leading-relaxed font-light border-l-4 border-black pl-6">
                  {portfolioItem.description}
                </p>
              )}
            </div>

            {/* Right: Image Gallery with Clear Indicators */}
            {portfolioItem.image_urls && portfolioItem.image_urls.length > 0 && (
              <div className="lg:col-span-7 order-2 lg:order-2">
                <div className="relative">
                  {/* Gallery Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold tracking-wider uppercase text-gray-900">
                      Project Gallery
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
                      <span>{portfolioItem.image_urls.length} image{portfolioItem.image_urls.length > 1 ? 's' : ''}</span>
                      <span className="ml-2 px-2 py-1 bg-black text-white text-xs font-bold">
                        CLICK TO EXPAND
                      </span>
                    </div>
                  </div>

                  {/* Image Grid with Better Indicators */}
                  <div className="grid grid-cols-2 gap-4 h-[70vh]">
                    {/* Main Image */}
                    <button
                      onClick={() => openLightbox(0)}
                      className="relative col-span-2 row-span-2 group overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500"
                    >
                      <img
                        src={portfolioItem.image_urls[0]}
                        alt={portfolioItem.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Hover Overlay with Zoom Icon */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                          <span className="font-bold text-sm">VIEW GALLERY</span>
                        </div>
                      </div>
                      {/* Image Counter Badge */}
                      <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 text-sm font-bold backdrop-blur-sm">
                        1 of {portfolioItem.image_urls.length}
                      </div>
                    </button>

                    {/* Thumbnail Grid - Show 2-4 more images */}
                    {portfolioItem.image_urls.slice(1, 5).map((url, index) => (
                      <button
                        key={index + 1}
                        onClick={() => openLightbox(index + 1)}
                        className="relative group overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-md hover:shadow-xl transition-all duration-300"
                      >
                        <img
                          src={url}
                          alt={`${portfolioItem.title} - ${index + 2}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* More Images Indicator */}
                        {portfolioItem.image_urls.length > 5 && index === 3 && (
                          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
                            <span className="text-3xl font-black">+{portfolioItem.image_urls.length - 5}</span>
                            <span className="text-xs font-bold tracking-wider uppercase">More Images</span>
                          </div>
                        )}
                        {/* Individual Image Counter */}
                        <div className="absolute bottom-2 right-2 bg-white/90 text-black px-2 py-1 text-xs font-bold">
                          {index + 2}
                        </div>
                        {/* Zoom Hint */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Gallery Options */}
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-600 italic">
                      Click any image to open full gallery with navigation
                    </p>
                    
                    {/* Alternative Viewing Options */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openLightbox(0)}
                        className="px-4 py-2 bg-black text-white text-xs font-bold tracking-wider uppercase hover:bg-gray-800 transition-colors"
                      >
                        Gallery View
                      </button>
                      
                      {/* Inline Gallery Toggle */}
                      <button
                        onClick={() => setShowInlineGallery(!showInlineGallery)}
                        className="px-4 py-2 border border-black text-black text-xs font-bold tracking-wider uppercase hover:bg-black hover:text-white transition-colors"
                      >
                        {showInlineGallery ? 'Hide' : 'Show'} All Images
                      </button>
                    </div>
                  </div>

                  {/* Inline Gallery - Alternative to Lightbox */}
                  {showInlineGallery && portfolioItem.image_urls && portfolioItem.image_urls.length > 1 && (
                    <div className="mt-8 space-y-6">
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-lg font-bold mb-4 tracking-wider uppercase">
                          Complete Image Collection
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {portfolioItem.image_urls.map((url, index) => (
                            <div key={index} className="group">
                              <div className="relative overflow-hidden shadow-lg">
                                <img
                                  src={url}
                                  alt={`${portfolioItem.title} - Image ${index + 1}`}
                                  className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                  <p className="text-white text-sm font-medium">
                                    Image {index + 1} of {portfolioItem.image_urls.length}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="main-content" className="w-[85%] mx-auto px-6 py-16 lg:py-24 xl:py-32">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Project Content */}
          <div className="lg:col-span-8">
            <div className="prose prose-xl max-w-none">
              {/* Content Blocks */}
              {portfolioItem.content_blocks && portfolioItem.content_blocks.length > 0 ? (
                portfolioItem.content_blocks.map((block, index) => {
                  if (block.type === 'heading') {
                    return <h2 key={index} className="text-3xl font-bold mt-16 mb-8 tracking-tight">{block.content}</h2>;
                  } else if (block.type === 'paragraph') {
                    return <p key={index} className="text-xl leading-relaxed mb-8 text-gray-800">{block.content}</p>;
                  } else if (block.type === 'markdown' && block.content) {
                    return (
                      <div 
                        key={index} 
                        dangerouslySetInnerHTML={{ __html: block.content }} 
                        className="prose-content text-xl leading-relaxed mb-8 text-gray-800"
                      />
                    );
                  } else if (block.type === 'image') {
                    return (
                      <figure key={index} className="my-16">
                        <button
                          onClick={() => openLightbox(0)}
                          className="block w-full group"
                        >
                          <img 
                            src={block.src} 
                            alt={block.caption || `Content image ${index}`} 
                            className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.02] shadow-lg" 
                          />
                        </button>
                        {block.caption && (
                          <figcaption className="text-center text-base text-gray-600 mt-6 font-medium italic">
                            {block.caption}
                          </figcaption>
                        )}
                      </figure>
                    );
                  }
                  return null;
                })
              ) : portfolioItem.content ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: portfolioItem.content }} 
                  className="prose-content text-xl leading-relaxed text-gray-800"
                />
              ) : null}
            </div>
          </div>

          {/* Artistic Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-32">
              {/* Project Meta - More Artistic */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-8 mb-10 border border-gray-200/50 shadow-sm">
                <h3 className="font-black text-lg tracking-wider uppercase text-gray-900 mb-6">
                  Project Details
                </h3>
                <dl className="space-y-6">
                  <div>
                    <dt className="text-sm font-bold text-gray-500 uppercase tracking-wider">Year</dt>
                    <dd className="text-lg text-gray-900 font-medium">
                      {portfolioItem.year}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-gray-500 uppercase tracking-wider">Category</dt>
                    <dd className="text-lg text-gray-900 font-medium">
                      {portfolioItem.category?.replace('_', ' ')}
                    </dd>
                  </div>
                  {portfolioItem.project_type && portfolioItem.project_type.length > 0 && (
                    <div>
                      <dt className="text-sm font-bold text-gray-500 uppercase tracking-wider">Project Types</dt>
                      <dd className="flex flex-wrap gap-2 mt-3">
                        {portfolioItem.project_type.map((type, index) => (
                          <span 
                            key={index}
                            className={`inline-block px-3 py-2 text-sm border font-medium ${getProjectTypeColor(type)}`}
                          >
                            {type.replace('_', ' ')}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {portfolioItem.technologies && portfolioItem.technologies.length > 0 && (
                    <div>
                      <dt className="text-sm font-bold text-gray-500 uppercase tracking-wider">Technologies</dt>
                      <dd className="flex flex-wrap gap-2 mt-3">
                        {portfolioItem.technologies.map((tech, index) => (
                          <span 
                            key={index}
                            className="inline-block px-3 py-2 text-sm bg-gray-200 text-gray-800 border border-gray-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Related Projects */}
              {relatedProjects.length > 0 && (
                <div>
                  <h3 className="font-black text-lg tracking-wider uppercase text-gray-900 mb-6">
                    Related Projects
                  </h3>
                  <div className="space-y-6">
                    {relatedProjects.map((project, index) => (
                      <Link 
                        key={index}
                        href={`/portfolio/${project.slug || project.id}`}
                        className="block group"
                      >
                        <div className="flex gap-4">
                          {project.image_urls && project.image_urls[0] && (
                            <img 
                              src={project.image_urls[0]} 
                              alt={project.title}
                              className="w-20 h-20 object-cover flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-md"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-black transition-colors">
                              {project.title}
                            </h4>
                            <p className="text-sm text-gray-500 mt-2">
                              {project.year} • {project.client}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {lightboxState.isOpen && (
        <Lightbox
          images={lightboxState.images}
          startIndex={lightboxState.startIndex}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}