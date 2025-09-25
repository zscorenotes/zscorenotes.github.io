
'use client';

import React, { useState, useEffect, useRef } from "react";
import ContentManager from '@/entities/ContentManager';
import { format } from "date-fns";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { getTagColor } from '@/utils/tagColors';

/**
 * Displays the "Feed" section.
 * Fetches news items, provides category filtering, paginates results,
 * and displays them in a timeline format with links to dedicated article pages.
 */
function ModernNews() {
  // State for all news items
  const [news, setNews] = useState([]);
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(true);
  // State for the active category filter
  const [activeCategory, setActiveCategory] = useState("all");
  // Ref for the main section element
  const sectionRef = useRef(null);
  // State for the current pagination page
  const [currentPage, setCurrentPage] = useState(1);
  // Number of news items per page
  const itemsPerPage = 4;
  // Ref to prevent scrolling on initial mount
  const isInitialMount = useRef(true);

  // Effect to load news data on mount
  useEffect(() => {
    loadNews();
  }, []);

  // Effect to listen for content updates from admin panel
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleContentUpdate = (event) => {
      const { contentType } = event.detail;
      if (contentType === 'news') {
        console.log('News content updated, reloading...');
        loadNews();
      }
    };

    window.addEventListener('zscore-content-updated', handleContentUpdate);
    
    return () => {
      window.removeEventListener('zscore-content-updated', handleContentUpdate);
    };
  }, []);

  /**
   * Fetches news data from ContentManager.
   */
  const loadNews = async () => {
    try {
      const contentData = await ContentManager.getAllContent();
      const newsData = contentData.news || [];
      // Sort by publication_date descending
      const sortedNews = newsData.sort((a, b) => {
        const dateA = new Date(a.publication_date || a.created_at);
        const dateB = new Date(b.publication_date || b.created_at);
        return dateB - dateA;
      });
      setNews(sortedNews);
    } catch (error) {
      console.error("Error loading news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to scroll to the top of the section on page change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      if (sectionRef.current) {
        const headerOffset = 100; // Account for sticky header
        const elementPosition = sectionRef.current.offsetTop - headerOffset;
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      }
    }
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

    const currentSectionRef = sectionRef.current;
    if (currentSectionRef) {
      observer.observe(currentSectionRef);
    }

    return () => {
      if (currentSectionRef) {
        observer.unobserve(currentSectionRef);
      }
    };
  }, []);

  // Filter news based on the active category
  const filteredNews = activeCategory === "all" 
    ? news 
    : news.filter(item => item.category === activeCategory);
  
  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  // Get the items for the current page
  const paginatedNews = filteredNews.slice(
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
   * @param {string} categoryId The ID of the new category.
   */
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setCurrentPage(1); // Reset page on filter change
  };

  const categories = [
    { id: "all", label: "All Updates" },
    { id: "project_update", label: "Projects" },
    { id: "technology", label: "Technology" },
    { id: "industry_news", label: "Industry" },
    { id: "announcement", label: "Announcements" }
  ];

  const getCategoryColor = (category) => {
    return getTagColor(category, 'news');
  };

  return (
    <section id="news" ref={sectionRef} className="py-20 md:py-32 relative bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-16">
          <div className="fade-in-up stagger-1">
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              Feed
            </h2>
          </div>
          <div className="fade-in-up stagger-2">
            <p className="text-xl font-light text-gray-700 max-w-3xl mb-12">
              Latest developments in music technology, project updates, and industry insights
            </p>
          </div>
          
          {/* Category Filter Buttons */}
          <div className="fade-in-up stagger-3 flex flex-wrap gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-6 py-2 text-sm tracking-wider transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-black text-white"
                    : "border border-black/20 hover:bg-black hover:text-white"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-8">
            {/* Loading Skeleton */}
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse border-l-4 border-gray-200 pl-8">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-20 h-6 bg-gray-200 rounded"></div>
                  <div className="w-32 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-20 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>
            
            <div className="space-y-12">
              {paginatedNews.map((item, index) => (
                <article 
                  key={item.id} 
                  className={`fade-in-up stagger-${(index % 6) + 1} relative flex items-start space-x-8 group`}
                >
                  {/* Animated Timeline Marker with hover effect */}
                  <div className="relative z-10 w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <svg 
                        className="w-7 h-6 text-black/70 group-hover:text-black transition-all duration-300 opacity-100 group-hover:opacity-0" 
                        viewBox="0 0 29.57 24.15" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M19.25,0c6.57,0,10.32,3.32,10.32,8.57,0,10.32-13.47,15.57-18.98,15.57-6.3,0-10.59-3.24-10.59-8.57C0,7.7,9.62,0,19.25,0ZM22.31,3.94c-1.06,0-18.72,10.22-18.72,12.16,0,1.77,1.92,4.11,3.5,4.11,1.15,0,18.98-10.4,18.98-12.16,0-1.24-2.01-4.11-3.76-4.11Z" fill="currentColor"/>
                    </svg>
                    <svg 
                        className="absolute w-7 h-6 text-black transition-all duration-300 opacity-0 group-hover:opacity-100" 
                        viewBox="0 0 28.61 23.47" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M28.61,8.26c0,9.04-11.13,15.21-18.87,15.21-4.96,0-9.74-3.3-9.74-8.26C0,6.26,11.12,0,18.87,0c5.57,0,9.74,3.22,9.74,8.26Z" fill="currentColor"/>
                    </svg>
                  </div>
                  
                  {/* News Item Content Card */}
                  <Link 
                    href={`/news/${item.slug || item.id}`}
                    className="flex-1 glass-card hover-lift bg-white border border-black/5 text-left w-full focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 flex overflow-hidden group"
                  >
                    <div className="flex-1 p-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 text-xs tracking-wider uppercase rounded-full ${getCategoryColor(item.category)}`}>
                            {item.category.replace('_', ' ')}
                          </span>
                          {item.publication_date && (
                            <time className="text-sm text-gray-500" dateTime={item.publication_date}>
                              {format(new Date(item.publication_date), 'MMM d, yyyy')}
                            </time>
                          )}
                        </div>
                        {item.featured && (
                          <div className="px-2 py-1 bg-black text-white text-xs tracking-wider">
                            FEATURED
                          </div>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold mb-4">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {item.excerpt || item.content.substring(0, 150) + "..."}
                      </p>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span 
                              key={tagIndex} 
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="text-xs text-gray-400">+{item.tags.length - 3} more</span>
                          )}
                        </div>
                      )}
                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                        <span>Read full article</span>
                        <ExternalLink size={14} />
                      </div>
                    </div>
                    
                    {/* Optional Image */}
                    {item.image_urls && item.image_urls.length > 0 && (
                      <div className="hidden md:block w-48 lg:w-64 flex-shrink-0">
                        <img 
                          src={item.image_urls[0]} 
                          alt={item.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                  </Link>
                </article>
              ))}
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
  );
}

export default ModernNews;
