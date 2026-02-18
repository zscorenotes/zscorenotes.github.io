'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { getCategoryColorSSR } from '@/utils/categoryColorsSSR';
import Footer from '@/components/shared/Footer';

/**
 * Standalone Projects Listing Page
 * Timeline design showcasing recent projects
 */
export default function NewsListingPage({ initialNews = [], initialCategories = null }) {
  const [projects] = useState(initialNews);
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isScrolled, setIsScrolled] = useState(false);
  const itemsPerPage = 6;

  const categories = [
    { id: "all", label: "All Projects" },
    { id: "score_engraving", label: "Engraving" },
    { id: "orchestration", label: "Orchestration" },
    { id: "audio_programming", label: "Audio" },
    { id: "consultation", label: "Consultation" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredProjects = activeCategory === "all"
    ? projects
    : projects.filter(item => item.category === activeCategory);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
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
    return getCategoryColorSSR(category, 'projects', initialCategories);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm" : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-20">
            <Link
              href="/"
              className={`flex items-center gap-2 text-sm font-medium group transition-colors ${
                isScrolled ? "text-gray-600 hover:text-black" : "text-white/70 hover:text-white"
              }`}
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>

            <Link href="/" className={`absolute left-1/2 transform -translate-x-1/2 font-black text-xl transition-colors ${
              isScrolled ? "text-black hover:text-gray-600" : "text-white hover:text-white/70"
            }`}>
              ZSCORE<span className="font-extralight">.studio</span>
            </Link>

            <Link
              href="/#contact"
              className={`text-sm font-medium transition-colors ${
                isScrolled ? "text-gray-600 hover:text-black" : "text-white/70 hover:text-white"
              }`}
            >
              Contact
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 bg-black text-white">
        <div className="w-[95%] max-w-screen-2xl mx-auto px-6">
          <p className="text-xs font-medium tracking-widest uppercase mb-4 text-gray-400">
            Recent Work
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tight mb-4">
            Projects
          </h1>
          <p className="text-base md:text-lg font-light text-gray-300 max-w-xl">
            A museum of our recent projects
          </p>
        </div>
      </section>

      {/* Projects Timeline */}
      <section className="py-10 md:py-16">
        <div className="w-[95%] max-w-screen-2xl mx-auto px-6">
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200"></div>

            <div className="space-y-5">
              {paginatedProjects.map((item) => (
                <article
                  key={item.id}
                  className="relative flex items-start space-x-6 group"
                >
                  {/* Timeline Marker - note SVG */}
                  <div className="relative z-10 w-6 h-6 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-4 text-black/70 group-hover:text-black transition-all duration-300 opacity-100 group-hover:opacity-0"
                      viewBox="0 0 29.57 24.15"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M19.25,0c6.57,0,10.32,3.32,10.32,8.57,0,10.32-13.47,15.57-18.98,15.57-6.3,0-10.59-3.24-10.59-8.57C0,7.7,9.62,0,19.25,0ZM22.31,3.94c-1.06,0-18.72,10.22-18.72,12.16,0,1.77,1.92,4.11,3.5,4.11,1.15,0,18.98-10.4,18.98-12.16,0-1.24-2.01-4.11-3.76-4.11Z" fill="currentColor"/>
                    </svg>
                    <svg
                      className="absolute w-5 h-4 text-black transition-all duration-300 opacity-0 group-hover:opacity-100"
                      viewBox="0 0 28.61 23.47"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M28.61,8.26c0,9.04-11.13,15.21-18.87,15.21-4.96,0-9.74-3.3-9.74-8.26C0,6.26,11.12,0,18.87,0c5.57,0,9.74,3.22,9.74,8.26Z" fill="currentColor"/>
                    </svg>
                  </div>

                  {/* Project Card */}
                  <Link
                    href={`/projects/${item.slug || item.id}`}
                    className="flex-1 bg-white border border-black/5 text-left w-full focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 block md:flex overflow-hidden group transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Mobile: Thumbnail Above */}
                    {item.image_urls && item.image_urls.length > 0 && (
                      <div className="md:hidden w-full h-32 overflow-hidden">
                        <img
                          src={item.image_urls[0]}
                          alt={item.title}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"

                        />
                      </div>
                    )}

                    <div className="flex-1 px-5 py-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-0.5 text-[11px] tracking-wider uppercase rounded-full ${getCategoryColor(item.category)}`}>
                          {item.category?.replace('_', ' ')}
                        </span>
                        {item.publication_date && (
                          <time className="text-xs text-gray-500" dateTime={item.publication_date}>
                            {format(new Date(item.publication_date), 'yyyy')}
                          </time>
                        )}
                      </div>
                      <h3 className="text-base font-bold mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                        {item.excerpt || ""}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                        <span>View project</span>
                        <ArrowRight size={12} />
                      </div>
                    </div>

                    {/* Desktop: Image on Right */}
                    {item.image_urls && item.image_urls.length > 0 && (
                      <div className="hidden md:block w-36 lg:w-44 flex-shrink-0">
                        <img
                          src={item.image_urls[0]}
                          alt={item.title}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"

                        />
                      </div>
                    )}
                  </Link>
                </article>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {filteredProjects.length === 0 && (
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
