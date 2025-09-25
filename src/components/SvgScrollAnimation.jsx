import React, { useEffect, useRef, useState } from 'react';
import mainSVG from '@/assets/main.svg'
/**
 * A complex component that manages a scroll-driven SVG animation.
 * It fetches an external SVG, parses it, and animates its child elements
 * based on the user's scroll position.
 * @param {{
 *   scrollProgress: number; // A value from 0 to 1 representing scroll progress
 *   isVisible: boolean;      // Controls the opacity of the animation container
 * }} props
 */
export default function SvgScrollAnimation({ scrollProgress, isVisible }) {
  // State to store the fetched SVG content as text
  const [svgContent, setSvgContent] = useState(null);
  // Ref to the container div where the SVG will be injected
  const svgContainerRef = useRef(null);
  // Ref to store data about each animatable element in the SVG
  const animationDataRef = useRef([]);
  // State to track if the SVG has been parsed and is ready for animation
  const [isReady, setIsReady] = useState(false);
  // State to hold the responsive transform style for the SVG container
  const [transformStyle, setTransformStyle] = useState('');

  // 1. Fetch the SVG content from the URL once on component mount.
  useEffect(() => {
    const svgUrl = mainSVG;
    fetch(svgUrl)
      .then(response => response.ok ? response.text() : Promise.reject('Network response was not ok'))
      .then(data => setSvgContent(data))
      .catch(error => console.error('Error fetching SVG:', error));
  }, []); // Empty dependency array ensures this runs only once

  // 2. When SVG content is available, parse it and prepare the elements for animation.
  useEffect(() => {
    if (!svgContent || !svgContainerRef.current) return;

    animationDataRef.current = [];
    
    try {
      // Parse the SVG string into a DOM object
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;
      
      // Inject the parsed SVG into the container
      svgContainerRef.current.innerHTML = '';
      const importedSvg = document.importNode(svgElement, true);
      svgContainerRef.current.appendChild(importedSvg);
      
      // A short timeout allows the browser to render the SVG before we query its elements.
      const timeoutId = setTimeout(() => {
        const elementsToAnimate = svgContainerRef.current.querySelectorAll(
          'g path, g rect, g circle, g ellipse, g line, g polyline, g polygon, image'
        );
        
        if (elementsToAnimate.length === 0) {
            console.warn("SVG Animation Warning: No elements found to animate.");
        }
        
        // Store data for each element, including its original transform and a random start offset.
        animationDataRef.current = Array.from(elementsToAnimate).map((element) => ({
          element,
          originalTransform: element.getAttribute('transform') || '',
          startYOffset: -((Math.random() * 3900) + 100), // Random vertical offset
          startXOffset: 0
        }));

        setIsReady(true); // Signal that animation can begin
      }, 300);

      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.error('Error parsing or appending SVG:', error);
    }
  }, [svgContent]); // Re-run if svgContent changes

  // 3. Animate the SVG elements based on the scrollProgress prop.
  // This effect runs on every scroll update.
  useEffect(() => {
    if (!isReady || !isVisible) return;

    requestAnimationFrame(() => {
      animationDataRef.current.forEach(data => {
        const { element, originalTransform, startXOffset, startYOffset } = data;
        const progress = scrollProgress || 0;
        
        // As progress goes from 0 to 1, the offset goes from its starting value to 0.
        const currentY = startYOffset * (1 - progress);
        
        // Apply the new transform to the element
        element.setAttribute('transform', `${originalTransform} translate(0, ${currentY})`);
      });
    });
  }, [scrollProgress, isReady, isVisible]); // Re-run when scroll or visibility changes

  // 4. Calculate a responsive transform for the main SVG container to fit different screen sizes.
  useEffect(() => {
    const mapRange = (value, inMin, inMax, outMin, outMax) => {
      const t = (value - inMin) / (inMax - inMin);
      const clampedT = Math.max(0, Math.min(1, t));
      return outMin * (1 - clampedT) + outMax * clampedT;
    };

    const calculateTransform = () => {
      const screenWidth = window.innerWidth;
      const minWidth = 375;
      const maxWidth = 1920;

      // Map screen width to appropriate scale and translation values
      const scale = mapRange(screenWidth, minWidth, maxWidth, 8, 2.5);
      const translateY = mapRange(screenWidth, minWidth, maxWidth, -2, -10);
      const translateX = mapRange(screenWidth, minWidth, maxWidth, 5, 10);
      
      setTransformStyle(`scale(${scale}) translateY(${translateY}%) translateX(${translateX}%)`);
    };

    calculateTransform();
    window.addEventListener('resize', calculateTransform);
    return () => window.removeEventListener('resize', calculateTransform);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 10,
        pointerEvents: 'none',
        opacity: isVisible && isReady ? 1 : 0, // Fade in/out
        transition: 'opacity 0.3s ease-in-out',
      }}
    >
      <div
        ref={svgContainerRef}
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: transformStyle, // Apply the responsive transform
          transformOrigin: 'center center'
        }}
      />
    </div>
  );
}