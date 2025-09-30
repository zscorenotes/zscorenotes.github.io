'use client';

import React, { useState, useEffect, useRef } from "react";
import ScrollProgress from "./ScrollProgress";
import SectionIndicator from "./SectionIndicator";
import ModernHeader from "./ModernHeader";
import ModernHero from "./ModernHero";
import SvgScrollAnimation from "./SvgScrollAnimation";
import ModernServices from "./ModernServices";
import ModernPortfolio from "./ModernPortfolio";
import ModernNews from "./ModernNews";
import ModernAbout from "./ModernAbout";
import ModernContact from "./ModernContact";
import MetaManager from './seo/MetaManager';
import AdminPanel from './AdminPanel';
import { Toaster } from "./ui/toaster";
import { Settings, Eye, Edit } from "lucide-react";

/**
 * The main landing page for the ZSCORE application.
 * This component orchestrates the entire single-page layout, manages section-based navigation,
 * and controls the visibility and progress of scroll-based animations.
 */
export default function HomePage({ initialContent, initialCategories }) {
  // State to track the currently active section for navigation highlighting
  const [activeSection, setActiveSection] = useState("home");

  // State to track the scroll progress (0 to 1) for the main SVG animation
  const [scrollProgress, setScrollProgress] = useState(0);

  // State to determine if the SVG animation is currently visible in the viewport
  const [isAnimationVisible, setIsAnimationVisible] = useState(false);

  // Admin panel state
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminMode, setAdminMode] = useState('view'); // 'view', 'edit'
  const [contentRefreshKey, setContentRefreshKey] = useState(0);

  // Ref to an invisible div that acts as the trigger and scrollable area for the SVG animation
  const animationTriggerRef = useRef(null);
  
  // Defines the sections of the single-page application for navigation and observation
  const sections = [
    { id: "home", label: "Home" },
    { id: "services", label: "Services" },
    { id: "portfolio", label: "Portfolio" },
    { id: "feed", label: "Feed" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" }
  ];

  // Simple hash navigation - just simulate user clicks
  const handleItemHashNavigation = (hash) => {
    console.log('🚀 Simple hash navigation for:', hash);
    
    // Remove the # and split by /
    const cleanHash = hash.replace('#', '');
    const parts = cleanHash.split('/');
    const sectionId = parts[0]; // e.g., 'services'
    const itemSlug = parts[1];  // e.g., 'services_1758953213743_jihndpy8e'
    
    console.log('🔍 Parsed:', { cleanHash, parts, sectionId, itemSlug });
    console.log('🔍 Available content:', { 
      services: initialContent?.services?.length || 0,
      portfolio: initialContent?.portfolio?.length || 0 
    });
    
    // Step 1: Simulate clicking on navbar section (scroll to section)
    setTimeout(() => {
      const sectionElement = document.getElementById(sectionId);
      if (sectionElement) {
        console.log('✅ Section found, scrolling to:', sectionId);
        sectionElement.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(sectionId);
      } else {
        console.warn('❌ Section not found:', sectionId);
      }
    }, 100);

    // Step 2: If there's an item slug, simulate clicking on that specific item
    if (itemSlug) {
      console.log('🔍 Looking for item with slug/id:', itemSlug);
      
      // Find the item in initial content (SSR already loaded everything)
      let targetItem = null;
      
      if (sectionId === 'services') {
        targetItem = initialContent?.services?.find(s => {
          console.log('🔍 Checking service:', s.id, s.title);
          return s.id === itemSlug || s.slug === itemSlug;
        });
      } else if (sectionId === 'portfolio') {
        targetItem = initialContent?.portfolio?.find(p => {
          console.log('🔍 Checking portfolio:', p.id, p.title);
          return p.id === itemSlug || p.slug === itemSlug;
        });
      }

      console.log('🎯 Target item found:', targetItem?.title || 'NONE');

      if (targetItem) {
        // Simply dispatch the event - just like a user click
        const eventName = sectionId === 'services' ? 'zscore-open-service' : 'zscore-open-portfolio';
        const detail = sectionId === 'services' ? { service: targetItem } : { portfolioItem: targetItem };
        
        console.log('📡 Dispatching event:', eventName, 'with item:', targetItem.title);
        
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent(eventName, { detail }));
        }, 1000); // Wait for components to be ready
      } else {
        console.warn('❌ Item not found for slug:', itemSlug);
      }
    }
  };

  // Effect to handle initial URL hash navigation (critical for SEO and deep linking)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // IMMEDIATE hash check for search engines and direct links
    const hash = window.location.hash;
    
    if (!hash || hash === '#') {
      // No hash - start at top
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
      return;
    }

    console.log('🔗 Initial hash detected:', hash);

    // Handle different hash patterns
    if (hash === '#feed') {
      // Navigate back to feed section
      setTimeout(() => {
        const feedSection = document.getElementById('feed');
        if (feedSection) {
          feedSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      // Clean up the hash without affecting browser history
      window.history.replaceState(null, '', window.location.pathname);
      
    } else if (hash === '#admin' && process.env.NODE_ENV === 'development') {
      // Show admin panel (development only)
      setShowAdmin(true);
      window.history.replaceState(null, '', window.location.pathname);
      
    } else if (hash.startsWith('#services/') || hash.startsWith('#portfolio/')) {
      // CRITICAL: Handle individual item URLs for SEO
      console.log('🎯 Deep link detected, handling item navigation:', hash);
      handleItemHashNavigation(hash);
      
    } else if (hash.startsWith('#')) {
      // Handle section navigation (#services, #portfolio, etc.)
      const sectionId = hash.replace('#', '');
      console.log('📍 Section navigation:', sectionId);
      
      setTimeout(() => {
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: 'smooth' });
          setActiveSection(sectionId);
        }
      }, 100);
    }
  }, []); // Empty dependency array = runs only once on mount

  // Effect to handle keyboard shortcuts for admin access (development only)
  useEffect(() => {
    // Only enable admin panel in development mode
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const handleKeyboard = (e) => {
      // Ctrl/Cmd + Shift + A to toggle admin panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdmin(!showAdmin);
      }
      // Escape to close admin panel
      if (e.key === 'Escape' && showAdmin) {
        setShowAdmin(false);
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [showAdmin]);

  // Effect to listen for content updates from admin panel
  useEffect(() => {
    const handleContentUpdate = (e) => {
      setContentRefreshKey(prev => prev + 1);
      // Optional: show a toast notification
      console.log('Content updated:', e.detail);
    };

    window.addEventListener('zscore-content-updated', handleContentUpdate);
    return () => window.removeEventListener('zscore-content-updated', handleContentUpdate);
  }, []);

  // Separate hash URL updates from scroll performance
  useEffect(() => {
    let hashUpdateTimer = null;
    
    const updateHashDelayed = (sectionId) => {
      clearTimeout(hashUpdateTimer);
      hashUpdateTimer = setTimeout(() => {
        const newHash = sectionId === 'home' ? '' : `#${sectionId}`;
        if (window.location.hash !== newHash) {
          window.history.replaceState(null, null, newHash || window.location.pathname);
        }
      }, 500); // Only update hash after user stops scrolling for 500ms
    };

    // Watch activeSection changes and update hash accordingly
    updateHashDelayed(activeSection);

    return () => clearTimeout(hashUpdateTimer);
  }, [activeSection]);

  // Handle initial hash URL and browser navigation
  useEffect(() => {
    const handleInitialHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash && sections.find(section => section.id === hash)) {
        const element = document.getElementById(hash);
        if (element) {
          setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      }
    };

    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && sections.find(section => section.id === hash)) {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (!hash) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    handleInitialHash();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Single consolidated scroll handler for animations and section tracking
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const viewportHeight = window.innerHeight;
          
          // Handle section tracking (but don't update hash here)
          let currentSection = 'home';
          sections.forEach(({id}) => {
            const element = document.getElementById(id);
            if (element) {
              const rect = element.getBoundingClientRect();
              const elementTop = rect.top + scrollY;
              
              if (scrollY >= elementTop - viewportHeight / 2) {
                currentSection = id;
              }
            }
          });
          setActiveSection(currentSection);

          // Handle SVG animation progress
          const triggerEl = animationTriggerRef.current;
          if (triggerEl) {
            const rect = triggerEl.getBoundingClientRect();
            const triggerTop = rect.top + scrollY;
            const triggerHeight = triggerEl.offsetHeight;

            if (scrollY > triggerTop - viewportHeight * 1.12 && scrollY < triggerTop + triggerHeight) {
              const overallProgress = Math.max(0, Math.min(1, (scrollY - (triggerTop - viewportHeight * 1.12)) / (triggerHeight - viewportHeight / 2)));
              const convergenceProgress = Math.min(1, overallProgress / 0.98);
              setScrollProgress(convergenceProgress);

              if (overallProgress > 0.98) {
                const fadeProgress = (overallProgress - 0.98) / 0.1;
                setIsAnimationVisible(1 - fadeProgress > 0);
              } else {
                setIsAnimationVisible(true);
              }
            } else {
              setIsAnimationVisible(false);
            }
          } else {
            setIsAnimationVisible(false);
          }

          // Emit custom event for ScrollProgress component
          window.dispatchEvent(new CustomEvent('zscore-scroll-update'));
          
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show admin panel if requested (development only)
  if (showAdmin && process.env.NODE_ENV === 'development') {
    return <AdminPanel />;
  }

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
      <div className="relative z-50">
        <ModernHeader activeSection={activeSection} onSectionChange={setActiveSection} />
        
        {/* The first content section after the header */}
        <ModernHero key={`hero-${contentRefreshKey}`} />
      </div>
      
      {/* This is an invisible, tall div that provides the scrollable height 
          needed to drive the SvgScrollAnimation. The animation plays as the
          user scrolls through this element. */}
      <div ref={animationTriggerRef} className="h-[250vh]" />

      {/* All subsequent content sections of the page */}
      <div className="relative z-10">
        <ModernServices key={`services-${contentRefreshKey}`} initialServices={initialContent?.services} initialCategories={initialCategories} />
        <ModernPortfolio key={`portfolio-${contentRefreshKey}`} initialPortfolio={initialContent?.portfolio} initialCategories={initialCategories} />
        <ModernNews key={`news-${contentRefreshKey}`} initialNews={initialContent?.news} initialCategories={initialCategories} />
        <ModernAbout key={`about-${contentRefreshKey}`} />
        <ModernContact key={`contact-${contentRefreshKey}`} />
      </div>
      
      {/* Footer section at the bottom of the page */}
      <footer className="py-16 border-t border-black/10 text-center relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <h3 className="text-2xl font-black mb-2">
              <span className="font-normal">ZSCORE</span>
              <span className="font-extralight">.studio</span>
            </h3>
            <p className="text-gray-600 font-sans">The Art of Music Notation</p>
          </div>
          
          <div className="flex justify-center space-x-8 text-sm text-gray-600 font-sans">
            <span>&copy; 2025 ZSCORE.studio</span>
            <span>Professional Music Engraving</span>
            <span>Built with ♡ by a Composer</span>
          </div>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
}