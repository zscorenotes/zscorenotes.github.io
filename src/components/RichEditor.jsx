'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Eye, Code, Save, Undo, Redo, Type, Image, Link, List, Bold, Italic, Palette, Copy, FileText, Sparkles, Monitor, Split, LayoutGrid } from 'lucide-react';

/**
 * Advanced Rich HTML Editor with live preview and presets
 * Features: Syntax highlighting, live preview, templates, validation
 */
export default function RichEditor({ 
  value = '', 
  onChange, 
  placeholder = 'Enter HTML content...', 
  label = 'HTML Content',
  height = '400px',
  showPreview = true,
  contentType = 'general',
  sectionType = 'general'
}) {
  const [viewMode, setViewMode] = useState('editor'); // 'editor', 'preview', 'split'
  const [history, setHistory] = useState([value]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const textareaRef = useRef(null);
  const previewRef = useRef(null);

  // Content templates for different types
  const templates = {
    news: {
      title: 'News Article Template',
      content: `<div class="prose prose-lg max-w-none">
  <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg mb-8">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">Article Title</h2>
    <p class="text-lg mb-6">Engaging introduction paragraph that hooks the reader and summarizes the main points.</p>
  </div>
  
  <div class="grid md:grid-cols-2 gap-8 mb-8">
    <div class="bg-white p-6 rounded-lg shadow-sm border">
      <h3 class="text-xl font-semibold mb-4 text-blue-800">Key Points</h3>
      <ul class="space-y-3">
        <li class="flex items-start">
          <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
          <div>First important point</div>
        </li>
        <li class="flex items-start">
          <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
          <div>Second important point</div>
        </li>
      </ul>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-sm border">
      <h3 class="text-xl font-semibold mb-4 text-purple-800">Details</h3>
      <p class="text-gray-600">Additional details and supporting information.</p>
    </div>
  </div>
  
  <blockquote class="border-l-4 border-blue-500 bg-blue-50 p-6 mb-6">
    <p class="text-lg italic mb-3">"Inspiring quote or testimonial that adds credibility."</p>
    <cite class="text-blue-700 font-semibold">— Source Name</cite>
  </blockquote>
  
  <div class="text-center mt-8">
    <a href="#contact" class="inline-block bg-black text-white px-8 py-3 rounded hover:bg-gray-800 transition-colors font-semibold">Call to Action</a>
  </div>
</div>`
    },
    service: {
      title: 'Service Page Template',
      content: `<div class="prose prose-lg max-w-none">
  <div class="bg-gradient-to-r from-green-50 to-teal-50 p-8 rounded-lg mb-8">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">Service Name</h2>
    <p class="text-lg mb-6">Professional service description that highlights value and expertise.</p>
  </div>
  
  <div class="grid md:grid-cols-3 gap-6 mb-8">
    <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
      <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
        </svg>
      </div>
      <h3 class="text-xl font-semibold mb-3">Feature One</h3>
      <p class="text-gray-600">Description of first key feature</p>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
      <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </div>
      <h3 class="text-xl font-semibold mb-3">Feature Two</h3>
      <p class="text-gray-600">Description of second key feature</p>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
      <div class="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path>
        </svg>
      </div>
      <h3 class="text-xl font-semibold mb-3">Feature Three</h3>
      <p class="text-gray-600">Description of third key feature</p>
    </div>
  </div>
  
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
    <h3 class="text-xl font-semibold text-blue-800 mb-4">🏆 Why Choose Us</h3>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <h4 class="font-semibold mb-2">Professional Standards</h4>
        <ul class="text-sm space-y-1">
          <li>• Industry best practices</li>
          <li>• Quality assurance</li>
          <li>• Timely delivery</li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold mb-2">Client Satisfaction</h4>
        <ul class="text-sm space-y-1">
          <li>• Personalized service</li>
          <li>• Regular updates</li>
          <li>• 100% satisfaction guarantee</li>
        </ul>
      </div>
    </div>
  </div>
</div>`
    },
    portfolio: {
      title: 'Portfolio Project Template',
      content: `<div class="prose prose-lg max-w-none">
  <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-lg mb-8">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">Project Name</h2>
    <p class="text-lg mb-6">Compelling project description that showcases the challenge, solution, and impact.</p>
  </div>
  
  <div class="grid md:grid-cols-2 gap-8 mb-8">
    <div>
      <h3 class="text-2xl font-bold mb-4">The Challenge</h3>
      <p class="mb-4">Describe the specific challenge or problem this project addressed.</p>
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="font-semibold mb-2">Key Requirements</h4>
        <ul class="text-sm space-y-1">
          <li>• Requirement one</li>
          <li>• Requirement two</li>
          <li>• Requirement three</li>
        </ul>
      </div>
    </div>
    <div>
      <h3 class="text-2xl font-bold mb-4">Our Solution</h3>
      <p class="mb-4">Explain the approach and methodology used to solve the problem.</p>
      <div class="bg-purple-50 p-4 rounded-lg">
        <h4 class="font-semibold mb-2">Technologies Used</h4>
        <div class="flex flex-wrap gap-2">
          <span class="bg-purple-200 text-purple-800 px-2 py-1 text-xs rounded">Technology 1</span>
          <span class="bg-purple-200 text-purple-800 px-2 py-1 text-xs rounded">Technology 2</span>
          <span class="bg-purple-200 text-purple-800 px-2 py-1 text-xs rounded">Technology 3</span>
        </div>
      </div>
    </div>
  </div>
  
  <div class="text-center mb-8">
    <h3 class="text-2xl font-bold mb-4">Project Impact</h3>
    <div class="grid md:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded-lg shadow-sm border text-center">
        <div class="text-3xl font-bold text-purple-600 mb-2">95%</div>
        <div class="text-sm text-gray-600">Improvement metric</div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-sm border text-center">
        <div class="text-3xl font-bold text-blue-600 mb-2">2x</div>
        <div class="text-sm text-gray-600">Performance increase</div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-sm border text-center">
        <div class="text-3xl font-bold text-green-600 mb-2">100%</div>
        <div class="text-sm text-gray-600">Client satisfaction</div>
      </div>
    </div>
  </div>
</div>`
    }
  };

  useEffect(() => {
    if (value !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(value);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [value]);

  useEffect(() => {
    validateHTML(value);
  }, [value]);

  const validateHTML = (html) => {
    const errors = [];
    
    // Basic HTML validation
    if (html.includes('<script')) {
      errors.push('Script tags are not allowed for security reasons');
    }
    
    if (html.includes('javascript:')) {
      errors.push('JavaScript URLs are not allowed');
    }
    
    // Check for unclosed tags (basic check)
    const openTags = html.match(/<[^\/][^>]*>/g) || [];
    const closeTags = html.match(/<\/[^>]*>/g) || [];
    
    if (openTags.length !== closeTags.length) {
      errors.push('Possible unclosed HTML tags detected');
    }
    
    setValidationErrors(errors);
  };

  const insertAtCursor = (text) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + text + value.substring(end);
    
    onChange(newValue);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  const applyTemplate = (template) => {
    onChange(template.content);
    setShowTemplates(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value).then(() => {
      // Could add a toast notification here
    });
  };

  const formatCode = () => {
    // Basic HTML formatting
    let formatted = value
      .replace(/></g, '>\n<')
      .replace(/\n\s*\n/g, '\n');
    
    // Simple indentation
    let indent = 0;
    const lines = formatted.split('\n');
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('</')) {
        indent = Math.max(0, indent - 2);
      }
      const result = ' '.repeat(indent) + trimmed;
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
        indent += 2;
      }
      return result;
    });
    
    onChange(formattedLines.join('\n'));
  };

  const quickInserts = [
    { icon: Type, label: 'Heading', code: '<h2 class="text-3xl font-bold mb-6"></h2>' },
    { icon: Type, label: 'Paragraph', code: '<p class="text-lg mb-6"></p>' },
    { icon: Image, label: 'Image', code: '<img src="" alt="" class="w-full h-auto rounded-lg mb-6" />' },
    { icon: Link, label: 'Link', code: '<a href="#" class="text-blue-600 hover:text-blue-800 font-semibold"></a>' },
    { icon: List, label: 'List', code: '<ul class="space-y-2 mb-6"><li></li></ul>' },
    { icon: Palette, label: 'Card', code: '<div class="bg-white p-6 rounded-lg shadow-sm border mb-6"></div>' },
    { icon: LayoutGrid, label: 'Gallery', code: '<div data-gallery="all" style="background:#f3f4f6;border:2px dashed #9ca3af;padding:24px;text-align:center;color:#6b7280;margin:24px 0">📷 Inline Gallery — change "all" to e.g. "2,3,4" to show specific images</div>' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-gray-700">
          {label}
          {validationErrors.length > 0 && (
            <span className="text-red-500 text-xs ml-2">
              ({validationErrors.length} {validationErrors.length === 1 ? 'error' : 'errors'})
            </span>
          )}
        </label>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex === 0}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            title="Undo"
          >
            <Undo size={16} />
          </button>
          
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex === history.length - 1}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            title="Redo"
          >
            <Redo size={16} />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          <button
            type="button"
            onClick={formatCode}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Format Code"
          >
            <Palette size={16} />
          </button>

          <button
            type="button"
            onClick={copyToClipboard}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Copy to Clipboard"
          >
            <Copy size={16} />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 flex items-center gap-1"
          >
            <Sparkles size={14} />
            Templates
          </button>
          
          {showPreview && (
            <div className="flex bg-white rounded border border-gray-200">
              <button
                type="button"
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1 text-xs rounded-l flex items-center gap-1 ${
                  viewMode === 'editor' 
                    ? 'bg-black text-white' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Code size={14} />
                Editor
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 text-xs flex items-center gap-1 ${
                  viewMode === 'preview' 
                    ? 'bg-black text-white' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Eye size={14} />
                Preview
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 text-xs rounded-r flex items-center gap-1 ${
                  viewMode === 'split' 
                    ? 'bg-black text-white' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Split size={14} />
                Split
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Templates Dropdown */}
      {showTemplates && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <h3 className="font-semibold mb-3">Content Templates</h3>
          <div className="grid md:grid-cols-3 gap-3">
            {Object.entries(templates).map(([key, template]) => (
              <button
                key={key}
                onClick={() => applyTemplate(template)}
                className="p-3 text-left border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-sm">{template.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Click to insert template
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Insert Toolbar */}
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
        <span className="text-xs text-gray-600 mr-2">Quick Insert:</span>
        {quickInserts.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              type="button"
              onClick={() => insertAtCursor(item.code)}
              className="flex items-center gap-1 px-2 py-1 bg-white text-gray-700 text-xs rounded hover:bg-gray-100"
              title={item.label}
            >
              <Icon size={12} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Editor/Preview Area */}
      <div 
        className={`border border-gray-300 rounded-lg overflow-hidden ${
          viewMode === 'split' ? 'grid grid-cols-2' : ''
        }`} 
        style={{ height }}
      >
        {/* Editor */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full h-full p-4 font-mono text-sm resize-none focus:outline-none ${
              viewMode === 'split' ? 'border-r border-gray-300' : ''
            }`}
            style={{ fontFamily: 'Monaco, Menlo, monospace' }}
          />
        )}
        
        {/* Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div ref={previewRef} className="h-full overflow-y-auto p-6 bg-white">
            <div 
              dangerouslySetInnerHTML={{ __html: value }} 
              className="prose prose-lg max-w-none"
            />
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <h4 className="text-red-800 font-semibold text-sm mb-2">Validation Errors:</h4>
          <ul className="text-red-700 text-xs space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Character Count */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{value.length} characters</span>
        <span>{value.split('\n').length} lines</span>
      </div>
    </div>
  );
}