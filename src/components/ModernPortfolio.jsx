'use client';

import React, { useState, useEffect, useRef } from "react";
import ContentManager from '@/entities/ContentManager';
import PortfolioDetail from "./portfolio/PortfolioDetail";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Displays the "Selected Works" portfolio section.
 * Fetches portfolio items, provides filtering by project type,
 * paginates the results, and opens a detail modal for each item.
 */
export default function ModernPortfolio() {
  // State to hold all portfolio items
  const [portfolio, setPortfolio] = useState([]);
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(true);
  // State for the currently active category filter
  const [activeFilter, setActiveFilter] = useState("all");
  // Ref for the main section element for intersection observation
  const sectionRef = useRef(null);
  // State for the item selected to be shown in the detail modal
  const [selectedItem, setSelectedItem] = useState(null);
  // State for the current page number in pagination
  const [currentPage, setCurrentPage] = useState(1);
  // Number of items to display per page
  const itemsPerPage = 3;
  // Ref to prevent scrolling to top on initial component mount
  const isInitialMount = useRef(true);

  // Effect to load portfolio data on component mount
  useEffect(() => {
    loadPortfolio();
  }, []);

  // Effect to listen for content updates from admin panel
  useEffect(() => {
    const handleContentUpdate = (event) => {
      const { contentType } = event.detail;
      if (contentType === 'portfolio') {
        console.log('Portfolio content updated, reloading...');
        loadPortfolio();
      }
    };

    window.addEventListener('zscore-content-updated', handleContentUpdate);
    
    return () => {
      window.removeEventListener('zscore-content-updated', handleContentUpdate);
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
      setPortfolio(portfolioData);
    } catch (error) {
      console.error("Error loading portfolio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to scroll to the top of the section when the page changes,
  // but not on the initial load.
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      if (sectionRef.current) {
        const headerOffset = 100; // Offset for the sticky header
        const elementPosition = sectionRef.current.offsetTop - headerOffset;
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [currentPage]); // Dependency on currentPage triggers this effect

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
  
  // Calculate total pages for pagination based on the filtered list
  const totalPages = Math.ceil(filteredPortfolio.length / itemsPerPage);

  // Get the items for the current page
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
  
  /**
   * Opens the detail modal for a given portfolio item.
   * @param {object} item The portfolio item to display.
   */
  const openDetail = (item) => {
    setSelectedItem(item);
  };

  /**
   * Closes the portfolio item detail modal.
   */
  const closeDetail = () => {
    setSelectedItem(null);
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedPortfolio.map((item, index) => (
                <div
                  key={item.id}
                  className={`fade-in-up stagger-${(index % 6) + 1} group`}
                >
                  <button
                    onClick={() => openDetail(item)}
                    className="bg-white hover-lift overflow-hidden border border-black/10 relative w-full text-left"
                    aria-label={`View details for ${item.title}`}
                  >
                    <div className="w-full aspect-[4/5] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden border-b border-black/5 block">
                      {/* Display first image or a placeholder */}
                      {item.image_urls && item.image_urls.length > 0 ? (
                        <div className="relative w-full h-full">
                          <img
                            src={item.image_urls[0]}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-2 text-gray-400">♪</div>
                            <div className="text-xs text-gray-400 tracking-wider">
                              {Array.isArray(item.project_type) ? item.project_type.map(getProjectTypeLabel).join(', ') : getProjectTypeLabel(item.project_type)}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        {item.completion_year && (
                          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs">
                            {item.completion_year}
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
                                className="inline-block bg-black/5 px-3 py-1 text-xs tracking-wider text-gray-600 uppercase"
                              >
                                {getProjectTypeLabel(type)}
                              </span>
                            ))
                          ) : (
                            <span className="inline-block bg-black/5 px-3 py-1 text-xs tracking-wider text-gray-600 uppercase">
                              {getProjectTypeLabel(item.project_type)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
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

      {/* Detail Modal */}
      {selectedItem && (
        <PortfolioDetail item={selectedItem} onClose={closeDetail} />
      )}
    </>
  );
}