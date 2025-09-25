'use client';

import React, { useEffect } from 'react';

/**
 * A component that manages all SEO-related meta tags in the document's <head>.
 * It takes the currently active section and dynamically updates titles, descriptions,
 * canonical URLs, Open Graph tags, Twitter cards, and Schema.org JSON-LD.
 * This component does not render any visible elements.
 * @param {{ activeSection: string }} props
 */
export default function MetaManager({ activeSection }) {
  // Default and site-wide metadata
  const defaultTitle = "ZSCORE: Expert Music Engraving, Orchestration & Audio Programming";
  const defaultDescription = "ZSCORE offers professional music engraving, audio programming, and custom notation solutions for composers and publishers. Elevate your scores with our expert team.";
  const siteName = "ZSCORE Music Engraving Hub";
  const baseUrl = "https://zscore.studio"; // Using a canonical base URL for consistency
  const mainImage = "https://raw.githubusercontent.com/zscorenotes/zscorenotes.github.io/main/assets/og.png?raw=true";
  const logoUrl = "https://raw.githubusercontent.com/zscorenotes/zscorenotes.github.io/main/assets/icon.png?raw=true";

  // Per-section metadata overrides
  const metaData = {
    home: {
      title: defaultTitle,
      description: defaultDescription,
      path: '#home',
    },
    services: {
      title: "Music Engraving & Audio Programming Services | ZSCORE Studio",
      description: "Discover ZSCORE's comprehensive music services, including score engraving, orchestral parts preparation, audio programming, and detailed consultation for complex projects.",
      path: '#services',
    },
    portfolio: {
      title: "Portfolio | Music Engraving & Notation Projects by ZSCORE",
      description: "Explore a curated collection of our most impactful music engraving and audio programming projects for composers, publishers, and ensembles.",
      path: '#portfolio',
    },
    news: {
        title: "News & Updates | ZSCORE Music Technology",
        description: "Stay updated with the latest news, project announcements, and insights into music notation technology and engraving from the ZSCORE team.",
        path: '#news',
    },
    about: {
      title: "About ZSCORE | Composer-Led Engraving Studio",
      description: "Learn about ZSCORE, our philosophy, and the expert team of composers and developers dedicated to the art of contemporary music notation.",
      path: '#about',
    },
    contact: {
      title: "Contact ZSCORE | Start Your Music Notation Project",
      description: "Reach out to the ZSCORE team to discuss your music engraving or audio programming project. We're ready to bring your vision to life.",
      path: '#contact',
    }
  };

  // This effect runs whenever the activeSection changes.
  useEffect(() => {
    const currentMeta = metaData[activeSection] || metaData.home;
    const canonicalUrl = activeSection === 'home' ? baseUrl : `${baseUrl}/#${activeSection}`;

    // --- Update Standard Meta Tags ---
    document.title = currentMeta.title;
    updateMetaTag('name', 'description', currentMeta.description);
    updateLinkTag('rel', 'canonical', canonicalUrl);

    // --- Update Open Graph (Facebook, etc.) Meta Tags ---
    updateMetaTag('property', 'og:type', 'website');
    updateMetaTag('property', 'og:url', canonicalUrl);
    updateMetaTag('property', 'og:title', currentMeta.title);
    updateMetaTag('property', 'og:description', currentMeta.description);
    updateMetaTag('property', 'og:image', mainImage);
    updateMetaTag('property', 'og:site_name', siteName);

    // --- Update Twitter Card Meta Tags ---
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:url', canonicalUrl);
    updateMetaTag('name', 'twitter:title', currentMeta.title);
    updateMetaTag('name', 'twitter:description', currentMeta.description);
    updateMetaTag('name', 'twitter:image', mainImage);

    // --- Update Schema.org JSON-LD Structured Data ---
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ZSCORE",
      "url": baseUrl,
      "logo": logoUrl,
      "description": defaultDescription,
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "info@zscore.studio",
        "contactType": "Customer Service"
      },
      "sameAs": [] // Placeholder for social media links
    };
    updateSchemaTag(schemaData);

  }, [activeSection]); // Re-run this effect when the active section changes

  /**
   * Helper function to find or create a meta tag and set its content.
   * @param {string} attr - The attribute to select the tag by (e.g., 'name' or 'property').
   * @param {string} value - The value of the attribute (e.g., 'description').
   * @param {string} content - The content to set for the tag.
   */
  const updateMetaTag = (attr, value, content) => {
    let element = document.querySelector(`meta[${attr}="${value}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attr, value);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  /**
   * Helper function to find or create a link tag and set its href.
   * @param {string} rel - The 'rel' attribute value.
   * @param {string} href - The 'href' attribute value.
   */
  const updateLinkTag = (rel, href) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
          element = document.createElement('link');
          element.setAttribute('rel', rel);
          document.head.appendChild(element);
      }
      element.setAttribute('href', href);
  };

  /**
   * Helper function to find or create the schema.org script tag and set its content.
   * @param {object} schema - The JSON-LD schema object.
   */
  const updateSchemaTag = (schema) => {
    let element = document.querySelector('script[type="application/ld+json"]');
    if (!element) {
      element = document.createElement('script');
      element.setAttribute('type', 'application/ld+json');
      document.head.appendChild(element);
    }
    element.textContent = JSON.stringify(schema, null, 2);
  };

  // This component does not render anything to the DOM itself.
  return null;
}