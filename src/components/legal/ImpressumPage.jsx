'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from '@/components/shared/Footer';

export default function ImpressumPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm" : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link
              href="/"
              className={`flex items-center gap-2 text-sm font-medium group transition-colors ${
                isScrolled ? "text-gray-600 hover:text-black" : "text-white/70 hover:text-white"
              }`}
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>

            <Link href="/" className={`absolute left-1/2 transform -translate-x-1/2 font-black text-xl transition-colors ${
              isScrolled ? "text-black hover:text-gray-600" : "text-white hover:text-white/70"
            }`}>
              ZSCORE<span className="font-extralight">.studio</span>
            </Link>

            <Link
              href="/#contact"
              className={`text-sm font-medium transition-colors ${
                isScrolled ? "text-gray-600 hover:text-black" : "text-white/70 hover:text-white"
              }`}
            >
              Contact
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-black text-white">
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight">
            Impressum
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          <div className="max-w-3xl space-y-12">

            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">Angaben gemäß § 5 TMG</h2>
              <div className="space-y-2 text-lg text-gray-600">
                <p>ZSCORE.studio</p>
                <p>Parham Behzad</p>
                <p>Erzherzog-Euler-Straße 19</p>
                <p>5020 Salzburg</p>
                <p>Österreich</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Kontakt</h2>
              <div className="space-y-2 text-lg text-gray-600">
                <p>E-Mail: info@zscore.studio</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
              <div className="space-y-2 text-lg text-gray-600">
                <p>Parham Behzad</p>
                <p>Erzherzog-Euler-Straße 19</p>
                <p>5020 Salzburg</p>
                <p>Österreich</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Haftungsausschluss</h2>
              <div className="space-y-6 text-lg leading-relaxed text-gray-600">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">Haftung für Inhalte</h3>
                  <p>
                    Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">Haftung für Links</h3>
                  <p>
                    Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">Urheberrecht</h3>
                  <p>
                    Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
