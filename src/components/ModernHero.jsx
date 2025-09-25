'use client';


import React, { useEffect, useRef } from "react";

export default function ModernHero() {
  const heroRef = useRef(null);

  useEffect(() => {
    const element = heroRef.current; // Capture the current ref value
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) { // Use the captured value for cleanup
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <section id="home" ref={heroRef} className="relative z-20 min-h-screen flex items-center bg-black text-white overflow-hidden">
      <div className="max-w-7xl w-full mx-auto px-6 md:px-12 py-20">
        <div className="fade-in-left stagger-1">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[8rem] font-black leading-tight tracking-tighter">
            Music<br />
            Engraving for<br />
            Composers<br />
            <span className="font-light italic">&</span> Publishers
          </h1>
        </div>
        
        <div className="fade-in-left stagger-2 mt-12 max-w-3xl">
          <p className="text-xl md:text-2xl font-light leading-relaxed text-gray-300">
            ZSCORE is a composer-led studio specializing in score engraving, 
            audio programming, and software engineering for contemporary music and performance.
          </p>
        </div>
        
        <div className="fade-in-left stagger-3 flex items-center space-x-8 mt-12">
          <button 
            onClick={() => document.getElementById('contact').scrollIntoView({behavior: 'smooth'})}
            className="bg-white text-black px-10 py-4 hover:bg-gray-200 transition-all duration-300 tracking-wider font-bold"
          >
            START PROJECT
          </button>
          
          <button 
            onClick={() => document.getElementById('portfolio').scrollIntoView({behavior: 'smooth'})}
            className="border border-white px-10 py-4 hover:bg-white hover:text-black transition-all duration-300 tracking-wider"
          >
            VIEW WORK
          </button>
        </div>
      </div>
    </section>
  );
}