import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&display=swap');
          
          /* Default font for readable content */
          * {
            font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          }
          
          /* JetBrains Mono for design elements, headings, navigation, and branding */
          h1, h2, h3, h4, h5, h6,
          .font-mono,
          nav,
          nav *,
          button,
          .btn,
          .tracking-wider,
          .tracking-widest,
          .uppercase,
          .font-black,
          .font-bold,
          .section-indicator,
          .progress-bar,
          .glitch {
            font-family: 'JetBrains Mono', 'Courier New', monospace;
          }
          
          /* Ensure readable content uses IBM Plex Sans */
          p, 
          .text-content,
          .description,
          .leading-relaxed,
          .prose,
          article,
          .card-content,
          .news-content,
          .service-content,
          .portfolio-content,
          .about-content,
          .contact-content,
          input,
          textarea,
          select,
          label,
          .form-content,
          .modal-content,
          .detail-content,
          .markdown-content,
          blockquote,
          li,
          ul,
          ol,
          .text-gray-600:not(nav *),
          .text-gray-700:not(nav *),
          .text-gray-500:not(nav *),
          .text-sm:not(.tracking-wider):not(.uppercase):not(nav *),
          .text-base:not(.tracking-wider):not(.uppercase):not(nav *),
          .text-lg:not(.tracking-wider):not(.uppercase):not(nav *),
          .text-xl:not(.tracking-wider):not(.uppercase):not(nav *) {
            font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          }
          
          body {
            background-color: white;
            color: black;
            line-height: 1.6;
            overflow-x: hidden;
            font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          }
          
          .fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
            opacity: 0;
            transform: translateY(30px);
          }
          
          .fade-in-left {
            animation: fadeInLeft 0.8s ease-out forwards;
            opacity: 0;
            transform: translateX(-30px);
          }
          
          .fade-in-right {
            animation: fadeInRight 0.8s ease-out forwards;
            opacity: 0;
            transform: translateX(30px);
          }
          
          .stagger-1 { animation-delay: 0.1s; }
          .stagger-2 { animation-delay: 0.2s; }
          .stagger-3 { animation-delay: 0.3s; }
          .stagger-4 { animation-delay: 0.4s; }
          .stagger-5 { animation-delay: 0.5s; }
          .stagger-6 { animation-delay: 0.6s; }
          
          @keyframes fadeInUp {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInLeft {
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes fadeInRight {
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          .glitch {
            animation: glitchRandom 60s infinite;
            font-family: 'JetBrains Mono', 'Courier New', monospace;
          }
          
          @keyframes glitchRandom {
            0%, 16.6% { transform: translate(0); }
            16.7%, 16.9% { transform: translate(-2px, 1px); }
            17%, 33.2% { transform: translate(0); }
            33.3%, 33.5% { transform: translate(1px, -1px); }
            33.6%, 49.8% { transform: translate(0); }
            49.9%, 50.1% { transform: translate(-1px, 2px); }
            50.2%, 66.4% { transform: translate(0); }
            66.5%, 66.7% { transform: translate(2px, -1px); }
            66.8%, 83% { transform: translate(0); }
            83.1%, 83.3% { transform: translate(-1px, -2px); }
            83.4%, 100% { transform: translate(0); }
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #000 0%, #333 50%, #000 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .glass-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 0, 0, 0.1);
          }
          
          .hover-lift {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          
          .hover-lift:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          }
          
          .geometric-bg::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: 
              linear-gradient(45deg, transparent 48%, rgba(0,0,0,0.02) 50%, transparent 52%),
              linear-gradient(-45deg, transparent 48%, rgba(0,0,0,0.02) 50%, transparent 52%);
            background-size: 60px 60px;
            animation: drift 20s linear infinite;
            z-index: -1;
          }
          
          @keyframes drift {
            0% { transform: translate(0, 0) rotate(0deg); }
            100% { transform: translate(-60px, -60px) rotate(360deg); }
          }
          
          .typing-indicator {
            animation: typing 2s infinite;
          }
          
          @keyframes typing {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
          
          .progress-bar {
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 2px;
            background: linear-gradient(90deg, #000, #333, #000);
            z-index: 9999;
            transition: width 0.3s ease;
          }
          
          .magnetic-hover {
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          
          .section-indicator {
            position: fixed;
            right: 2rem;
            top: 50%;
            transform: translateY(-50%);
            z-index: 50;
          }
          
          @media (max-width: 768px) {
            .section-indicator {
              display: none;
            }
          }
        `}
      </style>
      {children}
    </div>
  );
}
