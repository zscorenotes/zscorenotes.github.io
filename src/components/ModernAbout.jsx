'use client';

import React, { useState, useRef, useEffect } from "react";
import * as ContentManager from '@/lib/content-manager-clean';
import coverImage from '@/assets/imgs/example_1.jpg'

/**
 * The "About ZSCORE" section of the website.
 * Provides information about the company's philosophy, team members,
 * and areas of expertise.
 */
export default function ModernAbout() {
  const [aboutData, setAboutData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const sectionRef = useRef(null);

  // Array of images for the transition effect
  // For now using the same image twice, user can add more images later
  const images = [
    {
      src: coverImage,
      alt: "ZSCORE studio workspace showing professional music engraving setup"
    },
    {
      src: coverImage, // Placeholder - can be replaced with a second image
      alt: "ZSCORE team collaboration on contemporary music notation"
    }
  ];

  // Load about content
  useEffect(() => {
    const loadAboutContent = async () => {
      try {
        const contentData = await ContentManager.getAllContent();
        setAboutData(contentData.about || {});
      } catch (error) {
        console.error("Error loading about content:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAboutContent();
  }, []);

  // Effect to listen for content updates from admin panel
  useEffect(() => {
    const loadAboutContent = async () => {
      try {
        const contentData = await ContentManager.getAllContent();
        setAboutData(contentData.about || {});
      } catch (error) {
        console.error("Error loading about content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleContentUpdate = (event) => {
      const { contentType } = event.detail;
      if (contentType === 'about') {
        console.log('About content updated, reloading...');
        loadAboutContent();
      }
    };

    window.addEventListener('zscore-content-updated', handleContentUpdate);
    
    return () => {
      window.removeEventListener('zscore-content-updated', handleContentUpdate);
    };
  }, []);

  // Effect for automatic image transition
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % images.length
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(intervalId);
  }, [images.length]);

  // Effect for the one-time fade-in animation of the section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target);
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

  if (isLoading) {
    return (
      <section id="about" className="py-20 md:py-32 bg-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="animate-pulse">
            <div className="h-16 bg-gray-300 rounded mb-8 max-w-md"></div>
            <div className="h-6 bg-gray-300 rounded mb-12 max-w-2xl mx-auto"></div>
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
              <div className="lg:col-span-5">
                <div className="aspect-square bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" ref={sectionRef} className="py-20 md:py-32 bg-gray-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="mb-20">
          <div className="fade-in-up stagger-1">
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              {aboutData?.section_title || 'About ZSCORE'}
            </h2>
          </div>
          <div className="fade-in-up stagger-2">
            <p className="text-xl font-light text-gray-600 max-w-2xl mx-auto">
              {aboutData?.section_subtitle || 'Founded by active composers who understand the intricacies of contemporary music notation'}
            </p>
          </div>
        </div>
        
        {/* Philosophy Section */}
        <div className="grid lg:grid-cols-12 gap-16 items-center mb-20">
          <div className="lg:col-span-7">
            <div className="space-y-8 text-lg leading-relaxed text-gray-600">
              {aboutData?.philosophy_paragraphs && aboutData.philosophy_paragraphs.length > 0 ? (
                aboutData.philosophy_paragraphs.map((paragraph, index) => (
                  <div key={index} className={`fade-in-left stagger-${index + 1}`}>
                    <p>{paragraph}</p>
                  </div>
                ))
              ) : (
                <>
                  <div className="fade-in-left stagger-1">
                    <p>
                      ZSCORE emerged from a fundamental need within the contemporary music community: a requirement for truly professional engraving services that not only maintain technical precision but also deeply respect artistic intent. We don't just typeset notes—we interpret and understand complex musical structures, modern performance practices, and the subtle nuances that elevate a score from merely readable to truly professional and musically intuitive.
                    </p>
                  </div>
                  <div className="fade-in-left stagger-2">
                    <p>
                      Our unique approach seamlessly combines generations of traditional music engraving expertise with cutting-edge, custom-built automation tools. This synthesis allows us to handle projects of immense scale and complexity with unparalleled efficiency and accuracy. Every score, from a solo instrumental piece to a full-scale opera, receives our team's meticulous attention to layout, optical spacing, and absolute clarity.
                    </p>
                  </div>
                  <div className="fade-in-left stagger-3">
                    <p>
                      We are steadfast partners to composers, publishers, and ensembles worldwide. Our primary mission is to ensure that even the most intricate and demanding contemporary works are presented with such clarity that performers can focus entirely on the music, not on deciphering the notation.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-5 fade-in-right stagger-2">
            <div className="relative">
              {/* This is the main container for your image */}
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 border border-black/10 relative overflow-hidden">
                
                {/* Optional: You can keep this decorative background pattern or remove it */}
                <div className="absolute inset-0 bg-black bg-opacity-5 bg-[length:20px_20px]" style={{ 
                  backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 20px)` 
                }}></div>

                {/* Image transition container */}
                <div className="relative w-full h-full">
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={image.src}
                      alt={image.alt}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  ))}
                </div>

                {/* Image indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-white' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Switch to image ${index + 1}`}
                    />
                  ))}
                </div>

              </div>
              {/* These are the decorative elements outside the main box */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-black/5 -z-10"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 border border-black/10 -z-10"></div>
            </div>
          </div>
        </div>
        
        {/* Composer-Led Excellence Section */}
        <div className="my-24">
          <div className="text-center mb-16">
            <div className="fade-in-up stagger-1">
              <h3 className="text-4xl md:text-5xl font-black mb-4 gradient-text">Composer-Led Excellence</h3>
            </div>
            <div className="fade-in-up stagger-2">
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">Founded and led by active composers with advanced degrees and international recognition, ZSCORE brings both artistic insight and technical mastery to every project.</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-16 items-top mb-16">
            <div className="lg:col-span-4 fade-in-left stagger-3">
              <div className="relative mb-6">
                {/* <div className="w-32 h-32 bg-gray-300 border border-black/10">
                   <img src="https://raw.githubusercontent.com/zscorenotes/zscorenotes.github.io/main/assets/parham.png" alt="Parham Behzad, Founder of ZSCORE" className="w-full h-full object-cover" />
                </div> */}
              </div>
              <h4 className="text-xl font-bold mb-2">Parham Behzad</h4>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">Founder & Lead Engraver/Developer</p>
              <p className="text-gray-700 text-sm leading-relaxed">
                Composer and developer, he studied composition, piano, and computer science. He designs advanced score production environments, with a focus on workflow automation and custom tools for engraving and composing.
              </p>
            </div>

            <div className="lg:col-span-4 fade-in-left stagger-4">
              <div className="relative mb-6">
                {/* <div className="w-32 h-32 bg-gray-300 border border-black/10">
                   <img src="https://raw.githubusercontent.com/zscorenotes/zscorenotes.github.io/main/assets/lena.png" alt="Lena Michajłów, Editor at ZSCORE" className="w-full h-full object-cover" />
                </div> */}
              </div>
              <h4 className="text-xl font-bold mb-2">Lena Michajłów</h4>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">Editor & Quality Specialist</p>
              <p className="text-gray-700 text-sm leading-relaxed">
                Composer, pianist, and editor, she studied composition with a specialization in electronic, film, and theatre music. She brings a performer's perspective to ensure scores are both accurate and intuitively readable.
              </p>
            </div>

            <div className="lg:col-span-4 fade-in-left stagger-5">
              <div className="bg-gray-100 p-6 border border-black/10">
                <h4 className="text-lg font-bold mb-4">Why This Matters</h4>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>• <strong>Musical Understanding:</strong> We don't just copy notes - we understand musical structure and intent</p>
                  <p>• <strong>Performer Insight:</strong> Our active performance experience ensures practical, readable scores</p>
                  <p>• <strong>Contemporary Expertise:</strong> Specialized knowledge of modern notation and techniques</p>
                  <p>• <strong>Technical Innovation:</strong> Custom tools and workflows developed by the team that uses them</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Expertise Grid */}
        <div className="grid md:grid-cols-2 gap-12">
          <div className="fade-in-left stagger-3">
            <h3 className="text-2xl font-bold mb-6">Technical Expertise</h3>
            <div className="space-y-4">
              {[
                "Sibelius, Finale, MuseScore, Dorico, and LilyPond proficiency",
                "Custom notation software and workflow automation", 
                "MusicXML, MEI, and SMuFL format expertise",
                "Interactive music systems using, Opusmodus, Bach, Max/MSP, PureData, SuperCollider"
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-black"></div>
                  <span className="text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="fade-in-right stagger-4">
            <h3 className="text-2xl font-bold mb-6">Musical Background</h3>
            <div className="space-y-4">
              {[
                "Active, award-winning composers and performers",
                "Deep specialization in contemporary and experimental music",
                "Extensive orchestration and arrangement experience",
                "Thorough knowledge of historical and modern performance practices"
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-black"></div>
                  <span className="text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}