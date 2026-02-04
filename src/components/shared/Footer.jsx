import React from "react";
import Link from "next/link";

/**
 * Shared Footer component used across all pages for consistency.
 * Follows standard German website footer conventions.
 */
export default function Footer({ className = "" }) {
  return (
    <footer className={`py-16 border-t border-black/10 bg-white ${className}`}>
      <div className="w-[85%] max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <h3 className="text-2xl font-black">
                ZSCORE<span className="font-extralight">.studio</span>
              </h3>
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed">
              Structure Before Appearance
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4">Navigation</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-black transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-black transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-gray-600 hover:text-black transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/materials" className="text-gray-600 hover:text-black transition-colors">
                  Materials
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-gray-600 hover:text-black transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-gray-600 hover:text-black transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Materials */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4">Materials</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="text-gray-600">Full Score</span>
              </li>
              <li>
                <span className="text-gray-600">Performance Materials</span>
              </li>
              <li>
                <span className="text-gray-600">Editorial Preparation</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4">Rechtliches</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/impressum" className="text-gray-600 hover:text-black transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-gray-600 hover:text-black transition-colors">
                  Datenschutz
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <span>&copy; {new Date().getFullYear()} ZSCORE.studio</span>
          <span>Contemporary music materials &middot; editorial infrastructure</span>
        </div>
      </div>
    </footer>
  );
}
