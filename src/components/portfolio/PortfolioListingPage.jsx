'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Footer from '@/components/shared/Footer';

/**
 * Portfolio Listing Page
 * Displays 3 curated category pages: Orchestral, Ensemble, Solo
 */
export default function PortfolioListingPage({ initialPortfolio = [] }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const generateSlug = (item) => {
    return item.slug || item.id || item.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'portfolio-item';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm" : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="w-[90%] max-w-7xl mx-auto px-6">
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
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-black text-white">
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          <p className="text-sm font-medium tracking-widest uppercase mb-6 text-gray-400">
            Selected Works
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-8">
            Portfolio
          </h1>
          <p className="text-lg md:text-xl font-light text-gray-300 max-w-xl">
            A curated collection of music engraving.
          </p>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-16 md:py-24">
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {initialPortfolio.map((item) => {
              const slug = generateSlug(item);
              return (
                <Link
                  key={item.id}
                  href={`/portfolio/${slug}`}
                  className="group block"
                >
                  <div className="bg-white overflow-hidden border border-gray-200 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                    {/* Image */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
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
                    </div>

                    {/* Content */}
                    <div className="p-8">
                      <h2 className="text-2xl font-extrabold mb-3 leading-tight tracking-tight group-hover:text-gray-600 transition-colors" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                        {item.title}
                      </h2>
                      {item.description && (
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm font-medium text-black group-hover:gap-3 transition-all">
                        <span>Explore</span>
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Empty State */}
          {initialPortfolio.length === 0 && (
            <div className="text-center py-24">
              <p className="text-xl font-medium text-gray-600">No portfolio items found</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
