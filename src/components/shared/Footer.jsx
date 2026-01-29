import React from "react";

/**
 * Shared Footer component used across all pages for consistency.
 */
export default function Footer({ className = "" }) {
  return (
    <footer className={`py-16 border-t border-black/10 text-center bg-white ${className}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h3 className="text-2xl font-black mb-2">
            <span className="font-normal">ZSCORE</span>
            <span className="font-extralight">.studio</span>
          </h3>
          <p className="text-gray-600 font-sans">The Art of Music Notation</p>
        </div>

        <div className="flex justify-center space-x-8 text-sm text-gray-600 font-sans">
          <span>&copy; 2026 ZSCORE.studio</span>
          <span>Professional Music Engraving</span>
          <span>Built with ♡ by composers</span>
        </div>
      </div>
    </footer>
  );
}
