'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from '@/components/shared/Footer';

/**
 * Standalone About Page
 */
export default function AboutPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
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
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight">
            About ZSCORE
          </h1>
        </div>
      </section>

      {/* About ZSCORE */}
      <section className="py-16 md:py-24 border-b border-gray-200">
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="space-y-8 text-lg leading-relaxed text-gray-600">
              <p>
                ZSCORE is an editorial layer for contemporary music, focused on preparing materials for performance and publication.
              </p>
              <p>
                It operates between composition and use, where written scores are translated into stable, usable materials. The emphasis is on readiness, consistency, and long-term reliability across rehearsal, performance, and publishing contexts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role */}
      <section className="py-16 md:py-24 border-b border-gray-200">
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-black mb-8 tracking-tight">Role</h2>
            <div className="space-y-8 text-lg leading-relaxed text-gray-600">
              <p>
                ZSCORE functions as a technical and editorial interface.
              </p>
              <p>
                Its role is to ensure that musical materials can move reliably from composer to performer to publisher without friction. Decisions are made with downstream use in mind, rather than visual presentation or stylistic preference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Method */}
      <section className="py-16 md:py-24 border-b border-gray-200 bg-gray-50">
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-black mb-8 tracking-tight">Method</h2>
            <div className="space-y-8 text-lg leading-relaxed text-gray-600">
              <p>
                Preparation is guided by real working conditions: rehearsal timelines, performer interaction, revision cycles, and institutional requirements.
              </p>
              <p>
                Materials are shaped to remain consistent across formats, revisions, and contexts of use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Organization */}
      <section className="py-16 md:py-24 border-b border-gray-200">
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-black mb-8 tracking-tight">Organization</h2>
            <div className="space-y-8 text-lg leading-relaxed text-gray-600">
              <p>
                ZSCORE operates as a coordinated editorial environment with distributed responsibilities across preparation, review, and delivery.
              </p>
              <p>
                This structure supports continuity and reliability across projects of varying scale without dependence on individual contributors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Engagement */}
      <section className="py-16 md:py-24 border-b border-gray-200">
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-black mb-8 tracking-tight">Engagement</h2>
            <div className="space-y-8 text-lg leading-relaxed text-gray-600">
              <p>
                ZSCORE works with composers, publishers, ensembles, and institutions requiring dependable materials for professional contexts.
              </p>
              <p>
                Engagement typically spans from early preparation through final delivery for performance or publication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="py-16 md:py-24 bg-black text-white">
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-xl md:text-2xl font-medium text-gray-300">
              Prepared for use. Ready for circulation.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
