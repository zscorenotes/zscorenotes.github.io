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
    <section id="home" ref={heroRef} className="relative min-h-screen flex items-center bg-black text-white overflow-hidden">
      <div className="max-w-7xl w-full mx-auto px-6 md:px-12 py-20">
        <div className="fade-in-left stagger-1">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] font-black leading-tight tracking-tighter">
           Publisher-ready music materials
          </h1>
        </div>

        <div className="fade-in-left stagger-2 mt-12 max-w-3xl">
          <ul className="space-y-4 text-xl md:text-2xl font-light text-gray-300">
            {['Editorial preparation', 'Performance materials', 'Publication delivery'].map((item, i) => (
              <li key={i} className="flex items-center gap-4 group">
                <div className="relative w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {/* Whole note (open) - default */}
                  <svg
                    className="w-5 h-4 text-gray-400 group-hover:text-white group-hover:opacity-0 transition-all duration-300"
                    viewBox="0 0 29.57 24.15"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.25,0c6.57,0,10.32,3.32,10.32,8.57,0,10.32-13.47,15.57-18.98,15.57-6.3,0-10.59-3.24-10.59-8.57C0,7.7,9.62,0,19.25,0ZM22.31,3.94c-1.06,0-18.72,10.22-18.72,12.16,0,1.77,1.92,4.11,3.5,4.11,1.15,0,18.98-10.4,18.98-12.16,0-1.24-2.01-4.11-3.76-4.11Z"
                      fill="currentColor"
                    />
                  </svg>
                  {/* Filled note - on hover */}
                  <svg
                    className="absolute bottom-0 w-5 h-4 text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
                    viewBox="0 0 28.61 23.47"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M28.61,8.26c0,9.04-11.13,15.21-18.87,15.21-4.96,0-9.74-3.3-9.74-8.26C0,6.26,11.12,0,18.87,0c5.57,0,9.74,3.22,9.74,8.26Z" fill="currentColor"/>
                  </svg>
                </div>
                <span className="group-hover:text-white transition-colors duration-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="fade-in-left stagger-3 flex items-center space-x-8 mt-12">
          <button 
            onClick={() => document.getElementById('contact').scrollIntoView({behavior: 'smooth'})}
            className="bg-white text-black px-10 py-4 hover:bg-gray-200 transition-all duration-300 tracking-wider font-bold"
          >
            START PROJECT
          </button>
          
          <a
            href="/portfolio"
            className="border border-white px-10 py-4 hover:bg-white hover:text-black transition-all duration-300 tracking-wider inline-block"
          >
            selected work
          </a>
        </div>
      </div>
    </section>
  );
}