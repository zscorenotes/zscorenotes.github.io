'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { getCategoryColorSSR } from '@/utils/categoryColorsSSR';

/**
 * Standalone Portfolio Listing Page
 * Refined design matching portfolio detail pages
 */
export default function PortfolioListingPage({ initialPortfolio = [], initialCategories = null }) {
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isScrolled, setIsScrolled] = useState(false);

  const itemsPerPage = 9;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const generateSlug = (item) => {
    return item.id || item.slug || item.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'portfolio-item';
  };

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    setCurrentPage(1);
  };

  const filters = [
    { id: "all", label: "All Work" },
    { id: "score_engraving", label: "Engraving" },
    { id: "audio_programming", label: "Audio" },
    { id: "orchestration", label: "Orchestration" },
    { id: "consultation", label: "Consultation" }
  ];

  const getProjectTypeLabel = (type) => {
    const labels = {
      score_engraving: "Score Engraving",
      orchestration: "Orchestration",
      audio_programming: "Audio Programming",
      consultation: "Consultation",
      parts_engraving: "Parts Engraving",
      custom_software: "Custom Software",
      editorial: "Editorial",
      printing: "Printing"
    };
    return labels[type] || type;
  };

  const filteredPortfolio = activeFilter === "all"
    ? portfolio
    : portfolio.filter(item =>
        Array.isArray(item.project_type)
          ? item.project_type.includes(activeFilter)
          : item.project_type === activeFilter
      );

  const totalPages = Math.ceil(filteredPortfolio.length / itemsPerPage);
  const paginatedItems = filteredPortfolio.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const openDetail = (item) => {
    const slug = generateSlug(item);
    window.location.href = `/portfolio/${slug}`;
  };

  const renderCard = (item, index) => {
    return (
      <div
        key={item.id}
        className="group"
      >
        <button
          onClick={() => openDetail(item)}
          className="bg-white overflow-hidden border border-gray-200 relative w-full text-left transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
          aria-label={`View details for ${item.title}`}
        >
          {/* Image */}
          <div className="aspect-[4/5] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
            {item.image_urls && item.image_urls.length > 0 ? (
              <img
                src={item.image_urls[0]}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-12 h-10 text-gray-300"
                  viewBox="0 0 28.61 23.47"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M28.61,8.26c0,9.04-11.13,15.21-18.87,15.21-4.96,0-9.74-3.3-9.74-8.26C0,6.26,11.12,0,18.87,0c5.57,0,9.74,3.22,9.74,8.26Z" fill="currentColor"/>
                </svg>
              </div>
            )}

            {/* Year badge */}
            {item.year && (
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-sm font-medium">
                {item.year}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Project types */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Array.isArray(item.project_type) ? (
                item.project_type.slice(0, 2).map((type, typeIndex) => (
                  <span
                    key={typeIndex}
                    className={`inline-block px-3 py-1 text-xs tracking-wider uppercase ${getCategoryColorSSR(type, 'portfolio', initialCategories)}`}
                  >
                    {getProjectTypeLabel(type)}
                  </span>
                ))
              ) : (
                <span className={`inline-block px-3 py-1 text-xs tracking-wider uppercase ${getCategoryColorSSR(item.project_type, 'portfolio', initialCategories)}`}>
                  {getProjectTypeLabel(item.project_type)}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold mb-2 leading-tight tracking-tight group-hover:text-gray-600 transition-colors">
              {item.title}
            </h3>

            {item.composer && (
              <p className="text-sm text-gray-500">
                {item.composer}
              </p>
            )}
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors font-medium group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>

            <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 font-black text-xl hover:text-gray-600 transition-colors">
              ZSCORE<span className="font-extralight">.studio</span>
            </Link>

            <Link
              href="/#contact"
              className="text-sm text-gray-600 hover:text-black transition-colors font-medium"
            >
              Contact
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-black text-white">
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          <p className="text-sm font-medium tracking-widest uppercase mb-6 text-gray-400">
            Selected Works
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-8">
            Portfolio
          </h1>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <p className="text-lg md:text-xl font-light text-gray-300 max-w-xl">
              A curated collection of professional music engraving, orchestration, and audio programming projects.
            </p>
            <p className="text-3xl md:text-4xl font-bold text-gray-500 font-mono">
              {filteredPortfolio.length} <span className="text-lg font-normal">projects</span>
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-20 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/50 py-4">
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterChange(filter.id)}
                className={`px-5 py-2 text-sm tracking-wider transition-all duration-300 ${
                  activeFilter === filter.id
                    ? "bg-black text-white"
                    : "border border-gray-300 hover:border-black hover:bg-black hover:text-white"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-16 md:py-24">
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedItems.map((item, index) => renderCard(item, index))}
          </div>

          {/* Empty State */}
          {filteredPortfolio.length === 0 && (
            <div className="text-center py-24">
              <div className="mb-6">
                <svg
                  className="w-16 h-12 text-gray-300 mx-auto"
                  viewBox="0 0 28.61 23.47"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M28.61,8.26c0,9.04-11.13,15.21-18.87,15.21-4.96,0-9.74-3.3-9.74-8.26C0,6.26,11.12,0,18.87,0c5.57,0,9.74,3.22,9.74,8.26Z" fill="currentColor"/>
                </svg>
              </div>
              <p className="text-xl font-medium text-gray-600">No projects found</p>
              <p className="text-gray-400 mt-2">Try selecting a different filter</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-20">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-3 border border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white hover:border-black transition-all"
                aria-label="Previous Page"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 text-sm font-medium transition-all ${
                      currentPage === page
                        ? "bg-black text-white"
                        : "border border-gray-300 hover:border-black hover:bg-black hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-3 border border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white hover:border-black transition-all"
                aria-label="Next Page"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-white border-t border-gray-200/50">
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h3 className="text-2xl font-black mb-2">
                <span className="font-normal">ZSCORE</span>
                <span className="font-extralight">.studio</span>
              </h3>
              <p className="text-gray-500 text-sm">
                The Art of Music Notation
              </p>
            </div>

            <div className="text-sm text-gray-400">
              <p>&copy; 2025 ZSCORE.studio</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
