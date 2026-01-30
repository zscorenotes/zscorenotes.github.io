'use client';

import { useRef, useEffect, useState } from "react";

export default function ModernContact() {
  const sectionRef = useRef(null);
  const [showContent, setShowContent] = useState(false);
  const [showTrusted, setShowTrusted] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            setTimeout(() => setShowContent(true), 300);
            setTimeout(() => setShowTrusted(true), 3500);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes slowReveal {
          0%   { opacity: 0; }
          15%  { opacity: 0.08; }
          35%  { opacity: 0.2; }
          55%  { opacity: 0.4; }
          75%  { opacity: 0.65; }
          100% { opacity: 1; }
        }
        .slow-reveal {
          animation: slowReveal 5s linear forwards;
        }
      `}</style>

      <section id="contact" ref={sectionRef} className="min-h-screen flex flex-col justify-center relative overflow-hidden bg-black text-white">
        <div
          className={`max-w-7xl mx-auto px-6 md:px-12 relative ${showContent ? 'slow-reveal' : ''}`}
          style={{ opacity: showContent ? undefined : 0 }}
        >
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              Start Your Project
            </h2>
          </div>

          {/* Direct Contact Info */}
          <div className="border border-gray-700 p-8 text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Direct Contact</h3>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              For any inquiries, detailed discussions, or to send files directly, please reach out via email.
            </p>
            <div className="font-mono text-2xl tracking-wider mb-2">
              <a href="mailto:info@zscore.studio" className="hover:text-gray-300 transition-colors">info@zscore.studio</a>
            </div>
            <div className="text-sm text-gray-500">
              Response time: Within 24 hours, Mon-Fri, 9:00 AM - 6:00 PM CEST
            </div>
          </div>
        </div>

        {/* Trusted By - fades in after contact */}
        <div
          className={`absolute bottom-8 left-0 right-0 text-center px-6 ${showTrusted ? 'slow-reveal' : ''}`}
          style={{ opacity: showTrusted ? undefined : 0 }}
        >
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-2 font-mono">Trusted by</p>
          <p className="text-xs text-gray-600 font-mono">
            SWR Symphonieorchester ● WDR Sinfonieorchester ● Basel Sinfonietta ● Ostrava Center for New Music ● Ensemble Mosaik ● Universität Mozarteum Salzburg
          </p>
        </div>
      </section>
    </>
  );
}
