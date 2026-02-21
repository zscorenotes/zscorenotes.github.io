'use client';

import React, { useState, useEffect, useCallback } from 'react';
import * as ContentManager from '@/lib/content-manager-clean';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/shared/Footer';
import Lightbox from '@/components/shared/Lightbox';
import InlineGallery from '@/components/shared/InlineGallery';

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

  // Handler to navigate back to portfolio listing
  const handleBackToPortfolio = useCallback((e) => {
    e.preventDefault();
    router.push('/portfolio');
  }, [router]);

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

  // Renders HTML content, replacing any <div data-gallery="..."> markers with InlineGallery
  const renderHTMLWithGalleries = (html, galleryImages) => {
    if (!html) return null;
    const GALLERY_MARKER = 'data-gallery=';
    if (!html.includes(GALLERY_MARKER)) {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className="prose-content text-xl leading-relaxed text-gray-800"
        />
      );
    }
    // Split HTML on gallery marker divs
    const parts = html.split(/(<div[^>]*data-gallery[^>]*>[\s\S]*?<\/div>)/gi);
    return (
      <>
        {parts.map((part, i) => {
          if (/data-gallery/i.test(part)) {
            return galleryImages.length > 0
              ? <InlineGallery key={`gallery-${i}`} images={galleryImages} className="my-12" />
              : null;
          }
          return part.trim()
            ? <div key={`html-${i}`} dangerouslySetInnerHTML={{ __html: part }} className="prose-content text-xl leading-relaxed text-gray-800" />
            : null;
        })}
      </>
    );
  };

  // Get other portfolio items (excluding current)
  const otherItems = allPortfolio
    .filter(item => {
      const isCurrentItem = portfolioSlug
        ? (item.slug === portfolioSlug || item.id === portfolioSlug)
        : item.id === portfolioId;
      return !isCurrentItem;
    });

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
              {/* Title */}
              <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black mb-8 leading-none tracking-tighter">
                <span className="block bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
                  {portfolioItem.title}
                </span>
              </h1>

              {/* Description */}
              {portfolioItem.description && (
                <p className="text-xl text-gray-700 leading-relaxed font-light border-l-4 border-black pl-6">
                  {portfolioItem.description}
                </p>
              )}
            </div>

            {/* Right: Inline Gallery (skips cover photo at index 0) */}
            {portfolioItem.image_urls && portfolioItem.image_urls.length > 1 && (
              <div className="lg:col-span-7 order-2 lg:order-2">
                <InlineGallery
                  images={portfolioItem.image_urls.slice(1).map((url, i) => ({
                    src: url,
                    caption: `${portfolioItem.title} — Image ${i + 2}`,
                  }))}
                />
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
                  } else if (block.type === 'gallery') {
                    // Inline gallery block — shows all images except cover
                    const galleryImages = (portfolioItem.image_urls || []).slice(1).map((url, i) => ({
                      src: url,
                      caption: `${portfolioItem.title} — Image ${i + 2}`,
                    }));
                    return galleryImages.length > 0 ? (
                      <div key={index} className="my-12">
                        <InlineGallery images={galleryImages} />
                      </div>
                    ) : null;
                  }
                  return null;
                })
              ) : portfolioItem.content ? (
                renderHTMLWithGalleries(
                  portfolioItem.content,
                  (portfolioItem.image_urls || []).slice(1).map((url, i) => ({
                    src: url,
                    caption: `${portfolioItem.title} — Image ${i + 2}`,
                  }))
                )
              ) : null}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-32">
              {/* Other Portfolio Categories */}
              {otherItems.length > 0 && (
                <div>
                  <h3 className="font-black text-lg tracking-wider uppercase text-gray-900 mb-6">
                    Explore More
                  </h3>
                  <div className="space-y-6">
                    {otherItems.map((item, index) => (
                      <Link
                        key={index}
                        href={`/portfolio/${item.slug || item.id}`}
                        className="block group"
                      >
                        <div className="flex gap-4">
                          {item.image_urls && item.image_urls[0] && (
                            <img
                              src={item.image_urls[0]}
                              alt={item.title}
                              className="w-20 h-20 object-cover flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-md"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-black transition-colors">
                              {item.title}
                            </h4>
                            {item.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            )}
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

      <Footer />

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