'use client';

import React, { useState, useEffect } from "react";

/**
 * A modern, multi-part header component for the ZSCORE application.
 * It includes a full-screen hero section with an animated background, 
 * a sticky navigation bar that appears on scroll, and a mobile menu.
 * @param {{
 *   activeSection: string;
 *   onSectionChange: (sectionId: string) => void;
 * }} props
 */
export default function ModernHeader({ activeSection, onSectionChange }) {
  // State to track if the user has scrolled down the page
  const [isScrolled, setIsScrolled] = useState(false);
  // State for toggling the mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // State to store the current vertical scroll position
  const [scrollY, setScrollY] = useState(0);
  // State for the number of staff lines in the background animation
  const [staffCount, setStaffCount] = useState(20);

  const sections = [
    { id: "home", label: "Home" },
    { id: "services", label: "Services" },
    { id: "portfolio", label: "Portfolio" },
    { id: "news", label: "Feed" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" }
  ];

  // Effect to dynamically calculate the number of staff lines needed
  // to cover the screen width when rotated, ensuring a seamless background.
  useEffect(() => {
    const calculateStaffCount = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate how many staves are needed to cover the screen width if rotated 90 degrees.
      const calculatedStaffCount = Math.ceil(viewportWidth / (viewportHeight * 0.08));
      
      // Ensure a minimum of 20 staves and add a safety multiplier for full coverage.
      setStaffCount(Math.max(20, calculatedStaffCount * 2));
    };

    calculateStaffCount(); // Initial calculation
    window.addEventListener('resize', calculateStaffCount); // Recalculate on resize
    
    return () => window.removeEventListener('resize', calculateStaffCount);
  }, []);

  // Effect to handle scroll events for showing/hiding the sticky nav
  // and updating the scrollY position for animations.
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 100);
      setScrollY(currentScrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /**
   * Smoothly scrolls the page to a specific section by its ID and updates the URL hash.
   * @param {string} sectionId The ID of the element to scroll to.
   */
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Update URL hash first
      if (sectionId === 'home') {
        window.history.pushState(null, null, window.location.pathname);
      } else {
        window.history.pushState(null, null, `#${sectionId}`);
      }
      
      element.scrollIntoView({ behavior: "smooth" });
      onSectionChange(sectionId); // Update the active section state
    }
  };

  /**
   * Handles link clicks within the mobile menu, scrolling to the section
   * and then closing the menu.
   * @param {string} sectionId The ID of the element to scroll to.
   */
  const handleMobileLinkClick = (sectionId) => {
    scrollToSection(sectionId);
    setIsMobileMenuOpen(false);
  };

  // Calculate scroll progress (0 to 1) over the first viewport height
  // to drive the background rotation and line opacity animations.
  const scrollProgress = Math.min(scrollY / window.innerHeight, 1);

  return (
    <>
      {/* Full-screen Hero Header Section */}
      <header className="relative z-20 bg-white min-h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden">
        {/* Animated Sheet Music Background */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `rotate(${scrollProgress * 360}deg) scale(1.2)`,
            transformOrigin: 'center center',
            transition: 'none' // Animation is driven by scroll, not CSS transitions
          }}
        >
          <div className="w-full h-full relative">
            {/* Dynamically render the calculated number of staff lines */}
            {Array.from({ length: staffCount }).map((_, staffIndex) => (
              <div
                key={staffIndex}
                className="absolute w-full"
                style={{ top: `${staffIndex * 8 - 50}%`, height: '3%' }}
              >
                {/* Each staff has 5 lines */}
                {Array.from({ length: 5 }).map((_, lineIndex) => (
                  <div
                    key={lineIndex}
                    className="absolute w-full"
                    style={{
                      top: `${lineIndex * 25}%`,
                      height: '1px',
                      left: '-50%',
                      width: '200%',
                      // Line opacity fades in with scroll progress
                      backgroundColor: `rgba(0, 0, 0, ${scrollProgress})`
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="fade-in-up relative z-10">
          <h1 className="text-[5.5rem] sm:text-[8rem] md:text-[12rem] lg:text-[16rem] xl:text-[20rem] font-black leading-none mb-0 glitch">
            ZSCORE
          </h1>
        </div>
        
        <div className="fade-in-up stagger-2 relative z-10">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-light tracking-[0.3em] mb-8">
            THE ART OF MUSIC NOTATION
          </h2>
        </div>
        
        <div className="fade-in-up stagger-3 flex items-center mb-16 relative z-10">
          <div className="w-9 h-9 bg-black rounded-full"></div>
          <div className="w-9 h-9 border border-black rounded-full"></div>
        </div>
        
        {/* Scroll Down Indicator */}
        <div className="fade-in-up stagger-4 absolute bottom-20 inset-x-0 flex justify-center z-10">
          <div className="flex flex-col items-center space-y-4">
            <span className="text-sm tracking-wider">SCROLL TO EXPLORE</span>
            <svg 
              className="w-6 h-16 animate-pulse" 
              viewBox="0 0 10.18 30.02" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="2.48" y=".38" width=".62" height="25.11" fill="currentColor"/>
              <g>
                <path d="M5.95,25.28l-2.98,4.74-2.98-4.74h5.95Z" fill="currentColor"/>
                <path d="M10.18,5L2.77,2.46v2.88h-.29V0h.41l7.29,2.46v2.54Z" fill="currentColor"/>
              </g>
            </svg>
          </div>
        </div>
      </header>

      {/* Sticky Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-md border-b border-black/10 shadow-lg" 
          : "bg-transparent"
      }`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo appears on scroll */}
            <div className={`text-xl transition-opacity duration-300 ${
              isScrolled ? "opacity-100" : "opacity-0"
            }`}>
          <span className="font-normal">ZSCORE</span>
          <span className="font-thin">.studio</span>
            </div>
            
            {/* Desktop Navigation */}
            <ul className="hidden md:flex items-center space-x-12">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={`relative text-sm tracking-wider transition-all duration-300 hover:text-gray-600 ${
                      activeSection === section.id ? "text-black" : "text-gray-700"
                    }`}
                  >
                    {section.label}
                    {/* Active section indicator */}
                    {activeSection === section.id && (
                      <div className="absolute -bottom-1 left-0 right-0 h-px bg-black"></div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            
            {/* Mobile Menu "Hamburger" Button */}
            <button
              className="md:hidden p-2 z-[101]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div
                className={`w-6 h-px bg-black transition-all duration-300 ${
                  isMobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""
                }`}
              ></div>
              <div
                className={`w-6 h-px bg-black mt-1.5 transition-all duration-300 ${
                  isMobileMenuOpen ? "opacity-0" : ""
                }`}
              ></div>
              <div
                className={`w-6 h-px bg-black mt-1.5 transition-all duration-300 ${
                  isMobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""
                }`}
              ></div>
            </button>
          </div>
        </div>
      </nav>

      {/* Full-screen Mobile Menu Panel */}
      <div
        className={`fixed inset-0 bg-white z-[99] transform transition-transform duration-500 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <ul className="flex flex-col items-center space-y-8">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => handleMobileLinkClick(section.id)}
                  className="text-3xl font-light tracking-wider"
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}