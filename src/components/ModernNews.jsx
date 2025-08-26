import React, { useState, useEffect, useRef } from "react";
import { getNewsItems } from "@/api.js";
import { format } from "date-fns";
import NewsDetail from "./news/NewsDetail";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ModernNews() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const sectionRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const isInitialMount = useRef(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const newsData = await getNewsItems();
      // Ensure the data is always an array before setting state
      const newsArray = Array.isArray(newsData) ? newsData : [newsData];
      setNews(newsArray);
    } catch (error) {
      console.error("Error loading news:", error);
      setNews([]); // Set to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      if (sectionRef.current) {
        const headerOffset = 100;
        const elementPosition = sectionRef.current.offsetTop - headerOffset;
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [currentPage]);

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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
        if (sectionRef.current) {
            observer.unobserve(sectionRef.current);
        }
    };
  }, []);

  const safeNews = Array.isArray(news) ? news : [];

  const filteredNews = activeCategory === "all"
    ? safeNews
    : safeNews.filter(item => item.category === activeCategory);

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setCurrentPage(1);
  };

  const categories = [
    { id: "all", label: "All Updates" },
    { id: "project_update", label: "Projects" },
    { id: "technology", label: "Technology" },
    { id: "industry_news", label: "Industry" },
    { id: "announcement", label: "Announcements" }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      project_update: "bg-blue-100 text-blue-800",
      technology: "bg-purple-100 text-purple-800",
      industry_news: "bg-green-100 text-green-800",
      announcement: "bg-orange-100 text-orange-800",
      tutorial: "bg-pink-100 text-pink-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const openDetail = (item) => {
    setSelectedItem(item);
  };

  const closeDetail = () => {
    setSelectedItem(null);
  };

  return (
    <>
      <section id="news" ref={sectionRef} className="py-20 md:py-32 relative bg-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-16">
            <div className="fade-in-up stagger-1">
              <h2 className="text-5xl md:text-7xl font-black mb-6">
                News & Updates
              </h2>
            </div>
            <div className="fade-in-up stagger-2">
              <p className="text-xl font-light text-gray-700 max-w-3xl mb-12">
                Latest developments in music technology, project updates, and industry insights
              </p>
            </div>

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
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>

              <div className="space-y-12">
                {paginatedNews.map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`fade-in-up stagger-${(index % 6) + 1} relative flex items-start space-x-8 group`}
                  >
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

                    <button
                      onClick={() => openDetail(item)}
                      className="flex-1 glass-card hover-lift bg-white border border-black/5 text-left w-full focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 flex overflow-hidden"
                    >
                      <div className="flex-1 p-8">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            {item.category && (
                              <span className={`px-3 py-1 text-xs tracking-wider uppercase rounded-full ${getCategoryColor(item.category)}`}>
                                {item.category.replace('_', ' ')}
                              </span>
                            )}
                            {item.publication_date && (
                              <span className="text-sm text-gray-500">
                                {format(new Date(item.publication_date), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                          {item.featured && (
                            <div className="px-2 py-1 bg-black text-white text-xs tracking-wider">
                              FEATURED
                            </div>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold mb-4 group-hover:text-gray-700 transition-colors duration-300">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {item.excerpt || (item.content && item.content.substring(0, 150) + "...")}
                        </p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {item.image_urls && item.image_urls.length > 0 && (
                        <div className="hidden md:block w-48 lg:w-64 flex-shrink-0">
                          <img
                            src={item.image_urls[0]}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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

      {selectedItem && (
        <NewsDetail item={selectedItem} onClose={closeDetail} />
      )}
    </>
  );
}