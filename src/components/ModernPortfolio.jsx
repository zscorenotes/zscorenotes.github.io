'use client';

import React, { useState, useEffect, useRef } from "react";
import * as ContentManager from '@/lib/content-manager-clean';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCategoryColorSSR } from '@/utils/categoryColorsSSR';

/**
 * Displays the "Selected Works" portfolio section.
 * Fetches portfolio items, provides filtering by project type,
 * paginates the results, and opens a detail modal for each item.
 */
export default function ModernPortfolio({ initialPortfolio = [], initialCategories = null }) {
  // State to hold all portfolio items
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(initialPortfolio.length === 0);

  // Generate a URL-safe slug from portfolio item (utility function)
  const generateSlug = (item) => {
    if (!item) {
      console.warn('generateSlug called with invalid item:', item);
      return 'portfolio-item';
    }
    // Use existing stable ID from database
    const slug = item.id || item.slug || item.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'portfolio-item';
    console.log('Generated slug:', slug, 'from item:', item.id || item.title);
    return String(slug); // Ensure it's always a string
  };

  // State for the currently active category filter
  const [activeFilter, setActiveFilter] = useState("all");
  // Ref for the main section element for intersection observation
  const sectionRef = useRef(null);
  // State for the current page number in pagination
  const [currentPage, setCurrentPage] = useState(1);
  // Number of featured items to pin in center positions
  const featuredItemsCount = 3;
  // Total items to display per page (featured + compact)
  const itemsPerPage = 12;
  // Ref to prevent scrolling to top on initial component mount
  const isInitialMount = useRef(true);

  // Effect to load portfolio data on component mount
  useEffect(() => {
    // Only load portfolio if we don't have initial data
    if (initialPortfolio.length === 0) {
      loadPortfolio();
    } else {
      setIsLoading(false);
    }
  }, [initialPortfolio]);

  // Effect to listen for content updates from admin panel
  useEffect(() => {
    const handleContentUpdate = (event) => {
      const { contentType } = event.detail;
      if (contentType === 'portfolio') {
        console.log('Portfolio content updated, reloading...');
        loadPortfolio();
      }
    };

    const handleCategoriesLoaded = () => {
      console.log('Categories loaded, forcing portfolio re-render...');
      setPortfolio(prevPortfolio => [...prevPortfolio]);
    };

    // Listen for individual portfolio opening events
    const handleOpenPortfolio = (event) => {
      const { portfolioItem } = event.detail;
      
      // Navigate to dedicated portfolio page
      const slug = generateSlug(portfolioItem);
      window.location.href = `/portfolio/${slug}`;
    };

    window.addEventListener('zscore-content-updated', handleContentUpdate);
    window.addEventListener('zscore-categories-loaded', handleCategoriesLoaded);
    window.addEventListener('zscore-open-portfolio', handleOpenPortfolio);
    
    return () => {
      window.removeEventListener('zscore-content-updated', handleContentUpdate);
      window.removeEventListener('zscore-categories-loaded', handleCategoriesLoaded);
      window.removeEventListener('zscore-open-portfolio', handleOpenPortfolio);
    };
  }, []);

  /**
   * Fetches portfolio data from ContentManager.
   */
  const loadPortfolio = async () => {
    try {
      setPortfolio([]); // Clear previous data
      const contentData = await ContentManager.getAllContent();
      const portfolioData = contentData.portfolio || [];
      
      // Sort by order field (ascending), fallback to creation date
      const sortedPortfolio = portfolioData.sort((a, b) => {
        // If both have order, sort by order
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        // If only one has order, prioritize it
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        
        // If neither has order, sort by creation date (newest first)
        const dateA = new Date(a.created_at || a.created_date || 0);
        const dateB = new Date(b.created_at || b.created_date || 0);
        return dateB - dateA;
      });
      
      setPortfolio(sortedPortfolio);
    } catch (error) {
      console.error("Error loading portfolio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Track initial mount to prevent scroll on first load
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
    // Removed auto-scroll on pagination to maintain user's scroll position
  }, [currentPage]);

  // Effect for the one-time fade-in animation of the section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const element = sectionRef.current; // Capture the current ref value
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) { // Use the captured value for cleanup
        observer.unobserve(element);
      }
    };
  }, []);

  // Memoized calculation for the filtered portfolio items
  const filteredPortfolio = activeFilter === "all"
    ? portfolio
    : portfolio.filter(item =>
        Array.isArray(item.project_type)
          ? item.project_type.includes(activeFilter)
          : item.project_type === activeFilter
      );

  // Separate pagination: featured cards are always first 3 from database, compact cards paginate
  const featuredItems = filteredPortfolio.slice(0, featuredItemsCount);
  
  // Paginate only the compact items (items 4 and beyond)
  const allCompactItems = filteredPortfolio.slice(featuredItemsCount);
  const compactItemsPerPage = itemsPerPage - featuredItemsCount; // Subtract 3 featured items
  const totalCompactPages = Math.ceil(allCompactItems.length / compactItemsPerPage);
  
  const paginatedCompactItems = allCompactItems.slice(
    (currentPage - 1) * compactItemsPerPage,
    currentPage * compactItemsPerPage
  );

  // Calculate total pages based on compact items only
  const totalPages = totalCompactPages;

  // Get the items for the current page (keeping for compatibility)
  const paginatedPortfolio = filteredPortfolio.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  /**
   * Handles changing the pagination page.
   * @param {number} newPage The new page number.
   */
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  /**
   * Handles changing the category filter.
   * @param {string} filterId The ID of the new filter.
   */
  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const filters = [
    { id: "all", label: "All Work" },
    { id: "score_engraving", label: "Score Engraving" },
    { id: "audio_programming", label: "Audio Programming" },
    { id: "orchestration", label: "Orchestration" },
    { id: "consultation", label: "Consultation" }
  ];

  const getProjectTypeLabel = (type) => {
    const labels = {
      score_engraving: "Score Engraving",
      orchestration: "Orchestration",
      audio_programming: "Audio Programming",
      consultation: "Consultation"
    };
    return labels[type] || type;
  };

  // Function to determine card height based on content richness
  const getCardHeight = (item, index) => {
    const hasImages = item.image_urls && item.image_urls.length > 0;
    const hasDescription = item.description && item.description.length > 100;
    const hasMultipleTypes = Array.isArray(item.project_type) && item.project_type.length > 2;
    const hasDetailedInfo = item.composer && item.instrumentation;
    
    // Create variety based on content and position for musical rhythm
    const contentScore = 
      (hasImages ? 2 : 0) + 
      (hasDescription ? 1 : 0) + 
      (hasMultipleTypes ? 1 : 0) + 
      (hasDetailedInfo ? 1 : 0);
    
    // Add positional variety for musical positioning
    const positionVariant = (index % 5);
    
    if (contentScore >= 4) return 'tall'; // Rich content cards
    if (contentScore >= 2 && positionVariant === 0) return 'medium-tall'; // Featured positioning
    if (positionVariant === 2 || positionVariant === 4) return 'medium'; // Rhythm variation
    return 'standard'; // Default height
  };

  // Get CSS classes for card height
  const getCardHeightClass = (height) => {
    const heights = {
      'tall': 'aspect-[4/6]',        // Taller cards for rich content
      'medium-tall': 'aspect-[4/5.2]', // Slightly taller
      'medium': 'aspect-[4/4.8]',    // Slightly shorter  
      'standard': 'aspect-[4/5]'     // Standard height
    };
    return heights[height] || heights.standard;
  };

  
  /**
   * Navigate to the dedicated portfolio page for a given item.
   * @param {object} item The portfolio item to display.
   */
  const openDetail = (item) => {
    const slug = generateSlug(item);
    window.location.href = `/portfolio/${slug}`;
  };

  // Render a featured card (current full size)
  const renderFeaturedCard = (item, index) => {
    const cardHeight = getCardHeight(item, index);
    const heightClass = getCardHeightClass(cardHeight);
    
    return (
      <div
        key={`featured-${item.id}`}
        className={`fade-in-up stagger-${(index % 6) + 1} group h-full`}
      >
        <button
          onClick={() => openDetail(item)}
          className="bg-white hover-lift overflow-hidden border border-black/10 relative w-full text-left transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl h-full"
          aria-label={`View details for ${item.title}`}
          style={{
            transformOrigin: 'center center',
          }}
        >
          {/* Theatrical Spotlight Overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 40%, rgba(0,0,0,0.1) 100%)'
              }}
            ></div>
          </div>
          
          <div className={`w-full ${heightClass} bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden border-b border-black/5 block`}>
            {/* Display first image or a placeholder */}
            {item.image_urls && item.image_urls.length > 0 ? (
              <div className="relative w-full h-full">
                <img
                  src={item.thumbnail_urls?.[0] || item.image_urls[0]}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  {/* Use the half note SVG instead of generic musical note */}
                  <div className="mb-3 flex justify-center">
                    <svg 
                      className="w-8 h-6 text-gray-400" 
                      viewBox="0 0 28.61 23.47" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M28.61,8.26c0,9.04-11.13,15.21-18.87,15.21-4.96,0-9.74-3.3-9.74-8.26C0,6.26,11.12,0,18.87,0c5.57,0,9.74,3.22,9.74,8.26Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="text-xs text-gray-400 tracking-wider">
                    {Array.isArray(item.project_type) ? item.project_type.map(getProjectTypeLabel).join(', ') : getProjectTypeLabel(item.project_type)}
                  </div>
                </div>
              </div>
            )}
            <div className="absolute top-4 right-4">
              {item.year && (
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium">
                  {item.year}
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-bold mb-3">
              {item.title}
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm mb-4 h-20 overflow-hidden">
              {item.description}
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              {item.composer && (
                <div className="flex">
                  <span className="font-medium w-20">Composer:</span>
                  <span>{item.composer}</span>
                </div>
              )}
              {item.publisher && (
                <div className="flex">
                  <span className="font-medium w-20">Publisher:</span>
                  <span>{item.publisher}</span>
                </div>
              )}
              {item.instrumentation && (
                <div className="flex">
                  <span className="font-medium w-20">Forces:</span>
                  <span>{item.instrumentation}</span>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-black/5">
              {/* Project Type Tags */}
              <div className="flex flex-wrap gap-2">
                {Array.isArray(item.project_type) ? (
                  item.project_type.map((type, typeIndex) => (
                    <span
                      key={typeIndex}
                      className={`inline-block px-3 py-1 text-xs tracking-wider uppercase rounded-full ${getCategoryColorSSR(type, 'portfolio', initialCategories)}`}
                    >
                      {getProjectTypeLabel(type)}
                    </span>
                  ))
                ) : (
                  <span className={`inline-block px-3 py-1 text-xs tracking-wider uppercase rounded-full ${getCategoryColorSSR(item.project_type, 'portfolio', initialCategories)}`}>
                    {getProjectTypeLabel(item.project_type)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>
      </div>
    );
  };

  // Render a compact card (smaller, image + metadata only)
  const renderCompactCard = (item, index) => {
    return (
      <div
        key={`compact-${item.id}`}
        className={`fade-in-up stagger-${((index + 3) % 6) + 1} group h-full`}
      >
        <button
          onClick={() => openDetail(item)}
          className="bg-white hover-lift overflow-hidden border border-black/10 relative w-full text-left transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl h-full"
          aria-label={`View details for ${item.title}`}
        >
          {/* Theatrical Spotlight Overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 40%, rgba(0,0,0,0.1) 100%)'
              }}
            ></div>
          </div>
          
          <div className="aspect-[4/3] sm:aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
            {/* Display first image or a placeholder */}
            {item.image_urls && item.image_urls.length > 0 ? (
              <div className="relative w-full h-full">
                <img
                  src={item.thumbnail_urls?.[0] || item.image_urls[0]}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-2 flex justify-center">
                    <svg 
                      className="w-6 h-4 text-gray-400" 
                      viewBox="0 0 28.61 23.47" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M28.61,8.26c0,9.04-11.13,15.21-18.87,15.21-4.96,0-9.74-3.3-9.74-8.26C0,6.26,11.12,0,18.87,0c5.57,0,9.74,3.22,9.74,8.26Z" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
              </div>
            )}
            <div className="absolute top-2 right-2">
              {item.year && (
                <div className="bg-white/90 backdrop-blur-sm px-2 py-1 text-xs font-medium">
                  {item.year}
                </div>
              )}
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-sm sm:text-base font-bold mb-2 line-clamp-2 leading-tight">
              {item.title}
            </h3>
            <div className="text-xs text-gray-500 mb-3">
              {item.composer && (
                <div className="mb-1">{item.composer}</div>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {Array.isArray(item.project_type) ? (
                item.project_type.slice(0, 2).map((type, typeIndex) => (
                  <span
                    key={typeIndex}
                    className={`inline-block px-2 py-1 text-xs tracking-wider uppercase rounded-full ${getCategoryColorSSR(type, 'portfolio', initialCategories)}`}
                  >
                    {getProjectTypeLabel(type)}
                  </span>
                ))
              ) : (
                <span className={`inline-block px-2 py-1 text-xs tracking-wider uppercase rounded-full ${getCategoryColorSSR(item.project_type, 'portfolio', initialCategories)}`}>
                  {getProjectTypeLabel(item.project_type)}
                </span>
              )}
            </div>
          </div>
        </button>
      </div>
    );
  };


  return (
    <>
      <section id="portfolio" ref={sectionRef} className="py-20 md:py-32 bg-gray-200 text-black">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-16">
            <div className="fade-in-up stagger-1">
              <h2 className="text-6xl md:text-8xl font-black mb-6 gradient-text">
                Selected Works
              </h2>
            </div>
            <div className="fade-in-up stagger-2">
              <p className="text-xl font-light text-gray-700 mb-12">
                A curated collection of our most impactful projects across diverse musical contexts.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="fade-in-up stagger-3 flex flex-wrap justify-start gap-4 mb-12">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleFilterChange(filter.id)}
                  className={`px-6 py-2 text-sm tracking-wider transition-all duration-300 ${
                    activeFilter === filter.id
                      ? "bg-black text-white"
                      : "border border-black/20 hover:bg-black hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Full-width portfolio content */}
        <div className="w-full px-6 md:px-8 lg:px-12">

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Loading Skeleton */}
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-gray-300 mb-4"></div>
                  <div className="h-6 bg-gray-300 mb-2"></div>
                  <div className="h-16 bg-gray-200"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              {/* Musical Staff Background */}
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="h-full flex flex-col justify-center space-y-8">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-full h-px bg-gray-300"></div>
                  ))}
                </div>
              </div>
              
              {/* Center-Pinned Row Masonry Layout */}
              <div className="relative z-10">
                {/* Mobile: Stack normally */}
                <div className="block lg:hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Featured items first */}
                    {featuredItems.map((item, index) => (
                      <div key={`mobile-featured-${item.id}`} className="col-span-1">
                        {renderFeaturedCard(item, index)}
                      </div>
                    ))}
                    {/* Then paginated compact items */}
                    {paginatedCompactItems.map((item, index) => (
                      <div key={`mobile-compact-${item.id}`} className="col-span-1">
                        {renderCompactCard(item, index)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop: Multi-row layout with center pinned */}
                <div className="hidden lg:flex gap-8">
                  {/* Left Side - Compact Cards in multi-row grid */}
                  <div className="flex-1">
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max">
                      {paginatedCompactItems.slice(0, Math.ceil(paginatedCompactItems.length / 2)).map((item, index) => (
                        <div key={`left-${item.id}`} className="col-span-1">
                          {renderCompactCard(item, index)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Center - Featured Cards (Original size, pinned) */}
                  <div className="flex-shrink-0">
                    <div className="grid grid-cols-3 gap-6 lg:gap-8 w-[900px] xl:w-[1200px]">
                      {featuredItems.map((item, index) => (
                        <div key={`center-${item.id}`} className="col-span-1">
                          {renderFeaturedCard(item, index)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Side - Compact Cards in multi-row grid */}
                  <div className="flex-1">
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max">
                      {paginatedCompactItems.slice(Math.ceil(paginatedCompactItems.length / 2)).map((item, index) => (
                        <div key={`right-${item.id}`} className="col-span-1">
                          {renderCompactCard(item, index + Math.ceil(paginatedCompactItems.length / 2))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-6 mt-16">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-black/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-mono">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-black/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}