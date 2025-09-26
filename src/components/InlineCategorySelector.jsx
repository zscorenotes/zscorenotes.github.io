import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, X, Trash2 } from 'lucide-react';
import ContentManager from '@/entities/ContentManager';

const PREDEFINED_COLORS = [
  { name: 'Blue', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  { name: 'Green', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  { name: 'Yellow', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  { name: 'Red', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  { name: 'Purple', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  { name: 'Pink', bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  { name: 'Indigo', bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  { name: 'Gray', bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  { name: 'Orange', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  { name: 'Teal', bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  { name: 'Cyan', bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
  { name: 'Emerald', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
];

/**
 * Notion-style inline category/tag selector with color management
 */
export default function InlineCategorySelector({ 
  value, 
  onChange, 
  section, 
  placeholder = "Select or create category...",
  allowMultiple = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PREDEFINED_COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const dropdownRef = useRef(null);

  // Initialize with default categories based on section
  useEffect(() => {
    initializeDefaultCategories();
  }, [section]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowColorPicker(false);
        setNewCategoryName('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initializeDefaultCategories = () => {
    let defaultCategories = [];
    
    switch (section) {
      case 'services':
        defaultCategories = [
          { id: 'music_engraving', label: 'Music Engraving', color: 'blue' },
          { id: 'score_preparation', label: 'Score Preparation', color: 'green' },
          { id: 'consultation', label: 'Consultation', color: 'purple' },
          { id: 'digital_publishing', label: 'Digital Publishing', color: 'orange' }
        ];
        break;
      case 'portfolio':
        defaultCategories = [
          { id: 'score_engraving', label: 'Score Engraving', color: 'blue' },
          { id: 'audio_programming', label: 'Audio Programming', color: 'green' },
          { id: 'orchestration', label: 'Orchestration', color: 'yellow' },
          { id: 'consultation', label: 'Consultation', color: 'purple' }
        ];
        break;
      case 'news':
      case 'news_tags':
        defaultCategories = [
          { id: 'release', label: 'Release', color: 'blue' },
          { id: 'performance', label: 'Performance', color: 'green' },
          { id: 'collaboration', label: 'Collaboration', color: 'purple' },
          { id: 'update', label: 'Update', color: 'orange' }
        ];
        break;
      case 'portfolio_technologies':
        defaultCategories = [
          { id: 'sibelius', label: 'Sibelius', color: 'blue' },
          { id: 'finale', label: 'Finale', color: 'green' },
          { id: 'dorico', label: 'Dorico', color: 'purple' },
          { id: 'musescore', label: 'MuseScore', color: 'orange' },
          { id: 'lilypond', label: 'Lilypond', color: 'teal' },
          { id: 'custom_software', label: 'Custom Software', color: 'cyan' }
        ];
        break;
      default:
        defaultCategories = [];
    }
    
    // Load categories from localStorage, or use defaults if none exist
    const storedCategories = localStorage.getItem(`categories_${section}`);
    if (storedCategories) {
      try {
        const savedCategories = JSON.parse(storedCategories);
        setAvailableCategories(savedCategories);
      } catch (error) {
        console.error('Error loading stored categories:', error);
        setAvailableCategories(defaultCategories);
        // Save defaults to localStorage
        localStorage.setItem(`categories_${section}`, JSON.stringify(defaultCategories));
      }
    } else {
      setAvailableCategories(defaultCategories);
      // Save defaults to localStorage for future editing
      localStorage.setItem(`categories_${section}`, JSON.stringify(defaultCategories));
    }
  };

  const handleCategorySelect = (category) => {
    if (allowMultiple) {
      const currentValues = Array.isArray(value) ? value : [];
      // For portfolio project types, use the 'id' field (e.g., 'score_engraving')
      // For other categories, use label or the category itself
      const categoryValue = typeof category === 'string' 
        ? category 
        : (section === 'portfolio' && category.id ? category.id : category.label || category);
      
      if (!currentValues.includes(categoryValue)) {
        onChange([...currentValues, categoryValue]);
      }
    } else {
      const categoryValue = typeof category === 'string' 
        ? category 
        : (section === 'portfolio' && category.id ? category.id : category.label || category);
      onChange(categoryValue);
    }
    setIsOpen(false);
  };

  const handleRemoveCategory = (categoryToRemove) => {
    if (allowMultiple) {
      const currentValues = Array.isArray(value) ? value : [];
      onChange(currentValues.filter(cat => cat !== categoryToRemove));
    } else {
      onChange('');
    }
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory = {
      id: newCategoryName.trim().toLowerCase().replace(/\s+/g, '_'),
      label: newCategoryName.trim(),
      color: selectedColor.name.toLowerCase()
    };

    // Add to current categories
    const updatedCategories = [...availableCategories, newCategory];
    setAvailableCategories(updatedCategories);
    
    // Save custom categories to localStorage (excluding defaults)
    saveCustomCategories(updatedCategories);
    
    // Select the new category and close the form
    handleCategorySelect(newCategory);
    setNewCategoryName('');
    setShowColorPicker(false);
    setSelectedColor(PREDEFINED_COLORS[0]);
  };

  const handleDeleteCategory = (categoryToDelete) => {
    const categoryId = typeof categoryToDelete === 'string' 
      ? categoryToDelete 
      : categoryToDelete.id;
    
    // Remove from available categories
    const updatedCategories = availableCategories.filter(cat => 
      (typeof cat === 'string' ? cat : cat.id) !== categoryId
    );
    setAvailableCategories(updatedCategories);
    
    // Update localStorage
    saveCustomCategories(updatedCategories);
    
    // Remove from current selection if selected
    const categoryValue = typeof categoryToDelete === 'string' 
      ? categoryToDelete 
      : (section === 'portfolio' && categoryToDelete.id ? categoryToDelete.id : categoryToDelete.label || categoryToDelete);
      
    if (allowMultiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(categoryValue)) {
        onChange(currentValues.filter(val => val !== categoryValue));
      }
    } else {
      if (value === categoryValue) {
        onChange('');
      }
    }
  };

  const saveCustomCategories = (categories) => {
    // Save all categories (user can now edit the full list)
    localStorage.setItem(`categories_${section}`, JSON.stringify(categories));
  };


  const getCategoryColor = (category) => {
    if (typeof category === 'object' && category.color) {
      const color = PREDEFINED_COLORS.find(c => c.name.toLowerCase() === category.color.toLowerCase());
      return color || PREDEFINED_COLORS[0];
    }
    
    // For simple string categories, use a deterministic color based on hash
    const categoryName = typeof category === 'string' ? category : (category.label || category.name || '');
    const hash = categoryName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return PREDEFINED_COLORS[Math.abs(hash) % PREDEFINED_COLORS.length];
  };

  const renderCategoryTag = (categoryValue, canRemove = false, onRemove = null) => {
    // Find the category object to get the proper label and color
    let category = categoryValue;
    let label = categoryValue;
    
    if (typeof categoryValue === 'string') {
      // Try to find the category object by ID or label
      const foundCategory = availableCategories.find(cat => 
        (typeof cat === 'object' && (cat.id === categoryValue || cat.label === categoryValue)) ||
        cat === categoryValue
      );
      if (foundCategory) {
        category = foundCategory;
        label = typeof foundCategory === 'object' ? foundCategory.label : foundCategory;
      } else {
        label = categoryValue;
      }
    } else if (typeof categoryValue === 'object') {
      category = categoryValue;
      label = categoryValue.label;
    }
    
    const color = getCategoryColor(category);
    
    return (
      <span 
        key={typeof categoryValue === 'string' ? categoryValue : categoryValue.id || categoryValue.label}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${color.bg} ${color.text} ${color.border}`}
      >
        {label}
        {canRemove && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="hover:bg-black/10 rounded-full p-0.5"
          >
            <X size={10} />
          </button>
        )}
      </span>
    );
  };

  const currentValues = allowMultiple 
    ? (Array.isArray(value) ? value : []) 
    : (value ? [value] : []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {currentValues.length > 0 ? (
            currentValues.map(cat => renderCategoryTag(cat, allowMultiple, (e) => {
              e.stopPropagation();
              handleRemoveCategory(cat);
            }))
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {/* Existing Categories */}
          <div className="p-2">
            {availableCategories.length === 0 ? (
              <div className="p-2 text-sm text-gray-500">No categories available</div>
            ) : (
              availableCategories.map((category, index) => {
              const categoryValue = typeof category === 'string' 
                ? category 
                : (section === 'portfolio' && category.id ? category.id : category.label || category);
              const isSelected = currentValues.includes(categoryValue);
              
              // Allow deletion of ALL categories (including defaults)
              const isCustomCategory = true;
              
              return (
                <div
                  key={index}
                  className={`w-full flex items-center justify-between p-2 rounded hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className="flex-1 flex items-center gap-2 text-left"
                  >
                    {renderCategoryTag(category, false)}
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {isSelected && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCategory(categoryValue);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Remove from selection"
                      >
                        <X size={12} />
                      </button>
                    )}
                    
                    {isCustomCategory && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete this category permanently"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
            )}
          </div>

          {/* Create New Category */}
          <div className="border-t border-gray-100 p-2">
            {!showColorPicker ? (
              <button
                type="button"
                onClick={() => setShowColorPicker(true)}
                className="w-full flex items-center gap-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
              >
                <Plus size={14} />
                Create new category
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name..."
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateCategory();
                    } else if (e.key === 'Escape') {
                      setShowColorPicker(false);
                      setNewCategoryName('');
                    }
                  }}
                />
                
                {/* Color Picker */}
                <div className="space-y-2">
                  <span className="text-xs text-gray-600">Choose color:</span>
                  <div className="flex gap-1 flex-wrap">
                    {PREDEFINED_COLORS.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-6 h-6 rounded-full ${color.bg} border-2 ${
                          selectedColor.name === color.name 
                            ? 'border-gray-900 shadow-md' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={!newCategoryName.trim()}
                    className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowColorPicker(false);
                      setNewCategoryName('');
                    }}
                    className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}