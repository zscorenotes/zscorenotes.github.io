'use client';

import React, { useState, useEffect, useRef } from "react";
import ServiceDetail from "./services/ServiceDetail";
import * as ContentManager from '@/lib/content-manager-clean';
import { getCategoryColorSync } from '@/utils/categoryColors';

export default function ModernServices() {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const sectionRef = useRef(null);
  const serviceItemRefs = useRef([]);

  useEffect(() => {
    loadServices();
  }, []);

  // Effect to listen for content updates from admin panel
  useEffect(() => {
    const handleContentUpdate = (event) => {
      const { contentType } = event.detail;
      if (contentType === 'services') {
        console.log('Services content updated, reloading...');
        loadServices();
      }
    };

    const handleCategoriesLoaded = () => {
      console.log('Categories loaded, forcing re-render...');
      // Force a re-render by updating state
      setServices(prevServices => [...prevServices]);
    };

    window.addEventListener('zscore-content-updated', handleContentUpdate);
    window.addEventListener('zscore-categories-loaded', handleCategoriesLoaded);
    
    return () => {
      window.removeEventListener('zscore-content-updated', handleContentUpdate);
      window.removeEventListener('zscore-categories-loaded', handleCategoriesLoaded);
    };
  }, []);

  const loadServices = async () => {
    try {
      const contentData = await ContentManager.getAllContent();
      let serviceData = contentData.services || [];
      
      // Sort by order field (ascending), fallback to creation date
      serviceData.sort((a, b) => {
        // If both have order, sort by order
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        // If only one has order, prioritize it
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        
        // If neither has order, sort by creation date (newest first)
        const dateA = new Date(a.created_at || a.created_date || 0);
        const dateB = new Date(b.created_at || b.created_date || 0);
        return dateB - dateA;
      });
      
      setServices(serviceData);
    } catch (error) {
      console.error("Error loading services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to handle the scroll-driven animation of the note stem on each service card.
  // The stem grows in height as the card enters the viewport.
  useEffect(() => {
    if (isLoading) return; // Don't run if data is not yet loaded

    const handleScroll = () => {
      serviceItemRefs.current.forEach(item => {
        if (!item) return;

        const stem = item.querySelector('.note-stem');
        if (!stem) return;

        const rect = item.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Define the trigger zone for the animation (middle 75% of the viewport)
        const triggerStart = viewportHeight;
        const triggerEnd = viewportHeight * 0.25;
        const triggerRange = triggerStart - triggerEnd;

        // Calculate animation progress (0 to 1) as the item scrolls through the trigger zone
        const progress = (triggerStart - rect.top) / triggerRange;
        const clampedProgress = Math.max(0, Math.min(1, progress));

        // Animate the stem's height based on the scroll progress
        const newHeight = clampedProgress * 90; // Max height of 90px
        stem.style.height = `${newHeight}px`;
      });
    };

    handleScroll(); // Initial check on load
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isLoading]); // Re-run effect if loading state changes

  // Effect for the one-time fade-in animation of the entire section when it becomes visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target); // Animate only once
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if(sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  /**
   * Opens the detail modal for a given service.
   * @param {object} service The service object to display.
   */
  const openServiceDetail = async (service) => {
    try {
      const serviceWithHTML = await ContentManager.getContentWithHTML('services', service.id);
      setSelectedService(serviceWithHTML);
    } catch (error) {
      console.error('Error loading service content:', error);
      setSelectedService(service); // Fallback to metadata-only
    }
  };

  /**
   * Closes the service detail modal.
   */
  const closeServiceDetail = () => {
    setSelectedService(null);
  };

  /**
   * Gets the color class for a service category
   */
  const getCategoryColor = (category) => {
    return getCategoryColorSync(category, 'services');
  };

  return (
    <>
      <section id="services" ref={sectionRef} className="py-20 md:py-32 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-20">
          <div className="fade-in-up stagger-1">
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              Core Services
            </h2>
            <p className="text-xl font-light text-gray-600 max-w-3xl">
              Comprehensive solutions for contemporary music notation, and engraving, combining deep musical knowledge with custom technical workflows.
            </p>
          </div>
        </div>
          
        {isLoading ? (
          <div className="space-y-8 max-w-7xl mx-auto px-6 md:px-12">
            {/* Loading skeleton placeholders */}
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-64 w-full"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service, index) => (
              <button
                key={service.id} 
                ref={el => serviceItemRefs.current[index] = el}
                onClick={() => openServiceDetail(service)}
                className={`fade-in-up stagger-${(index % 4) + 1} border-y border-gray-300 group w-full text-left hover:bg-gray-50 transition-colors duration-300 focus:outline-none focus:bg-gray-50 relative overflow-hidden`}
                aria-label={`Learn more about ${service.title}`}
              >
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12 relative">
                  {/* Service Image - Positioned absolutely within the card container */}
                  {service.image_urls && service.image_urls.length > 0 && (
                    <div className="absolute top-0 right-0 w-full md:w-80 lg:w-96 h-full">
                      <img 
                        src={service.image_urls[0]} 
                        alt={service.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-15 md:opacity-100"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-8 md:pr-80 lg:pr-96 relative z-10">
                    <div className="flex items-center justify-center flex-shrink-0">
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        {/* The note stem, animated via JS */}
                        <div 
                          className="note-stem absolute bottom-[24px] left-[39px] w-px bg-black group-hover:bg-gray-700 transition-colors duration-300"
                          style={{ height: '0px', transition: 'height 0.3s ease-out' }}
                        ></div>
                        
                        {/* Initial State SVG (whole note), fades out on hover */}
                        <svg 
                          className="w-8 h-7 text-black group-hover:text-gray-700 transition-all duration-300 opacity-100 group-hover:opacity-0" 
                          viewBox="0 0 29.57 24.15" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            d="M19.25,0c6.57,0,10.32,3.32,10.32,8.57,0,10.32-13.47,15.57-18.98,15.57-6.3,0-10.59-3.24-10.59-8.57C0,7.7,9.62,0,19.25,0ZM22.31,3.94c-1.06,0-18.72,10.22-18.72,12.16,0,1.77,1.92,4.11,3.5,4.11,1.15,0,18.98-10.4,18.98-12.16,0-1.24-2.01-4.11-3.76-4.11Z" 
                            fill="currentColor"
                          />
                        </svg>

                        {/* Hover State SVG (filled note), fades in on hover */}
                        <svg 
                          className="absolute w-8 h-7 text-black transition-all duration-300 opacity-0 group-hover:opacity-100" 
                          viewBox="0 0 28.61 23.47" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M28.61,8.26c0,9.04-11.13,15.21-18.87,15.21-4.96,0-9.74-3.3-9.74-8.26C0,6.26,11.12,0,18.87,0c5.57,0,9.74,3.22,9.74,8.26Z" fill="currentColor"/>
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-4">
                        <span className={`inline-block px-3 py-1 text-xs tracking-wider uppercase rounded-full ${getCategoryColor(service.category)}`}>
                          {service.category}
                        </span>
                      </div>
                      <h3 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        {service.title}
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-lg mb-4">
                        {service.description}
                      </p>
                      <div className="text-sm text-gray-500">
                        Click to learn more →
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* The detail modal, rendered conditionally when a service is selected */}
      {selectedService && (
        <ServiceDetail service={selectedService} onClose={closeServiceDetail} />
      )}
    </>
  );
}
