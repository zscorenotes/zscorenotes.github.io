'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from '@/components/shared/Footer';
import { getCategoryColorSSR } from '@/utils/categoryColorsSSR';

/**
 * Materials Listing Page
 * Displays all material/service offerings
 */
export default function MaterialsListingPage({ initialServices = [], initialCategories = null }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-black text-white">
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          <p className="text-sm font-medium tracking-widest uppercase mb-6 text-gray-400">
            What We Deliver
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-8">
            Materials
          </h1>
          <p className="text-lg md:text-xl font-light text-gray-300 max-w-xl">
            Preparation of contemporary music materials for performance and publication.
          </p>
        </div>
      </section>

      {/* Materials List */}
      <section className="py-16 md:py-24">
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          <div className="space-y-0">
            {initialServices.map((service) => (
              <div
                key={service.id}
                className="border-b border-gray-200 first:border-t"
              >
                <div className="py-10 md:py-14 flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16">
                  {/* Image */}
                  {service.image_urls && service.image_urls.length > 0 && (
                    <div className="w-full md:w-72 lg:w-80 flex-shrink-0">
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={service.image_urls[0]}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-3">
                      <span className={`inline-block px-3 py-1 text-xs tracking-wider uppercase rounded-full ${getCategoryColorSSR(service.category, 'services', initialCategories)}`}>
                        {service.category}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight tracking-tight">
                      {service.title}
                    </h2>
                    {service.description && (
                      <p className="text-gray-600 leading-relaxed text-lg max-w-2xl">
                        {service.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {initialServices.length === 0 && (
            <div className="text-center py-24">
              <p className="text-xl font-medium text-gray-600">No materials found</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
