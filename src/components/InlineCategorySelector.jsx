import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, X, Trash2 } from 'lucide-react';
import { getCategoryColorSync } from '@/utils/categoryColors';
import * as ContentManager from '@/lib/content-manager-clean';

const PREDEFINED_COLORS = [
  { name: 'Blue', value: 'blue', preview: 'bg-blue-100' },
  { name: 'Green', value: 'green', preview: 'bg-green-100' },
  { name: 'Yellow', value: 'yellow', preview: 'bg-yellow-100' },
  { name: 'Red', value: 'red', preview: 'bg-red-100' },
  { name: 'Purple', value: 'purple', preview: 'bg-purple-100' },
  { name: 'Pink', value: 'pink', preview: 'bg-pink-100' },
  { name: 'Indigo', value: 'indigo', preview: 'bg-indigo-100' },
  { name: 'Gray', value: 'gray', preview: 'bg-gray-100' },
  { name: 'Orange', value: 'orange', preview: 'bg-orange-100' },
  { name: 'Teal', value: 'teal', preview: 'bg-teal-100' },
  { name: 'Cyan', value: 'cyan', preview: 'bg-cyan-100' },
  { name: 'Emerald', value: 'emerald', preview: 'bg-emerald-100' },
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

  // Load categories from centralized database
  useEffect(() => {
    loadCategoriesFromDatabase();
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

  const loadCategoriesFromDatabase = async () => {
    try {
      const allContent = await ContentManager.getAllContent();
      const categories = allContent.categories || {};
      const sectionCategories = categories[section] || [];
      
      // Convert database format to component format
      const formattedCategories = sectionCategories.map(cat => ({
        id: cat.id,
        label: cat.label || cat.displayName,
        color: cat.color
      }));
      
      setAvailableCategories(formattedCategories);
    } catch (error) {
      console.error('Error loading categories from database:', error);
      setAvailableCategories([]);
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

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    const newCategory = {
      id: newCategoryName.trim().toLowerCase().replace(/\s+/g, '_'),
      label: newCategoryName.trim(),
      displayName: newCategoryName.trim(),
      color: selectedColor.value,
      description: `Custom ${section} category`
    };

    try {
      // Add to database
      const allContent = await ContentManager.getAllContent();
      const categories = allContent.categories || {};
      const sectionCategories = categories[section] || [];
      
      // Add new category to section
      const updatedSectionCategories = [...sectionCategories, newCategory];
      categories[section] = updatedSectionCategories;
      categories.updated_at = new Date().toISOString();
      
      // Save to database
      await ContentManager.saveContent('categories', categories);
      
      // Update local state
      const formattedCategory = {
        id: newCategory.id,
        label: newCategory.label,
        color: newCategory.color
      };
      const updatedCategories = [...availableCategories, formattedCategory];
      setAvailableCategories(updatedCategories);
      
      // Select the new category and close the form
      handleCategorySelect(formattedCategory);
      setNewCategoryName('');
      setShowColorPicker(false);
      setSelectedColor(PREDEFINED_COLORS[0]);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleDeleteCategory = async (categoryToDelete) => {
    const categoryId = typeof categoryToDelete === 'string' 
      ? categoryToDelete 
      : categoryToDelete.id;
    
    try {
      // Remove from database
      const allContent = await ContentManager.getAllContent();
      const categories = allContent.categories || {};
      const sectionCategories = categories[section] || [];
      
      // Filter out the deleted category
      const updatedSectionCategories = sectionCategories.filter(cat => cat.id !== categoryId);
      categories[section] = updatedSectionCategories;
      categories.updated_at = new Date().toISOString();
      
      // Save to database
      await ContentManager.saveContent('categories', categories);
      
      // Update local state
      const updatedCategories = availableCategories.filter(cat => 
        (typeof cat === 'string' ? cat : cat.id) !== categoryId
      );
      setAvailableCategories(updatedCategories);
      
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
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };


  const getCategoryColor = (category) => {
    const categoryName = typeof category === 'string' ? category : (category.label || category.name || '');
    const colorClasses = getCategoryColorSync(categoryName, section);
    return colorClasses;
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
    
    const colorClasses = getCategoryColor(category);
    
    return (
      <span 
        key={typeof categoryValue === 'string' ? categoryValue : categoryValue.id || categoryValue.label}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${colorClasses}`}
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
                        className={`w-6 h-6 rounded-full ${color.preview} border-2 ${
                          selectedColor.value === color.value 
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