'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, ArrowLeft, ExternalLink } from "lucide-react";
import { getCategoryColorSSR } from '@/utils/categoryColorsSSR';
import Footer from '@/components/shared/Footer';

/**
 * Standalone News Listing Page
 * Keeps the same timeline design as ModernNews but with a page header
 */
export default function NewsListingPage({ initialNews = [], initialCategories = null }) {
  const [news] = useState(initialNews);
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isScrolled, setIsScrolled] = useState(false);
  const itemsPerPage = 6;

  // Dynamic categories from settings
  const [categories, setCategories] = useState(() => {
    const base = [{ id: "all", label: "All Updates" }];
    if (initialCategories?.categories?.news_categories) {
      return [...base, ...initialCategories.categories.news_categories];
    }
    return base;
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredNews = activeCategory === "all"
    ? news
    : news.filter(item => item.category === activeCategory);

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setCurrentPage(1);
  };

  const getCategoryColor = (category) => {
    return getCategoryColorSSR(category, 'news', initialCategories);
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
            Latest Updates
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-8">
            Feed
          </h1>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <p className="text-lg md:text-xl font-light text-gray-300 max-w-xl">
              Latest developments in music technology, project updates, and industry insights.
            </p>
            <p className="text-3xl md:text-4xl font-bold text-gray-500 font-mono">
              {filteredNews.length} <span className="text-lg font-normal">articles</span>
            </p>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="sticky top-20 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/50 py-4">
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-5 py-2 text-sm tracking-wider transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-black text-white"
                    : "border border-gray-300 hover:border-black hover:bg-black hover:text-white"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* News Timeline */}
      <section className="py-16 md:py-24">
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>

            <div className="space-y-12">
              {paginatedNews.map((item, index) => (
                <article
                  key={item.id}
                  className="relative flex items-start space-x-8 group"
                >
                  {/* Timeline Marker - note SVG */}
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

                  {/* News Item Card */}
                  <Link
                    href={`/news/${item.slug || item.id}`}
                    className="flex-1 bg-white border border-black/5 text-left w-full focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 block md:flex overflow-hidden group transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Mobile: Thumbnail Above */}
                    {item.image_urls && item.image_urls.length > 0 && (
                      <div className="md:hidden w-full h-48 overflow-hidden">
                        <img
                          src={item.image_urls[0]}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}

                    <div className="flex-1 p-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 text-xs tracking-wider uppercase rounded-full ${getCategoryColor(item.category)}`}>
                            {item.category?.replace('_', ' ')}
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
                        {item.excerpt || ""}
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

                    {/* Desktop: Image on Right */}
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

          {/* Empty State */}
          {filteredNews.length === 0 && (
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
              <p className="text-xl font-medium text-gray-600">No articles found</p>
              <p className="text-gray-400 mt-2">Try selecting a different category</p>
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

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}
