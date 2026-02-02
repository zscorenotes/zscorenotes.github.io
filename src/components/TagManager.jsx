'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Palette, Save, X } from 'lucide-react';

/**
 * Tag Management Component
 * Allows users to create, edit, and manage tags with custom colors
 */
export default function TagManager({ onClose, sectionType }) {
  const [tags, setTags] = useState([]);
  const [editingTag, setEditingTag] = useState(null);
  const [newTag, setNewTag] = useState({ name: '', color: '', type: sectionType });
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Color options for tags
  const colorOptions = [
    { value: 'bg-blue-100 text-blue-800', label: 'Blue', preview: 'bg-blue-100' },
    { value: 'bg-purple-100 text-purple-800', label: 'Purple', preview: 'bg-purple-100' },
    { value: 'bg-green-100 text-green-800', label: 'Green', preview: 'bg-green-100' },
    { value: 'bg-pink-100 text-pink-800', label: 'Pink', preview: 'bg-pink-100' },
    { value: 'bg-orange-100 text-orange-800', label: 'Orange', preview: 'bg-orange-100' },
    { value: 'bg-yellow-100 text-yellow-800', label: 'Yellow', preview: 'bg-yellow-100' },
    { value: 'bg-red-100 text-red-800', label: 'Red', preview: 'bg-red-100' },
    { value: 'bg-indigo-100 text-indigo-800', label: 'Indigo', preview: 'bg-indigo-100' },
    { value: 'bg-teal-100 text-teal-800', label: 'Teal', preview: 'bg-teal-100' },
    { value: 'bg-emerald-100 text-emerald-800', label: 'Emerald', preview: 'bg-emerald-100' },
    { value: 'bg-cyan-100 text-cyan-800', label: 'Cyan', preview: 'bg-cyan-100' },
    { value: 'bg-gray-100 text-gray-800', label: 'Gray', preview: 'bg-gray-100' },
  ];

  useEffect(() => {
    loadTags();
  }, [sectionType]);

  const loadTags = async () => {
    setIsLoading(true);
    try {
      // Load existing tag configurations from localStorage
      const storedTags = localStorage.getItem(`zscore_tags_${sectionType}`);
      if (storedTags) {
        setTags(JSON.parse(storedTags));
      } else {
        // Set default tags based on section type
        const defaultTags = getDefaultTags(sectionType);
        setTags(defaultTags);
        localStorage.setItem(`zscore_tags_${sectionType}`, JSON.stringify(defaultTags));
      }
    } catch (error) {
      console.error('Error loading tags:', error);
      setSaveStatus('Error loading tags');
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultTags = (type) => {
    if (type === 'services') {
      return [
        { id: 'engraving', name: 'engraving', displayName: 'Engraving', color: 'bg-blue-100 text-blue-800', type: 'services' },
        { id: 'orchestration', name: 'orchestration', displayName: 'Orchestration', color: 'bg-purple-100 text-purple-800', type: 'services' },
        { id: 'automation', name: 'automation', displayName: 'Automation', color: 'bg-green-100 text-green-800', type: 'services' },
        { id: 'audio', name: 'audio', displayName: 'Audio', color: 'bg-pink-100 text-pink-800', type: 'services' },
        { id: 'consulting', name: 'consulting', displayName: 'Consulting', color: 'bg-orange-100 text-orange-800', type: 'services' },
        { id: 'editorial', name: 'editorial', displayName: 'Editorial', color: 'bg-yellow-100 text-yellow-800', type: 'services' },
      ];
    } else if (type === 'portfolio') {
      return [
        { id: 'engraving', name: 'Engraving', displayName: 'Engraving', color: 'bg-blue-100 text-blue-800', type: 'portfolio' },
        { id: 'composition', name: 'Composition', displayName: 'Composition', color: 'bg-purple-100 text-purple-800', type: 'portfolio' },
        { id: 'arrangement', name: 'Arrangement', displayName: 'Arrangement', color: 'bg-green-100 text-green-800', type: 'portfolio' },
        { id: 'transcription', name: 'Transcription', displayName: 'Transcription', color: 'bg-orange-100 text-orange-800', type: 'portfolio' },
        { id: 'orchestration', name: 'Orchestration', displayName: 'Orchestration', color: 'bg-indigo-100 text-indigo-800', type: 'portfolio' },
        { id: 'music_production', name: 'Music Production', displayName: 'Music Production', color: 'bg-pink-100 text-pink-800', type: 'portfolio' },
        { id: 'audio_editing', name: 'Audio Editing', displayName: 'Audio Editing', color: 'bg-teal-100 text-teal-800', type: 'portfolio' },
      ];
    } else if (type === 'projects') {
      return [
        { id: 'announcement', name: 'announcement', displayName: 'Announcement', color: 'bg-blue-100 text-blue-800', type: 'projects' },
        { id: 'project_update', name: 'project_update', displayName: 'Project Update', color: 'bg-green-100 text-green-800', type: 'projects' },
        { id: 'technology', name: 'technology', displayName: 'Technology', color: 'bg-purple-100 text-purple-800', type: 'projects' },
        { id: 'industry_news', name: 'industry_news', displayName: 'Industry News', color: 'bg-orange-100 text-orange-800', type: 'projects' },
      ];
    }
    return [];
  };

  const saveTags = async (updatedTags) => {
    try {
      setSaveStatus('Saving...');
      localStorage.setItem(`zscore_tags_${sectionType}`, JSON.stringify(updatedTags));
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error saving tags:', error);
      setSaveStatus('Error saving tags');
    }
  };

  const handleAddTag = async () => {
    if (!newTag.name.trim() || !newTag.color) {
      setSaveStatus('Please fill in all fields');
      return;
    }

    const tag = {
      id: newTag.name.toLowerCase().replace(/\s+/g, '_'),
      name: newTag.name.toLowerCase(),
      displayName: newTag.name,
      color: newTag.color,
      type: sectionType
    };

    const updatedTags = [...tags, tag];
    setTags(updatedTags);
    await saveTags(updatedTags);
    setNewTag({ name: '', color: '', type: sectionType });
  };

  const handleEditTag = async (tagId, updates) => {
    const updatedTags = tags.map(tag => 
      tag.id === tagId ? { ...tag, ...updates } : tag
    );
    setTags(updatedTags);
    await saveTags(updatedTags);
    setEditingTag(null);
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) {
      return;
    }

    const updatedTags = tags.filter(tag => tag.id !== tagId);
    setTags(updatedTags);
    await saveTags(updatedTags);
  };

  const getSectionTitle = () => {
    if (sectionType === 'services') return 'Service Categories';
    if (sectionType === 'portfolio') return 'Portfolio Project Types';
    if (sectionType === 'projects') return 'Project Categories';
    return 'Tags';
  };

  const getFieldLabel = () => {
    if (sectionType === 'services') return 'Category';
    if (sectionType === 'portfolio') return 'Project Type';
    if (sectionType === 'projects') return 'Category';
    return 'Tag';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">{getSectionTitle()}</h2>
                <p className="text-sm text-gray-600">Manage tags and their colors for {sectionType} section</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading tags...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Add New Tag */}
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus size={20} />
                  Add New {getFieldLabel()}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getFieldLabel()} Name
                    </label>
                    <input
                      type="text"
                      value={newTag.name}
                      onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={`Enter ${getFieldLabel().toLowerCase()} name...`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <select
                      value={newTag.color}
                      onChange={(e) => setNewTag(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select color...</option>
                      {colorOptions.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {newTag.name && newTag.color && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">Preview: </span>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${newTag.color}`}>
                      {newTag.name}
                    </span>
                  </div>
                )}
                <button
                  onClick={handleAddTag}
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus size={16} />
                  Add {getFieldLabel()}
                </button>
              </div>

              {/* Existing Tags */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Existing {getSectionTitle()} ({tags.length})
                </h3>
                <div className="space-y-3">
                  {tags.map((tag) => (
                    <div key={tag.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      {editingTag === tag.id ? (
                        <EditTagForm
                          tag={tag}
                          colorOptions={colorOptions}
                          onSave={(updates) => handleEditTag(tag.id, updates)}
                          onCancel={() => setEditingTag(null)}
                        />
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${tag.color}`}>
                              {tag.displayName}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                              ID: {tag.id}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingTag(tag.id)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit tag"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteTag(tag.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete tag"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          {saveStatus && (
            <span className={`text-sm font-medium ${
              saveStatus === 'Saved!' ? 'text-green-600' : 
              saveStatus.includes('Error') ? 'text-red-600' : 'text-blue-600'
            }`}>
              {saveStatus}
            </span>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Edit Tag Form Component
 */
function EditTagForm({ tag, colorOptions, onSave, onCancel }) {
  const [editData, setEditData] = useState({
    displayName: tag.displayName,
    color: tag.color
  });

  const handleSave = () => {
    if (!editData.displayName.trim() || !editData.color) {
      return;
    }
    onSave(editData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={editData.displayName}
            onChange={(e) => setEditData(prev => ({ ...prev, displayName: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <select
            value={editData.color}
            onChange={(e) => setEditData(prev => ({ ...prev, color: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {colorOptions.map((color) => (
              <option key={color.value} value={color.value}>
                {color.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {editData.displayName && editData.color && (
        <div>
          <span className="text-sm text-gray-600">Preview: </span>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${editData.color}`}>
            {editData.displayName}
          </span>
        </div>
      )}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save size={16} />
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}