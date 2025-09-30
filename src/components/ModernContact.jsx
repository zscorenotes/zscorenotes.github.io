'use client';

import React, { useState, useRef, useEffect } from "react";
import { submitInquiry } from "@/api.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Check, Send } from "lucide-react";

/**
 * The "Contact" section, including a detailed inquiry form,
 * direct contact information, and a summary of the project process.
 * Handles form state, validation, submission, and success/error feedback.
 */
export default function ModernContact() {
  // State to manage the form's input data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    project_type: "",
    message: "",
    timeline: "",
    budget_range: ""
  });
  // State to manage the form submission process (for disabling buttons, showing spinners)
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State to show the success message after a successful submission
  const [submitted, setSubmitted] = useState(false);
  // State to hold any submission error messages
  const [error, setError] = useState("");
  // Ref for the main section element for intersection observation
  const sectionRef = useRef(null);

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
        if (sectionRef.current) {
            observer.unobserve(sectionRef.current);
        }
    };
  }, []);

  /**
   * Updates the form data state when an input changes.
   * @param {string} field The name of the form field.
   * @param {string} value The new value of the form field.
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(""); // Clear previous errors on new input
  };

  /**
   * Handles the form submission.
   * Submits the data to the `ContactInquiry` entity and manages state.
   * @param {React.FormEvent} e The form event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Create a new record in the ContactInquiry entity
      await submitInquiry(formData);
      setSubmitted(true);
      // Reset the form for a potential new message
      setFormData({
        name: "",
        email: "",
        project_type: "",
        message: "",
        timeline: "",
        budget_range: ""
      });
    } catch (error) {
      setError("Error submitting inquiry. Please try again.");
      console.error("Error submitting contact form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If the form has been successfully submitted, show the success message.
  if (submitted) {
    return (
      <section id="contact" className="py-32 text-center bg-black text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="fade-in-up p-12">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-4xl font-black mb-6">Message Sent</h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Your inquiry has been received. We'll be in touch within 24 hours to discuss your project.
            </p>
            <Button
              onClick={() => setSubmitted(false)}
              className="bg-white text-black hover:bg-gray-300 px-8 py-3 tracking-wider font-bold"
            >
              Send Another Message
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Otherwise, show the contact form.
  return (
    <section id="contact" ref={sectionRef} className="py-20 md:py-32 relative overflow-hidden bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="fade-in-up stagger-1">
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              Start Your Project
            </h2>
          </div>
          <div className="fade-in-up stagger-2">
            <p className="text-xl font-light text-gray-300 max-w-3xl mx-auto">
              Ready to bring your piece to life? Let's discuss your project requirements.
            </p>
            <p className="pt-4 text-l font-light text-gray-400 max-w-3xl mx-auto">
              Manuscript prepration → Engraving → Proofreading → Quality Checks → Post productions → Delivery
            </p>
          </div>
        </div>

        {/* Direct Contact Info */}
        <div className="mb-16 fade-in-up stagger-3">
          <div className="border border-gray-700 p-8 text-center">
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
        
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Inquiry Form */}
          <div className="lg:col-span-8">
            <div className="fade-in-left stagger-4 p-8 border border-gray-700">
               <h3 className="text-2xl font-bold mb-6">Or, Send an Inquiry</h3>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-gray-300 font-medium tracking-wider text-sm uppercase mb-2 block">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      className="bg-black border-gray-600 focus:border-white text-lg py-3"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-300 font-medium tracking-wider text-sm uppercase mb-2 block">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      className="bg-black border-gray-600 focus:border-white text-lg py-3"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="project_type" className="text-gray-300 font-medium tracking-wider text-sm uppercase mb-2 block">
                      Project Type
                    </Label>
                    <Select value={formData.project_type} onValueChange={(value) => handleInputChange("project_type", value)}>
                      <SelectTrigger className="bg-black border-gray-600 focus:border-white text-lg py-3">
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="score_engraving">Score Engraving</SelectItem>
                        <SelectItem value="orchestration">Orchestration</SelectItem>
                        <SelectItem value="audio_programming">Audio Programming</SelectItem>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="budget_range" className="text-gray-300 font-medium tracking-wider text-sm uppercase mb-2 block">
                      Budget Range
                    </Label>
                    <Select value={formData.budget_range} onValueChange={(value) => handleInputChange("budget_range", value)}>
                      <SelectTrigger className="bg-black border-gray-600 focus:border-white text-lg py-3">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under_1000">Under $1,000</SelectItem>
                        <SelectItem value="1000_5000">$1,000 - $5,000</SelectItem>
                        <SelectItem value="5000_10000">$5,000 - $10,000</SelectItem>
                        <SelectItem value="over_10000">Over $10,000</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="timeline" className="text-gray-300 font-medium tracking-wider text-sm uppercase mb-2 block">
                    Project Timeline
                  </Label>
                  <Input
                    id="timeline"
                    value={formData.timeline}
                    onChange={(e) => handleInputChange("timeline", e.target.value)}
                    placeholder="e.g., 2-3 weeks, by March 15th, flexible"
                    className="bg-black border-gray-600 focus:border-white text-lg py-3"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-gray-300 font-medium tracking-wider text-sm uppercase mb-2 block">
                    Project Details *
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    placeholder="Describe your project, instrumentation, complexity, and any specific requirements..."
                    required
                    className="min-h-40 bg-black border-gray-600 focus:border-white text-lg resize-none"
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 border border-red-200">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-black hover:bg-gray-300 tracking-wider py-4 text-lg transition-all duration-300 font-bold"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full"></div>
                      <span>Sending Message...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <Send className="w-5 h-5" />
                      <span>Send Inquiry</span>
                    </div>
                  )}
                </Button>
              </form>
            </div>
          </div>
          
          {/* Project Process Steps */}
          <div className="lg:col-span-4">
            <div className="fade-in-right stagger-5 space-y-8">
              <div className="border border-gray-700 p-8">
                <h3 className="text-xl font-bold mb-6">Project Process</h3>
                <div className="space-y-4 text-sm text-gray-400">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                    <div>Initial consultation and requirements discussion</div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                    <div>Project proposal and timeline agreement</div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                    <div>Development and regular progress updates</div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                    <div>Delivery and post-project support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
