'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";

export default function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Listen for custom scroll progress events from HomePage
    const handleScrollProgress = (event) => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(100, (scrollTop / docHeight) * 100));
      setScrollProgress(progress);
    };

    // Initial calculation
    handleScrollProgress();

    // Listen for custom events instead of direct scroll events
    window.addEventListener('zscore-scroll-update', handleScrollProgress);
    
    return () => {
      window.removeEventListener('zscore-scroll-update', handleScrollProgress);
    };
  }, []);

  return (
    <div 
      className="progress-bar"
      style={{ 
        width: `${scrollProgress}%`,
        transform: `translateZ(0)`,
        willChange: 'width'
      }}
    />
  );
}