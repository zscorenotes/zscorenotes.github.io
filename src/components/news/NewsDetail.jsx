
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import * as ContentManager from '@/lib/content-manager-clean';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format } from "date-fns";
import { getTagColorSync } from '@/utils/tagColors';

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
  const [newsItem, setNewsItem] = useState(null);
  const [allNews, setAllNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    images: [],
    startIndex: 0
  });

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

  // Update page title and meta tags for SEO
  useEffect(() => {
    if (newsItem) {
      const baseUrl = 'https://zscore.studio';
      const articleUrl = `${baseUrl}/news/${newsItem.slug || newsItem.id}`;
      const imageUrl = newsItem.image_urls && newsItem.image_urls.length > 0 
        ? (newsItem.image_urls[0].startsWith('http') ? newsItem.image_urls[0] : `${baseUrl}${newsItem.image_urls[0]}`)
        : `${baseUrl}/images/feeds/cover01.png`;
      const description = newsItem.excerpt || '';

      // Update basic meta tags
      document.title = `${newsItem.title} | ZSCORE Feed`;
      updateMetaTag('name', 'description', description);
      
      // Update canonical URL
      updateLinkTag('canonical', articleUrl);
      
      // Update Open Graph meta tags
      updateMetaTag('property', 'og:type', 'article');
      updateMetaTag('property', 'og:url', articleUrl);
      updateMetaTag('property', 'og:title', newsItem.title);
      updateMetaTag('property', 'og:description', description);
      updateMetaTag('property', 'og:image', imageUrl);
      updateMetaTag('property', 'og:site_name', 'ZSCORE Studio');
      updateMetaTag('property', 'article:published_time', newsItem.publication_date);
      updateMetaTag('property', 'article:section', newsItem.category);
      
      // Update Twitter Card meta tags
      updateMetaTag('name', 'twitter:card', 'summary_large_image');
      updateMetaTag('name', 'twitter:url', articleUrl);
      updateMetaTag('name', 'twitter:title', newsItem.title);
      updateMetaTag('name', 'twitter:description', description);
      updateMetaTag('name', 'twitter:image', imageUrl);
      
      // Add article tags
      if (newsItem.tags && newsItem.tags.length > 0) {
        newsItem.tags.forEach(tag => {
          updateMetaTag('property', 'article:tag', tag);
        });
      }

      // Add structured data (JSON-LD)
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": newsItem.title,
        "description": description,
        "image": imageUrl,
        "url": articleUrl,
        "datePublished": newsItem.publication_date,
        "dateModified": newsItem.updated_date || newsItem.publication_date,
        "author": {
          "@type": "Organization",
          "name": "ZSCORE Studio",
          "url": baseUrl
        },
        "publisher": {
          "@type": "Organization",
          "name": "ZSCORE Studio",
          "url": baseUrl,
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/images/logo.png`
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": articleUrl
        },
        "articleSection": newsItem.category,
        "keywords": newsItem.tags ? newsItem.tags.join(', ') : '',
        "articleBody": newsItem.content || newsItem.excerpt
      };
      
      updateStructuredData(structuredData);
    }

    // Cleanup on unmount
    return () => {
      document.title = 'ZSCORE: Expert Music Engraving, Orchestration & Audio Programming';
      updateMetaTag('name', 'description', 'ZSCORE Studio offers expert music engraving, orchestration, and audio programming services. Crafting precise and beautiful scores for composers, producers, and educators.');
      
      // Remove article-specific meta tags
      removeMetaTags(['og:type', 'og:url', 'og:title', 'og:description', 'og:image', 'og:site_name', 'article:published_time', 'article:section', 'article:tag']);
      removeMetaTags(['twitter:card', 'twitter:url', 'twitter:title', 'twitter:description', 'twitter:image']);
      removeLinkTag('canonical');
      removeStructuredData();
    };
  }, [newsItem]);

  // Helper function to update or create meta tags
  const updateMetaTag = (attr, value, content) => {
    let element = document.querySelector(`meta[${attr}="${value}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attr, value);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // Helper function to update or create link tags
  const updateLinkTag = (rel, href) => {
    let element = document.querySelector(`link[rel="${rel}"]`);
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', rel);
      document.head.appendChild(element);
    }
    element.setAttribute('href', href);
  };

  // Helper function to remove meta tags
  const removeMetaTags = (values) => {
    values.forEach(value => {
      const elements = document.querySelectorAll(`meta[property="${value}"], meta[name="${value}"]`);
      elements.forEach(element => element.remove());
    });
  };

  // Helper function to remove link tags
  const removeLinkTag = (rel) => {
    const element = document.querySelector(`link[rel="${rel}"]`);
    if (element) element.remove();
  };

  // Helper function to update structured data
  const updateStructuredData = (data) => {
    let element = document.querySelector('script[type="application/ld+json"][data-news-article]');
    if (!element) {
      element = document.createElement('script');
      element.setAttribute('type', 'application/ld+json');
      element.setAttribute('data-news-article', 'true');
      document.head.appendChild(element);
    }
    element.textContent = JSON.stringify(data, null, 2);
  };

  // Helper function to remove structured data
  const removeStructuredData = () => {
    const element = document.querySelector('script[type="application/ld+json"][data-news-article]');
    if (element) element.remove();
  };


  const getCategoryColor = (category) => {
    return getTagColorSync(category, 'news');
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

  // Find current item's position and get next/previous items
  const currentIndex = allNews.findIndex(item => {
    if (newsSlug) {
      return item.slug === newsSlug || item.id === newsSlug;
    } else if (newsId) {
      return item.id === newsId;
    }
    return false;
  });
  const previousItem = currentIndex > 0 ? allNews[currentIndex - 1] : null;
  const nextItem = currentIndex < allNews.length - 1 ? allNews[currentIndex + 1] : null;

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
          <Link
            href="/#feed"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="font-bold text-xl hover:text-gray-600 transition-colors"
            >
              ZSCORE<span className="font-thin">.studio</span>
            </Link>
            <Link 
              href="/#feed"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors tracking-wider"
            >
              <ArrowLeft size={16} />
              Back to Feed
            </Link>
          </div>
        </div>
      </nav>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center space-x-4 mb-6">
            <span className={`px-3 py-1 text-xs tracking-wider uppercase rounded-full ${getCategoryColor(newsItem.category)}`}>
              {newsItem.category.replace('_', ' ')}
            </span>
            {newsItem.publication_date && (
              <time className="text-sm text-gray-500" dateTime={newsItem.publication_date}>
                {format(new Date(newsItem.publication_date), 'MMMM d, yyyy')}
              </time>
            )}
            {newsItem.featured && (
              <span className="px-2 py-1 bg-black text-white text-xs tracking-wider">
                FEATURED
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            {newsItem.title}
          </h1>

          {newsItem.excerpt && (
            <p className="text-xl text-gray-700 leading-relaxed">
              {newsItem.excerpt}
            </p>
          )}
        </header>

        {/* Featured Image */}
        {newsItem.image_urls && newsItem.image_urls.length > 0 && (
          <div className="mb-12">
            <button
              onClick={() => openLightbox(0)} // Main image is always first in the collected unique image list
              className="w-full block hover:opacity-90 transition-opacity"
            >
              <img
                src={newsItem.image_urls[0]}
                alt={newsItem.title}
                className="w-full h-auto object-cover rounded-lg shadow-lg"
              />
            </button>
          </div>
        )}

        {/* Article Body */}
        <div className="prose prose-lg max-w-none text-gray-800">
          {newsItem.content_blocks && newsItem.content_blocks.length > 0 ? (
            newsItem.content_blocks.map((block, index) => {
              // Ensure all content block types are rendered
              if (block.type === 'heading') {
                return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{block.content}</h2>;
              } else if (block.type === 'paragraph') {
                return <p key={index} className="mb-6">{block.content}</p>;
              } else if (block.type === 'markdown' && block.content) {
                return (
                  <div 
                    key={index} 
                    dangerouslySetInnerHTML={{ __html: block.content }} 
                    className="rich-content"
                  />
                );
              } else if (block.type === 'image') {
                return (
                  <figure key={index} className="my-8">
                    <button
                      onClick={() => {
                        // Re-calculate the unique images list to find the correct index for this specific image
                        // This logic is duplicated from openLightbox's internal collection but necessary to find the precise startIndex.
                        const collectedImagesForIndex = [];
                        if (newsItem.image_urls && newsItem.image_urls.length > 0) {
                          collectedImagesForIndex.push({ src: newsItem.image_urls[0], caption: newsItem.title || '' });
                        }
                        if (newsItem.content_blocks) {
                          newsItem.content_blocks.forEach(cb => {
                            if (cb.type === 'image') {
                              collectedImagesForIndex.push({ src: cb.src, caption: cb.caption || '' });
                            }
                          });
                        }
                        const uniqueImagesMapForIndex = new Map();
                        collectedImagesForIndex.forEach(img => {
                          if (!uniqueImagesMapForIndex.has(img.src)) {
                            uniqueImagesMapForIndex.set(img.src, img);
                          }
                        });
                        const uniqueImagesForIndex = Array.from(uniqueImagesMapForIndex.values());
                        const currentImageIndex = uniqueImagesForIndex.findIndex(img => img.src === block.src);
                        openLightbox(currentImageIndex !== -1 ? currentImageIndex : 0);
                      }}
                      className="block w-full hover:opacity-90 transition-opacity"
                    >
                      <img src={block.src} alt={block.caption || `Content image ${index}`} className="w-full h-auto rounded-lg" />
                    </button>
                    {block.caption && <figcaption className="text-center text-sm text-gray-500 mt-3">{block.caption}</figcaption>}
                  </figure>
                );
              }
              return null; // Don't render unrecognized block types
            })
          ) : newsItem.content ? (
            // Fallback to rendering rich HTML content
            <div 
              dangerouslySetInnerHTML={{ __html: newsItem.content }} 
              className="rich-content prose prose-lg max-w-none"
            />
          ) : null}
        </div>

        {/* Tags */}
        {newsItem.tags && newsItem.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="font-bold mb-4 text-sm tracking-wider uppercase text-gray-500">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {newsItem.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full hover:bg-gray-300 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* External Link */}
        {newsItem.external_link && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <a
              href={newsItem.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black text-white py-3 px-6 hover:bg-gray-800 transition-colors tracking-wider"
            >
              <ExternalLink size={16} />
              <span>{newsItem.external_link_text || "Read More"}</span>
            </a>
          </div>
        )}

        {/* Next/Previous Navigation */}
        {(previousItem || nextItem) && (
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Previous Article */}
              <div className="order-2 md:order-1">
                {previousItem ? (
                  <Link
                    href={`/news/${previousItem.slug || previousItem.id}`}
                    className="group block p-6 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 h-full"
                  >
                    <div className="flex items-center gap-3 mb-3 text-gray-500 text-sm">
                      <ChevronLeft size={16} />
                      <span className="tracking-wider uppercase">Previous</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900  mb-2">
                      {previousItem.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {previousItem.excerpt || ""}
                    </p>
                    {previousItem.publication_date && (
                      <time className="text-xs text-gray-400 mt-3 block">
                        {format(new Date(previousItem.publication_date), 'MMM d, yyyy')}
                      </time>
                    )}
                  </Link>
                ) : (
                  <div className="p-6 text-center text-gray-400">
                    <span className="text-sm">No previous articles</span>
                  </div>
                )}
              </div>

              {/* Next Article */}
              <div className="order-1 md:order-2">
                {nextItem ? (
                  <Link
                    href={`/news/${nextItem.slug || nextItem.id}`}
                    className="group block p-6 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 h-full text-right"
                  >
                    <div className="flex items-center justify-end gap-3 mb-3 text-gray-500 text-sm">
                      <span className="tracking-wider uppercase">Next</span>
                      <ChevronRight size={16} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900  mb-2">
                      {nextItem.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {nextItem.excerpt || ""}
                    </p>
                    {nextItem.publication_date && (
                      <time className="text-xs text-gray-400 mt-3 block">
                        {format(new Date(nextItem.publication_date), 'MMM d, yyyy')}
                      </time>
                    )}
                  </Link>
                ) : (
                  <div className="p-6 text-center text-gray-400">
                    <span className="text-sm">No more articles</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-bold mb-8 tracking-wider">Related Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/news/${relatedPost.slug || relatedPost.id}`}
                  className="group block bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                  onClick={() => window.scrollTo(0,0)} // Scroll to top when navigating to related post
                >
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    {relatedPost.image_urls && relatedPost.image_urls.length > 0 ? (
                      <img
                        src={relatedPost.image_urls[0]}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <div className="text-2xl mb-1">♪</div>
                          <div className="text-xs uppercase tracking-wider">
                            {relatedPost.category.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 text-xs tracking-wider uppercase rounded ${getCategoryColor(relatedPost.category)}`}>
                        {relatedPost.category.replace('_', ' ')}
                      </span>
                      {relatedPost.publication_date && (
                        <time className="text-xs text-gray-400">
                          {format(new Date(relatedPost.publication_date), 'MMM d')}
                        </time>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-gray-900  mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {relatedPost.excerpt || ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Lightbox */}
      {lightboxState.isOpen && <Lightbox {...lightboxState} onClose={closeLightbox} />}
    </div>
  );
}
