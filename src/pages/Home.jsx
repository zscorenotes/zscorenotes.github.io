import React, { useState, useEffect, useRef } from "react";
import ScrollProgress from "../components/ScrollProgress";
import SectionIndicator from "../components/SectionIndicator";
import ModernHeader from "../components/ModernHeader";
import ModernHero from "../components/ModernHero";
import SvgScrollAnimation from "../components/SvgScrollAnimation";
import ModernServices from "../components/ModernServices";
import ModernPortfolio from "../components/ModernPortfolio";
import ModernNews from "../components/ModernNews";
import ModernAbout from "../components/ModernAbout";
import ModernContact from "../components/ModernContact";
import MetaManager from '../components/seo/MetaManager';

/**
 * The main landing page for the ZSCORE application.
 * This component orchestrates the entire single-page layout, manages section-based navigation,
 * and controls the visibility and progress of scroll-based animations.
 */
export default function Home() {
  // State to track the currently active section for navigation highlighting
  const [activeSection, setActiveSection] = useState("home");

  // State to track the scroll progress (0 to 1) for the main SVG animation
  const [scrollProgress, setScrollProgress] = useState(0);

  // State to determine if the SVG animation is currently visible in the viewport
  const [isAnimationVisible, setIsAnimationVisible] = useState(false);

  // Ref to an invisible div that acts as the trigger and scrollable area for the SVG animation
  const animationTriggerRef = useRef(null);
  
  // Defines the sections of the single-page application for navigation and observation
  const sections = [
    { id: "home", label: "Home" },
    { id: "services", label: "Services" },
    { id: "portfolio", label: "Portfolio" },
    { id: "news", label: "News" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" }
  ];

  // Effect to set up an IntersectionObserver for tracking the active section.
  // This helps highlight the correct item in the navigation menus.
  useEffect(() => {
    const observerOptions = {
      threshold: 0.3, // Section is considered active when 30% is visible
      rootMargin: "-20% 0px -20% 0px" // Narrows the intersection viewport
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    sections.forEach(({id}) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    // Cleanup the observer on component unmount
    return () => observer.disconnect();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect to handle the scroll-driven SVG animation progress.
  // Uses requestAnimationFrame for performance and is throttled.
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const triggerEl = animationTriggerRef.current;
          if (!triggerEl) {
            ticking = false;
            return;
          }

          const rect = triggerEl.getBoundingClientRect();
          const triggerTop = rect.top + window.scrollY;
          const triggerHeight = triggerEl.offsetHeight;
          const viewportHeight = window.innerHeight;
          const scrollY = window.scrollY;

          // Check if the trigger element is within the animation viewport range
          if (scrollY > triggerTop - viewportHeight * 1.12 && scrollY < triggerTop + triggerHeight) {
            // Calculate the overall progress of scrolling through the trigger zone
            const overallProgress = Math.max(0, Math.min(1, (scrollY - (triggerTop - viewportHeight * 1.12)) / (triggerHeight - viewportHeight / 2)));
            // The animation should complete when the scroll is 98% through the zone
            const convergenceProgress = Math.min(1, overallProgress / 0.98);
            setScrollProgress(convergenceProgress);

            // Fade out the animation in the last 2% of the scroll
            if (overallProgress > 0.98) {
              const fadeProgress = (overallProgress - 0.98) / 0.1;
              setIsAnimationVisible(1 - fadeProgress > 0);
            } else {
              setIsAnimationVisible(true);
            }
          } else {
            setIsAnimationVisible(false);
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check on load

    // Cleanup the scroll listener
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div className="min-h-screen bg-white text-black relative">
      {/* Manages all SEO-related meta tags and document head information */}
      <MetaManager activeSection={activeSection} />

      {/* The main scroll-driven SVG animation component */}
      <SvgScrollAnimation scrollProgress={scrollProgress} isVisible={isAnimationVisible} />
      
      {/* A thin progress bar at the top of the page */}
      <ScrollProgress />

      {/* The fixed-position dot navigation on the right side */}
      <SectionIndicator activeSection={activeSection} sections={sections} />
      
      {/* The main header, including the hero section and the sticky navigation bar */}
      <ModernHeader activeSection={activeSection} onSectionChange={setActiveSection} />
      
      {/* The first content section after the header */}
      <ModernHero />
      
      {/* This is an invisible, tall div that provides the scrollable height 
          needed to drive the SvgScrollAnimation. The animation plays as the
          user scrolls through this element. */}
      <div ref={animationTriggerRef} className="h-[250vh]" />

      {/* All subsequent content sections of the page */}
      <ModernServices />
      <ModernPortfolio />
      <ModernNews />
      <ModernAbout />
      <ModernContact />
      
      {/* Footer section at the bottom of the page */}
      <footer className="py-16 border-t border-black/10 text-center">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
          <h3 className="text-2xl font-black mb-2">
          <span className="font-normal">ZSCORE</span>
          <span className="font-extralight">.studio</span>
          </h3>
            <p className="text-gray-600 font-sans">The Art of Music Notation</p>
          </div>
          
          <div className="flex justify-center space-x-8 text-sm text-gray-600 font-sans">
            <span>&copy; 2025 ZSCORE</span>
            <span>Professional Music Engraving</span>
            <span>Built with ♡ by a Composer</span>
          </div>
        </div>
      </footer>
    </div>
  );
}