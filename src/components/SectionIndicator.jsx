import React from "react";

export default function SectionIndicator({ activeSection, sections }) {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="section-indicator">
      <div className="flex flex-col space-y-3">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className={`w-3 h-3 border border-black transition-all duration-300 hover:scale-125 ${
              activeSection === section.id 
                ? "bg-black" 
                : "bg-transparent hover:bg-gray-300"
            }`}
            title={section.label}
          />
        ))}
      </div>
    </div>
  );
}