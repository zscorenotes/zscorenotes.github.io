'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from '@/components/shared/Footer';

export default function DatenschutzPage() {
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
        <div className="w-full px-6">
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
            Datenschutz
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="w-[90%] max-w-7xl mx-auto px-6">
          <div className="max-w-3xl space-y-12">

            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">Datenschutzerklärung</h2>
              <p className="text-lg leading-relaxed text-gray-600">
                Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir verarbeiten Ihre Daten daher ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, TKG 2003). In dieser Datenschutzerklärung informieren wir Sie über die wichtigsten Aspekte der Datenverarbeitung im Rahmen unserer Website.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Verantwortlicher</h2>
              <div className="space-y-2 text-lg text-gray-600">
                <p>ZSCORE.studio</p>
                <p>Parham Behzad</p>
                <p>Erzherzog-Euler-Straße 19</p>
                <p>5020 Salzburg</p>
                <p>Österreich</p>
                <p>E-Mail: info@zscore.studio</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Erhebung und Speicherung personenbezogener Daten</h2>
              <p className="text-lg leading-relaxed text-gray-600">
                Beim Besuch unserer Website werden durch den Browser automatisch Informationen an den Server unserer Website gesendet. Diese Informationen werden temporär in einem sogenannten Logfile gespeichert. Folgende Informationen werden dabei ohne Ihr Zutun erfasst und bis zur automatisierten Löschung gespeichert: IP-Adresse des anfragenden Rechners, Datum und Uhrzeit des Zugriffs, Name und URL der abgerufenen Datei, Website, von der aus der Zugriff erfolgt (Referrer-URL), verwendeter Browser und ggf. das Betriebssystem Ihres Rechners sowie der Name Ihres Access-Providers.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Kontaktaufnahme</h2>
              <p className="text-lg leading-relaxed text-gray-600">
                Wenn Sie uns per E-Mail kontaktieren, werden Ihre Angaben zur Bearbeitung der Anfrage und für den Fall von Anschlussfragen gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Cookies</h2>
              <p className="text-lg leading-relaxed text-gray-600">
                Unsere Website verwendet keine Tracking-Cookies. Es werden lediglich technisch notwendige Cookies eingesetzt, die für den Betrieb der Website erforderlich sind. Diese Cookies enthalten keine personenbezogenen Daten und werden nach Ende Ihrer Browser-Sitzung automatisch gelöscht.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Hosting</h2>
              <p className="text-lg leading-relaxed text-gray-600">
                Diese Website wird bei einem externen Dienstleister gehostet (GitHub Pages). Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann es sich um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe und sonstige Daten handeln, die über eine Website generiert werden.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Ihre Rechte</h2>
              <div className="space-y-4 text-lg leading-relaxed text-gray-600">
                <p>
                  Ihnen stehen grundsätzlich die Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerruf und Widerspruch zu. Wenn Sie glauben, dass die Verarbeitung Ihrer Daten gegen das Datenschutzrecht verstößt oder Ihre datenschutzrechtlichen Ansprüche in einer anderen Weise verletzt worden sind, können Sie sich bei der Aufsichtsbehörde beschweren.
                </p>
                <p>
                  Bei Fragen zum Datenschutz wenden Sie sich bitte an: info@zscore.studio
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
