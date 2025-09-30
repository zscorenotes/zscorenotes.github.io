
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import * as ContentManager from '@/lib/content-manager-clean';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format } from "date-fns";
import { getCategoryColorSSR } from '@/utils/categoryColorsSSR';

/**
 * A reusable Lightbox component for displaying images in a full-screen overlay.
 */
const Lightbox = ({ images, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  // Memoize these functions to ensure their identity is stable across renders,
  // preventing useEffect from re-running unnecessarily if they were defined inline.
  // Although not strictly necessary if `images` prop is always stable and `setCurrentIndex` is stable,
  // it's good practice when they are dependencies of useEffect.
  const nextImage = useCallback((e) => {
    e && e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]); // Depends on images.length

  const prevImage = useCallback((e) => {
    e && e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]); // Depends on images.length

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextImage, prevImage, onClose]); // Added nextImage, prevImage, onClose to dependencies

  // Update currentIndex if startIndex changes (e.g., if lightbox is reopened with a different start image)
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
};

/**
 * Dedicated page for displaying individual news articles with proper SEO
 */
export default function NewsDetailPage({ newsId, newsSlug }) {
  const router = useRouter();
  const [newsItem, setNewsItem] = useState(null);
  const [allNews, setAllNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    images: [],
    startIndex: 0
  });

  // Handler to navigate back to feed section
  const handleBackToFeed = useCallback((e) => {
    e.preventDefault();
    
    // Use window.location.href for reliable navigation to home with hash
    window.location.href = '/#feed';
  }, []);

  // Memoize loadNewsItem to prevent it from being recreated on every render
  const loadNewsItem = useCallback(async () => {
    if (!newsId && !newsSlug) {
      setError('No news item identifier provided.');
      setIsLoading(false);
      return;
    }
    try {
      // Load all content from ContentManager for finding the item
      const contentData = await ContentManager.getAllContent();
      const allNewsData = contentData.news || [];
      setAllNews(allNewsData);
      
      // Find the specific news item by slug first, then by ID for backward compatibility
      let foundItem;
      if (newsSlug) {
        // Try to find by slug first
        foundItem = allNewsData.find(item => item.slug === newsSlug);
        // If not found by slug, try by ID (in case the URL param is actually an ID)
        if (!foundItem) {
          foundItem = allNewsData.find(item => item.id === newsSlug);
        }
      } else if (newsId) {
        foundItem = allNewsData.find(item => item.id === newsId);
      }
      
      if (foundItem) {
        // Load the item with HTML content for display
        const itemWithHTML = await ContentManager.getContentWithHTML('news', foundItem.id);
        setNewsItem(itemWithHTML);
      } else {
        setError('News item not found.');
      }
    } catch (err) {
      setError('Failed to load news item.');
      console.error('Error loading news item:', err);
    } finally {
      setIsLoading(false);
    }
  }, [newsId, newsSlug]); // setNewsItem, setError, setIsLoading are stable from React hooks

  useEffect(() => {
    loadNewsItem();
  }, [loadNewsItem]);

  // Simple page title update only
  useEffect(() => {
    if (!newsItem) return;

    // Update page title only
    const originalTitle = document.title;
    document.title = `${newsItem.title} | ZSCORE Studio`;

    // Simple cleanup - just restore original title
    return () => {
      document.title = originalTitle;
    };
  }, [newsItem]);



  const getCategoryColor = (category) => {
    return getCategoryColorSSR(category, 'news', null);
  };

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

    // Filter for unique images by src, preferring earlier occurrences (e.g., main image over content block if same src)
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
  }, [newsItem]); // newsItem is a dependency for useCallback

  const closeLightbox = () => {
    setLightboxState({ isOpen: false, images: [], startIndex: 0 });
  };

  // Get related posts (same category, excluding current post, limit to 3)
  const relatedPosts = allNews
    .filter(item => {
      const isCurrentItem = newsSlug 
        ? (item.slug === newsSlug || item.id === newsSlug)
        : item.id === newsId;
      return !isCurrentItem && item.category === newsItem?.category;
    })
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !newsItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center p-6">
        <div>
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested article could not be found.'}</p>
          <button
            onClick={handleBackToFeed}
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Skip Links */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-black text-white px-4 py-2 z-50">
        Skip to content
      </a>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="w-[85%] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back Button */}
            <button 
              onClick={handleBackToFeed}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors font-medium"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Feed</span>
              <span className="sm:hidden">Back</span>
            </button>

            {/* Center: Logo */}
            <Link 
              href="/" 
              className="absolute left-1/2 transform -translate-x-1/2 font-black text-lg hover:text-gray-600 transition-colors"
            >
              ZSCORE<span className="font-extralight">.studio</span>
            </Link>

            {/* Right: Menu placeholder */}
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="w-[85%] mx-auto px-6 py-3 text-sm text-gray-500">
        <nav className="flex items-center space-x-2">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>›</span>
          <button onClick={handleBackToFeed} className="hover:text-black transition-colors">Feed</button>
          <span>›</span>
          <span className="text-gray-900 font-medium">{newsItem.title}</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative">
        <div className="grid lg:grid-cols-12 gap-0 h-[60vh] lg:h-screen">
          {/* Image Column */}
          {newsItem.image_urls && newsItem.image_urls.length > 0 && (
            <div className="lg:col-span-7 relative">
              <div className="aspect-[4/3] lg:aspect-auto lg:h-full relative overflow-hidden">
                <button
                  onClick={() => openLightbox(0)}
                  className="w-full h-full block group"
                >
                  <img
                    src={newsItem.image_urls[0]}
                    alt={newsItem.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </button>
              </div>
            </div>
          )}

          {/* Content Column */}
          <div className={`${newsItem.image_urls && newsItem.image_urls.length > 0 ? 'lg:col-span-5' : 'lg:col-span-12'} flex items-center`}>
            <div className="w-full px-6 lg:px-12 py-12 lg:py-16">
              {/* Category & Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`px-3 py-1 text-xs font-medium tracking-wider uppercase ${getCategoryColor(newsItem.category)}`}>
                  {newsItem.category.replace('_', ' ')}
                </span>
                {newsItem.featured && (
                  <span className="px-3 py-1 bg-black text-white text-xs font-medium tracking-wider uppercase">
                    Featured
                  </span>
                )}
              </div>

              {/* Publication Date */}
              {newsItem.publication_date && (
                <p className="text-sm text-gray-600 mb-4 font-medium">
                  {format(new Date(newsItem.publication_date), 'MMMM d, yyyy')}
                </p>
              )}

              {/* Title */}
              <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black mb-6 leading-tight tracking-tight">
                {newsItem.title}
              </h1>

              {/* Subtitle/Excerpt */}
              {newsItem.excerpt && (
                <p className="text-lg lg:text-xl text-gray-700 leading-relaxed font-light">
                  {newsItem.excerpt}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="main-content" className="w-[85%] mx-auto px-6 py-16 lg:py-24 xl:py-32">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Article Content */}
          <div className="lg:col-span-8">
            <div className="prose prose-lg max-w-none">
              {/* Content Blocks */}
              {newsItem.content_blocks && newsItem.content_blocks.length > 0 ? (
                newsItem.content_blocks.map((block, index) => {
                  if (block.type === 'heading') {
                    return <h2 key={index} className="text-2xl font-bold mt-12 mb-6 tracking-tight">{block.content}</h2>;
                  } else if (block.type === 'paragraph') {
                    return <p key={index} className="text-lg leading-relaxed mb-6 text-gray-800">{block.content}</p>;
                  } else if (block.type === 'markdown' && block.content) {
                    return (
                      <div 
                        key={index} 
                        dangerouslySetInnerHTML={{ __html: block.content }} 
                        className="prose-content text-lg leading-relaxed mb-6 text-gray-800"
                      />
                    );
                  } else if (block.type === 'image') {
                    return (
                      <figure key={index} className="my-12">
                        <button
                          onClick={() => openLightbox(0)}
                          className="block w-full group"
                        >
                          <img 
                            src={block.src} 
                            alt={block.caption || `Content image ${index}`} 
                            className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.02]" 
                          />
                        </button>
                        {block.caption && (
                          <figcaption className="text-center text-sm text-gray-600 mt-4 font-medium">
                            {block.caption}
                          </figcaption>
                        )}
                      </figure>
                    );
                  }
                  return null;
                })
              ) : newsItem.content ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: newsItem.content }} 
                  className="prose-content text-lg leading-relaxed text-gray-800"
                />
              ) : null}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              {/* Article Meta */}
              <div className="bg-gray-50 p-6 mb-8">
                <h3 className="font-bold text-sm tracking-wider uppercase text-gray-900 mb-4">
                  Article Information
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Published</dt>
                    <dd className="text-sm text-gray-900 font-medium">
                      {newsItem.publication_date && format(new Date(newsItem.publication_date), 'MMMM d, yyyy')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</dt>
                    <dd className="text-sm text-gray-900 font-medium">
                      {newsItem.category?.replace('_', ' ')}
                    </dd>
                  </div>
                  {newsItem.tags && newsItem.tags.length > 0 && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</dt>
                      <dd className="flex flex-wrap gap-1 mt-2">
                        {newsItem.tags.slice(0, 5).map((tag, index) => (
                          <span 
                            key={index}
                            className="inline-block px-2 py-1 text-xs bg-white text-gray-700 border border-gray-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Additional Images */}
              {newsItem.image_urls && newsItem.image_urls.length > 1 && (
                <div className="mb-8">
                  <h3 className="font-bold text-sm tracking-wider uppercase text-gray-900 mb-4">
                    Additional Images
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {newsItem.image_urls.slice(1, 5).map((imageUrl, index) => (
                      <button
                        key={index}
                        onClick={() => openLightbox(index + 1)}
                        className="group block"
                      >
                        <img
                          src={imageUrl}
                          alt={`Additional image ${index + 1}`}
                          className="w-full h-20 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Articles */}
              {relatedPosts.length > 0 && (
                <div>
                  <h3 className="font-bold text-sm tracking-wider uppercase text-gray-900 mb-4">
                    Related Articles
                  </h3>
                  <div className="space-y-4">
                    {relatedPosts.map((post, index) => (
                      <Link 
                        key={index}
                        href={`/news/${post.slug || post.id}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          {post.image_urls && post.image_urls[0] && (
                            <img 
                              src={post.image_urls[0]} 
                              alt={post.title}
                              className="w-16 h-16 object-cover flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-black transition-colors">
                              {post.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {post.publication_date && format(new Date(post.publication_date), 'MMM d, yyyy')}
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
