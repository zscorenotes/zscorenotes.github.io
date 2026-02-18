'use client';

import React, { useState, useEffect, useCallback } from 'react';
import * as ContentManager from '@/lib/content-manager-clean';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/shared/Footer';
import { getCategoryColorSSR } from '@/utils/categoryColorsSSR';
import Lightbox from '@/components/shared/Lightbox';

/**
 * Materials detail page for displaying individual service/material items.
 */
export default function MaterialsDetailPage({ materialSlug }) {
  const router = useRouter();
  const [material, setMaterial] = useState(null);
  const [allMaterials, setAllMaterials] = useState([]);
  const [categories, setCategories] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    images: [],
    startIndex: 0
  });
  const [showInlineGallery, setShowInlineGallery] = useState(false);

  const handleBackToMaterials = useCallback((e) => {
    e.preventDefault();
    router.push('/materials');
  }, [router]);

  const loadMaterial = useCallback(async () => {
    if (!materialSlug) {
      setError('No material identifier provided.');
      setIsLoading(false);
      return;
    }
    try {
      const contentData = await ContentManager.getAllContent();
      const allServicesData = contentData.services || [];
      setAllMaterials(allServicesData);
      setCategories(contentData.categories || null);

      // Find by slug first, then by ID
      let foundItem = allServicesData.find(item => item.slug === materialSlug);
      if (!foundItem) {
        foundItem = allServicesData.find(item => item.id === materialSlug);
      }

      if (foundItem) {
        const itemWithHTML = await ContentManager.getContentWithHTML('services', foundItem.id);
        setMaterial(itemWithHTML);
      } else {
        setError('Material not found.');
      }
    } catch (err) {
      setError('Failed to load material.');
      console.error('Error loading material:', err);
    } finally {
      setIsLoading(false);
    }
  }, [materialSlug]);

  useEffect(() => {
    loadMaterial();
  }, [loadMaterial]);

  useEffect(() => {
    if (!material) return;
    const originalTitle = document.title;
    document.title = `${material.title} | ZSCORE Studio`;
    return () => { document.title = originalTitle; };
  }, [material]);

  const openLightbox = useCallback((startIndex = 0) => {
    if (!material) return;

    const collectedImages = [];

    if (material.image_urls && material.image_urls.length > 0) {
      material.image_urls.forEach((url, index) => {
        collectedImages.push({
          src: url,
          caption: `${material.title} - Image ${index + 1}`
        });
      });
    }

    if (material.content_blocks) {
      material.content_blocks.forEach(block => {
        if (block.type === 'image') {
          collectedImages.push({ src: block.src, caption: block.caption || '' });
        }
      });
    }

    const uniqueImagesMap = new Map();
    collectedImages.forEach(img => {
      if (!uniqueImagesMap.has(img.src)) {
        uniqueImagesMap.set(img.src, img);
      }
    });

    setLightboxState({
      isOpen: true,
      images: Array.from(uniqueImagesMap.values()),
      startIndex
    });
  }, [material]);

  const closeLightbox = () => {
    setLightboxState({ isOpen: false, images: [], startIndex: 0 });
  };

  // Other materials (excluding current)
  const otherMaterials = allMaterials.filter(item => {
    const isCurrent = (item.slug === materialSlug || item.id === materialSlug);
    return !isCurrent;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-3 border-black border-t-transparent rounded-full mx-auto mb-6"></div>
          <p className="text-gray-700 text-lg">Loading material...</p>
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-center p-6">
        <div>
          <h1 className="text-3xl font-bold mb-6">Material Not Found</h1>
          <p className="text-gray-600 mb-8 text-lg">{error || 'The requested material could not be found.'}</p>
          <button
            onClick={handleBackToMaterials}
            className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 hover:bg-gray-800 transition-colors text-lg"
          >
            <ArrowLeft size={24} />
            Back to Materials
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

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="w-[85%] mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={handleBackToMaterials}
              className="inline-flex items-center gap-3 text-sm text-gray-600 hover:text-black transition-colors font-medium group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back to Materials</span>
              <span className="sm:hidden">Back</span>
            </button>

            <Link
              href="/"
              className="absolute left-1/2 transform -translate-x-1/2 font-black text-xl hover:text-gray-600 transition-colors"
            >
              ZSCORE<span className="font-extralight">.studio</span>
            </Link>

            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="w-[85%] mx-auto px-6 py-4 text-sm text-gray-500">
        <nav className="flex items-center space-x-2">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>›</span>
          <button onClick={handleBackToMaterials} className="hover:text-black transition-colors">Materials</button>
          <span>›</span>
          <span className="text-gray-900 font-medium">{material.title}</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen flex items-center">
        <div className="w-[85%] mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-12 gap-16 items-center">

            {/* Left: Material Information */}
            <div className="lg:col-span-5 order-1">
              {/* Category Badge */}
              {material.category && (
                <div className="mb-6">
                  <span className={`inline-block px-3 py-1 text-xs tracking-wider uppercase rounded-full ${getCategoryColorSSR(material.category, 'services', categories)}`}>
                    {material.category}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black mb-8 leading-none tracking-tighter">
                <span className="block bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
                  {material.title}
                </span>
              </h1>

              {/* Description */}
              {material.description && (
                <p className="text-xl text-gray-700 leading-relaxed font-light border-l-4 border-black pl-6">
                  {material.description}
                </p>
              )}
            </div>

            {/* Right: Image Gallery */}
            {material.image_urls && material.image_urls.length > 0 && (
              <div className="lg:col-span-7 order-2">
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold tracking-wider uppercase text-gray-900">
                      Gallery
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
                      <span>{material.image_urls.length} image{material.image_urls.length > 1 ? 's' : ''}</span>
                      <span className="ml-2 px-2 py-1 bg-black text-white text-xs font-bold">
                        CLICK TO EXPAND
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 h-[70vh]">
                    {/* Main Image */}
                    <button
                      onClick={() => openLightbox(0)}
                      className="relative col-span-2 row-span-2 group overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500"
                    >
                      <img
                        src={material.image_urls[0]}
                        alt={material.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                          <span className="font-bold text-sm">VIEW GALLERY</span>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 text-sm font-bold backdrop-blur-sm">
                        1 of {material.image_urls.length}
                      </div>
                    </button>

                    {/* Thumbnail Grid */}
                    {material.image_urls.slice(1, 5).map((url, index) => (
                      <button
                        key={index + 1}
                        onClick={() => openLightbox(index + 1)}
                        className="relative group overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-md hover:shadow-xl transition-all duration-300"
                      >
                        <img
                          src={url}
                          alt={`${material.title} - ${index + 2}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {material.image_urls.length > 5 && index === 3 && (
                          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
                            <span className="text-3xl font-black">+{material.image_urls.length - 5}</span>
                            <span className="text-xs font-bold tracking-wider uppercase">More Images</span>
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-white/90 text-black px-2 py-1 text-xs font-bold">
                          {index + 2}
                        </div>
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

                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-600 italic">
                      Click any image to open full gallery with navigation
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openLightbox(0)}
                        className="px-4 py-2 bg-black text-white text-xs font-bold tracking-wider uppercase hover:bg-gray-800 transition-colors"
                      >
                        Gallery View
                      </button>
                      {material.image_urls.length > 1 && (
                        <button
                          onClick={() => setShowInlineGallery(!showInlineGallery)}
                          className="px-4 py-2 border border-black text-black text-xs font-bold tracking-wider uppercase hover:bg-black hover:text-white transition-colors"
                        >
                          {showInlineGallery ? 'Hide' : 'Show'} All Images
                        </button>
                      )}
                    </div>
                  </div>

                  {showInlineGallery && material.image_urls.length > 1 && (
                    <div className="mt-8 space-y-6">
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-lg font-bold mb-4 tracking-wider uppercase">
                          Complete Image Collection
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {material.image_urls.map((url, index) => (
                            <div key={index} className="group">
                              <div className="relative overflow-hidden shadow-lg">
                                <img
                                  src={url}
                                  alt={`${material.title} - Image ${index + 1}`}
                                  className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                  <p className="text-white text-sm font-medium">
                                    Image {index + 1} of {material.image_urls.length}
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
          {/* Content */}
          <div className="lg:col-span-8">
            <div className="prose prose-xl max-w-none">
              {material.content_blocks && material.content_blocks.length > 0 ? (
                material.content_blocks.map((block, index) => {
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
                        <button onClick={() => openLightbox(0)} className="block w-full group">
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
              ) : material.content ? (
                <div
                  dangerouslySetInnerHTML={{ __html: material.content }}
                  className="prose-content text-xl leading-relaxed text-gray-800"
                />
              ) : null}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-32">
              {/* Other Materials */}
              {otherMaterials.length > 0 && (
                <div>
                  <h3 className="font-black text-lg tracking-wider uppercase text-gray-900 mb-6">
                    Other Materials
                  </h3>
                  <div className="space-y-6">
                    {otherMaterials.map((item, index) => (
                      <Link
                        key={index}
                        href={`/materials/${item.slug || item.id}`}
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
