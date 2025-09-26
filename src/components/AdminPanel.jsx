'use client';

import React, { useState, useEffect } from 'react';
import * as ContentManager from '@/lib/content-manager-clean';
import AuthGuard from './AuthGuard';
import RichEditor from './RichEditor';
import { getStoredInquiries, updateInquiryStatus, deleteInquiry } from '@/api.js';
import ImageUpload from './ImageUpload';
import DragDropList from './DragDropList';
import InlineCategorySelector from './InlineCategorySelector';
import { Save, FileText, Settings, User, Briefcase, Phone, Edit, Plus, Trash2, Eye, Shield, Sparkles, Mail, Clock, CheckCircle, Archive } from 'lucide-react';

/**
 * Main Admin Panel for Content Management
 * Provides interface for editing all website content
 */
export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState('inquiries');
  const [content, setContent] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Content sections configuration with enhanced features
  const sections = [
    { key: 'inquiries', label: 'Inquiries', icon: Mail, color: 'bg-red-500', description: 'Manage contact form submissions' },
    { key: 'news', label: 'Feed', icon: FileText, color: 'bg-blue-500', description: 'Manage news articles and updates' },
    { key: 'services', label: 'Services', icon: Briefcase, color: 'bg-green-500', description: 'Edit service offerings' },
    { key: 'portfolio', label: 'Portfolio', icon: Edit, color: 'bg-purple-500', description: 'Showcase project work' },
    { key: 'about', label: 'About', icon: User, color: 'bg-orange-500', description: 'Personal information' },
  ];

  // Load all content on mount
  useEffect(() => {
    loadAllContent();
    loadInquiries();
  }, []);

  // Load inquiries when inquiries section is active
  useEffect(() => {
    if (activeSection === 'inquiries') {
      loadInquiries();
    }
  }, [activeSection]);

  const loadAllContent = async () => {
    setIsLoading(true);
    try {
      const allContent = await ContentManager.getAllContent();
      console.log('✅ Clean content loaded:', Object.keys(allContent));
      
      // Auto-migrate existing content to HTML file structure if needed
      try {
        await ContentManager.migrateAllContentToHTML();
        // Reload content after potential migration
        const updatedContent = await ContentManager.getAllContent();
        setContent(updatedContent);
      } catch (migrationError) {
        console.warn('Migration warning:', migrationError);
        // Use original content if migration fails
        setContent(allContent);
      }
      
      // Auto-select content based on active section type
      if (activeSection === 'about' || activeSection === 'settings') {
        setSelectedItem(allContent[activeSection] || {});
      } else if (allContent[activeSection] && Array.isArray(allContent[activeSection]) && allContent[activeSection].length > 0) {
        setSelectedItem(allContent[activeSection][0]);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInquiries = () => {
    try {
      const storedInquiries = getStoredInquiries();
      setInquiries(storedInquiries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (error) {
      console.error('Error loading inquiries:', error);
    }
  };

  const handleInquiryStatusUpdate = async (inquiryId, newStatus) => {
    const success = updateInquiryStatus(inquiryId, newStatus);
    if (success) {
      loadInquiries();
      setSaveStatus(`Inquiry status updated to ${newStatus}`);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleInquiryDelete = async (inquiryId) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      const success = deleteInquiry(inquiryId);
      if (success) {
        loadInquiries();
        setSelectedInquiry(null);
        setSaveStatus('Inquiry deleted successfully');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    }
  };

  const handleSectionChange = (sectionKey) => {
    setActiveSection(sectionKey);
    setSelectedItem(null);
    setSelectedInquiry(null);
    
    // Auto-select content based on section type
    if (sectionKey === 'about' || sectionKey === 'settings') {
      // For object-type content, select the entire object
      setSelectedItem(content[sectionKey] || {});
    } else if (content[sectionKey] && Array.isArray(content[sectionKey]) && content[sectionKey].length > 0) {
      // For array-type content, select first item
      setSelectedItem(content[sectionKey][0]);
    }
  };

  const handleItemSelect = async (item) => {
    try {
      // If item has content_file, load the HTML content for editing
      if (item.content_file) {
        setSaveStatus('Loading content...');
        const itemWithHTML = await ContentManager.getContentWithHTML(activeSection, item.id);
        setSelectedItem(itemWithHTML);
        setSaveStatus('');
      } else {
        setSelectedItem(item);
      }
    } catch (error) {
      console.error('Error loading item content:', error);
      setSaveStatus('Error loading content');
      setTimeout(() => setSaveStatus(''), 3000);
      // Fallback to item without HTML content
      setSelectedItem(item);
    }
  };

  const handleItemSave = async (updatedItem) => {
    setSaveStatus('Saving...');
    try {
      const success = await ContentManager.updateItem(activeSection, updatedItem.id, updatedItem);
      
      if (success) {
        // Update local state
        const updatedContent = { ...content };
        const itemIndex = updatedContent[activeSection].findIndex(item => item.id === updatedItem.id);
        if (itemIndex !== -1) {
          updatedContent[activeSection][itemIndex] = updatedItem;
          setContent(updatedContent);
          setSelectedItem(updatedItem);
        }
        
        setSaveStatus('Saved!');
        setTimeout(() => setSaveStatus(''), 2000);
      } else {
        setSaveStatus('Error saving');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (error) {
      console.error('Error saving:', error);
      setSaveStatus('Error saving');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleAddNew = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const newItem = {
      title: 'New Item',
      ...getDefaultFieldsForSection(activeSection)
    };
    
    try {
      setSaveStatus('Creating...');
      const createdItem = await ContentManager.addItem(activeSection, newItem);
      
      if (createdItem) {
        // Update local state immediately
        const updatedContent = { ...content };
        updatedContent[activeSection] = [...(updatedContent[activeSection] || []), createdItem];
        setContent(updatedContent);
        setSelectedItem(createdItem);
        
        setSaveStatus('Created!');
        setTimeout(() => setSaveStatus(''), 2000);
      } else {
        setSaveStatus('Error creating item');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (error) {
      console.error('Error creating item:', error);
      setSaveStatus('Error creating item');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleItemsReorder = async (reorderedItems) => {
    try {
      setSaveStatus('Reordering...');
      
      // Update the content state with reordered items
      const updatedContent = { ...content };
      updatedContent[activeSection] = reorderedItems;
      setContent(updatedContent);
      
      // Save each item with its new order
      await Promise.all(reorderedItems.map(item => 
        ContentManager.updateItem(activeSection, item.id, item)
      ));
      
      setSaveStatus('Order saved!');
      setTimeout(() => setSaveStatus(''), 2000);
      
      // Trigger content update event for live preview
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('zscore-content-updated', {
          detail: { contentType: activeSection }
        }));
      }
    } catch (error) {
      console.error('Error reordering items:', error);
      setSaveStatus('Error saving order');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleItemDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.title || 'this item'}"?`)) {
      return;
    }
    
    try {
      setSaveStatus('Deleting...');
      const success = await ContentManager.deleteItem(activeSection, item.id);
      
      if (success) {
        // Update local state
        const updatedContent = { ...content };
        updatedContent[activeSection] = updatedContent[activeSection].filter(i => i.id !== item.id);
        setContent(updatedContent);
        
        // Clear selection if deleted item was selected
        if (selectedItem?.id === item.id) {
          setSelectedItem(null);
        }
        
        setSaveStatus('Deleted!');
        setTimeout(() => setSaveStatus(''), 2000);
      } else {
        setSaveStatus('Error deleting');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setSaveStatus('Error deleting');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const getDefaultFieldsForSection = (section) => {
    switch (section) {
      case 'news':
        return {
          category: 'announcement',
          excerpt: '',
          content: '',
          content_html: '',
          tags: [],
          featured: false,
          publication_date: new Date().toISOString().split('T')[0],
          image_urls: []
        };
      case 'services':
        return {
          description: '',
          detailed_description: '',
          features: [],
          category: 'service',
          icon: '',
          pricing: ''
        };
      case 'portfolio':
        return {
          description: '',
          detailed_description: '',
          technologies: [],
          year: new Date().getFullYear(),
          category: 'project',
          client: '',
          image_urls: [],
          content_blocks: []
        };
      case 'about':
        return {
          content: '',
          role: '',
          bio: ''
        };
      default:
        return {};
    }
  };

  const renderInquiriesList = () => {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Inquiries
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {inquiries.length} inquir{inquiries.length !== 1 ? 'ies' : 'y'} total
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {inquiries.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">No inquiries yet</h4>
              <p className="text-sm text-gray-500">
                Contact form submissions will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  onClick={() => setSelectedInquiry(inquiry)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors relative ${
                    selectedInquiry?.id === inquiry.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                          {inquiry.name}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          inquiry.status === 'new' ? 'bg-red-100 text-red-700' :
                          inquiry.status === 'viewed' ? 'bg-yellow-100 text-yellow-700' :
                          inquiry.status === 'replied' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {inquiry.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">
                        {inquiry.email}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        {new Date(inquiry.timestamp).toLocaleDateString()} at {new Date(inquiry.timestamp).toLocaleTimeString()}
                      </p>
                      {inquiry.project_type && (
                        <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded mb-2">
                          {inquiry.project_type.replace('_', ' ')}
                        </span>
                      )}
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {inquiry.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInquiryViewer = () => {
    if (!selectedInquiry) {
      return (
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select an inquiry</h3>
            <p className="text-gray-500">Choose an inquiry from the list to view details</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 bg-white flex flex-col">
        <div className="border-b border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Inquiry from {selectedInquiry.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Received on {new Date(selectedInquiry.timestamp).toLocaleDateString()} at {new Date(selectedInquiry.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedInquiry.status}
                onChange={(e) => handleInquiryStatusUpdate(selectedInquiry.id, e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-1"
              >
                <option value="new">New</option>
                <option value="viewed">Viewed</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
              <button
                onClick={() => handleInquiryDelete(selectedInquiry.id)}
                className="text-red-600 hover:text-red-700 p-1"
                title="Delete inquiry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-sm text-gray-900">{selectedInquiry.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-sm text-gray-900">
                  <a href={`mailto:${selectedInquiry.email}`} className="text-blue-600 hover:underline">
                    {selectedInquiry.email}
                  </a>
                </p>
              </div>
            </div>

            {selectedInquiry.project_type && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                <p className="text-sm text-gray-900 capitalize">{selectedInquiry.project_type.replace('_', ' ')}</p>
              </div>
            )}

            {selectedInquiry.budget_range && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                <p className="text-sm text-gray-900 capitalize">{selectedInquiry.budget_range.replace('_', ' ')}</p>
              </div>
            )}

            {selectedInquiry.timeline && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                <p className="text-sm text-gray-900">{selectedInquiry.timeline}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <div className="bg-gray-50 p-4 rounded border">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedInquiry.message}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => window.open(`mailto:${selectedInquiry.email}?subject=Re: Your inquiry&body=Hi ${selectedInquiry.name},%0D%0A%0D%0AThank you for your inquiry.%0D%0A%0D%0ABest regards`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Reply via Email
                </button>
                <button
                  onClick={() => handleInquiryStatusUpdate(selectedInquiry.id, selectedInquiry.status === 'new' ? 'viewed' : 'replied')}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as {selectedInquiry.status === 'new' ? 'Viewed' : 'Replied'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderItemsList = () => {
    const currentSection = sections.find(s => s.key === activeSection);
    const sectionContent = content[activeSection];
    
    // Handle object-type content (about, settings)
    if (activeSection === 'about' || activeSection === 'settings') {
      return (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {currentSection?.label}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {currentSection?.description}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div
                onClick={() => setSelectedItem(sectionContent || {})}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors relative border rounded-lg ${
                  selectedItem ? 'bg-blue-50 border-blue-500' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">
                      {activeSection === 'about' ? 'About Section Content' : 'Site Settings'}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">
                      Click to edit {activeSection} configuration
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                        Configuration
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Handle array-type content (news, services, portfolio)
    const items = Array.isArray(sectionContent) ? sectionContent : [];
    
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-gray-900">
                {currentSection?.label} Items
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {items.length} item{items.length !== 1 ? 's' : ''} total
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Add New
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {/* Only show drag-drop for services and portfolio */}
          {(activeSection === 'services' || activeSection === 'portfolio') ? (
            <DragDropList
              items={items}
              onReorder={handleItemsReorder}
              onEdit={handleItemSelect}
              onDelete={handleItemDelete}
              onAdd={handleAddNew}
              itemType={activeSection.slice(0, -1)} // Remove 's' from end
              renderItem={(item, index) => (
                <div 
                  className={`flex items-start justify-between p-3 bg-white rounded border cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedItem?.id === item.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handleItemSelect(item)}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate mb-1">
                      {item.title || 'Untitled'}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'No date'}
                    </p>
                    {item.excerpt && (
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {item.excerpt}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {item.category && (
                        <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                          {item.category}
                        </span>
                      )}
                      {item.featured && (
                        <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedItem?.id === item.id && (
                    <div className="ml-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              )}
            />
          ) : (
            // Fallback to original list for other sections (news, etc.)
            items.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <currentSection.icon className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">No items yet</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Create your first {activeSection} item to get started.
                </p>
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Create First Item →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`group p-4 hover:bg-gray-50 transition-colors relative ${
                      selectedItem?.id === item.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => handleItemSelect(item)}
                      >
                        <h4 className="font-semibold text-sm text-gray-900 truncate mb-1">
                          {item.title || 'Untitled'}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'No date'}
                        </p>
                        {item.excerpt && (
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {item.excerpt}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {item.category && (
                            <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                              {item.category}
                            </span>
                          )}
                          {item.featured && (
                            <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemDelete(item);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete item"
                        >
                          <Trash2 size={16} />
                        </button>
                        {selectedItem?.id === item.id && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  const renderEditor = () => {
    if (!selectedItem) {
      return (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center text-gray-500 max-w-md">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Edit size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Item Selected</h3>
            <p className="text-gray-600 mb-6">
              Choose an item from the sidebar to start editing, or create a new one to get started.
            </p>
            <button
              type="button"
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors mx-auto"
            >
              <Plus size={16} />
              Create New Item
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col bg-white">
        {/* Enhanced Editor Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900 truncate">
                    {selectedItem.title || 'Untitled'}
                  </h2>
                </div>
                <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded border">
                  {sections.find(s => s.key === activeSection)?.label} Item
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>ID: {selectedItem.id}</span>
                {selectedItem.created_at && (
                  <span>Created: {new Date(selectedItem.created_at).toLocaleDateString()}</span>
                )}
                {selectedItem.updated_at && (
                  <span>Modified: {new Date(selectedItem.updated_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleItemSave(selectedItem)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <Save size={16} />
                Save Changes
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Eye size={16} />
                Close
              </button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Editor Content */}
        <div className="flex-1 overflow-hidden">
          <EnhancedItemEditor
            item={selectedItem}
            section={activeSection}
            onChange={setSelectedItem}
            onSave={() => handleItemSave(selectedItem)}
            saveStatus={saveStatus}
          />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <AuthGuard onAuthenticated={setIsAuthenticated}>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-xl font-mono">Loading Content Manager...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard onAuthenticated={setIsAuthenticated}>
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-green-600" />
                  <h1 className="text-2xl font-bold text-gray-900">ZSCORE Admin</h1>
                </div>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Content Management System
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    previewMode 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Eye size={16} />
                  {previewMode ? 'Exit Preview' : 'Live Preview'}
                </button>
                {saveStatus && (
                  <span className={`text-sm font-medium ${
                    saveStatus === 'Saved!' ? 'text-green-600' : 
                    saveStatus.includes('Error') ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {saveStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Section Navigation */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex space-x-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.key}
                  onClick={() => handleSectionChange(section.key)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all relative group ${
                    activeSection === section.key 
                      ? 'bg-black text-white shadow-lg' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <div className="text-left">
                    <div className="font-medium">{section.label}</div>
                    <div className={`text-xs ${activeSection === section.key ? 'text-gray-300' : 'text-gray-500'}`}>
                      {section.description}
                    </div>
                  </div>
                  {section.key === 'inquiries' ? (
                    inquiries.length > 0 && (
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                        activeSection === section.key 
                          ? 'bg-white/20 text-white' 
                          : inquiries.filter(inq => inq.status === 'new').length > 0
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {inquiries.length}
                        {inquiries.filter(inq => inq.status === 'new').length > 0 && (
                          <span className="ml-1 animate-pulse">●</span>
                        )}
                      </span>
                    )
                  ) : (
                    content[section.key] && (
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                        activeSection === section.key 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {section.key === 'about' || section.key === 'settings' 
                          ? '✓' 
                          : (Array.isArray(content[section.key]) ? content[section.key].length : 0)
                        }
                      </span>
                    )
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-140px)]">
          {activeSection === 'inquiries' ? renderInquiriesList() : renderItemsList()}
          {activeSection === 'inquiries' ? renderInquiryViewer() : renderEditor()}
        </div>
      </div>

    </AuthGuard>
  );
}

/**
 * Enhanced editor component with RichEditor integration
 */
function EnhancedItemEditor({ item, section, onChange, onSave, saveStatus }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [siteSettings, setSiteSettings] = useState({});

  // Load site settings on mount
  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const allContent = await ContentManager.getAllContent();
        setSiteSettings(allContent.settings || {});
      } catch (error) {
        console.error('Error loading site settings:', error);
      }
    };
    loadSiteSettings();
  }, []);

  const handleFieldChange = (field, value) => {
    const updatedItem = { ...item, [field]: value, updated_at: new Date().toISOString() };
    onChange(updatedItem);
  };

  const handleArrayFieldChange = (field, index, value) => {
    const updatedArray = [...(item[field] || [])];
    updatedArray[index] = value;
    handleFieldChange(field, updatedArray);
  };

  const addArrayItem = (field) => {
    const currentArray = item[field] || [];
    handleFieldChange(field, [...currentArray, '']);
  };

  const removeArrayItem = (field, index) => {
    const updatedArray = [...(item[field] || [])];
    updatedArray.splice(index, 1);
    handleFieldChange(field, updatedArray);
  };

  const tabs = [
    { key: 'basic', label: 'Basic Info', icon: Edit },
    { key: 'content', label: 'Rich Content', icon: FileText },
    { key: 'advanced', label: 'Advanced', icon: Settings },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <nav className="flex px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Title */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a compelling title..."
                />
              </div>

              {/* Section-specific basic fields */}
              {section === 'news' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Category</label>
                    <InlineCategorySelector
                      value={item.category || ''}
                      onChange={(value) => handleFieldChange('category', value)}
                      section="news"
                      placeholder="Select or create category..."
                    />
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Publication Date</label>
                    <input
                      type="date"
                      value={item.publication_date || ''}
                      onChange={(e) => handleFieldChange('publication_date', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Excerpt/Description */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  {section === 'news' ? 'Excerpt' : 'Description'}
                </label>
                <textarea
                  value={item.excerpt || item.description || ''}
                  onChange={(e) => handleFieldChange(section === 'news' ? 'excerpt' : 'description', e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                  placeholder="Write a compelling summary..."
                />
                <div className="mt-2 text-xs text-gray-500">
                  Keep it concise and engaging - this appears in previews and search results.
                </div>
              </div>

              {/* Images for News */}
              {section === 'news' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Featured Images
                  </label>
                  <p className="text-xs text-gray-500 mb-4">
                    Upload images to display alongside your news articles. The first image will be shown as the featured image.
                  </p>
                  
                  {/* Current Images */}
                  <div className="space-y-4 mb-4">
                    {(item.image_urls || []).map((url, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">
                            {index === 0 ? "Featured Image" : `Additional Image ${index + 1}`}
                          </span>
                          <button
                            onClick={() => removeArrayItem('image_urls', index)}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-sm flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                        <ImageUpload
                          currentImage={url}
                          onImageUploaded={(newUrl) => handleArrayFieldChange('image_urls', index, newUrl)}
                          label=""
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Add New Image */}
                  <button
                    onClick={() => addArrayItem('image_urls')}
                    className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Plus size={16} />
                    Add New Image
                  </button>
                </div>
              )}

              {/* Images for Services */}
              {section === 'services' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Service Images
                  </label>
                  <p className="text-xs text-gray-500 mb-4">
                    Upload images to showcase your service offerings. The first image will be displayed on the service card.
                  </p>
                  
                  {/* Current Images */}
                  <div className="space-y-4 mb-4">
                    {(item.image_urls || []).map((url, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">
                            {index === 0 ? "Featured Service Image" : `Service Image ${index + 1}`}
                          </span>
                          <button
                            onClick={() => removeArrayItem('image_urls', index)}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-sm flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                        <ImageUpload
                          currentImage={url}
                          onImageUploaded={(newUrl) => handleArrayFieldChange('image_urls', index, newUrl)}
                          label=""
                        />
                        {index === 0 && (
                          <p className="text-xs text-gray-500 mt-2">This image will appear on the service card alongside the service details.</p>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Add New Image */}
                  <button
                    onClick={() => addArrayItem('image_urls')}
                    className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-3 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                  >
                    <Plus size={16} />
                    Add Service Image
                  </button>
                </div>
              )}

              {/* Images for Portfolio */}
              {section === 'portfolio' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Project Images
                  </label>
                  <p className="text-xs text-gray-500 mb-4">
                    Upload images to showcase your portfolio project. The first image will be used as the featured image in the grid.
                  </p>
                  
                  {/* Current Images */}
                  <div className="space-y-4 mb-4">
                    {(item.image_urls || []).map((url, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">
                            {index === 0 ? "Featured Project Image" : `Project Image ${index + 1}`}
                          </span>
                          <button
                            onClick={() => removeArrayItem('image_urls', index)}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-sm flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                        <ImageUpload
                          currentImage={url}
                          onImageUploaded={(newUrl) => handleArrayFieldChange('image_urls', index, newUrl)}
                          label=""
                        />
                        {index === 0 && (
                          <p className="text-xs text-gray-500 mt-2">This image will appear on the portfolio grid with 4:5 aspect ratio.</p>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Add New Image */}
                  <button
                    onClick={() => addArrayItem('image_urls')}
                    className="flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-3 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                  >
                    <Plus size={16} />
                    Add Project Image
                  </button>
                </div>
              )}


              {/* Feature toggle */}
              {section === 'news' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={item.featured || false}
                      onChange={(e) => handleFieldChange('featured', e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-900">Featured Article</span>
                      <p className="text-xs text-gray-500">This article will be highlighted on the homepage</p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Rich Content Editor */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Rich HTML Content</h3>
                  <p className="text-sm text-gray-600">
                    Create beautiful, responsive content using HTML and Tailwind CSS classes.
                  </p>
                </div>
                <div className="p-6">
                  <RichEditor
                    value={item.content_html || item.detailed_description || ''}
                    onChange={(value) => handleFieldChange(
                      section === 'portfolio' || section === 'services' ? 'detailed_description' : 'content_html', 
                      value
                    )}
                    sectionType={section}
                    height="500px"
                    showPreview={true}
                    placeholder="Start creating your content..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              {/* Tags/Technologies */}
              {(section === 'news' || section === 'portfolio') && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    {section === 'news' ? 'Tags' : 'Technologies'}
                  </label>
                  <InlineCategorySelector
                    value={item.tags || item.technologies || []}
                    onChange={(value) => handleFieldChange(section === 'news' ? 'tags' : 'technologies', value)}
                    section={section === 'news' ? 'news_tags' : 'portfolio_technologies'}
                    placeholder={`Select or create ${section === 'news' ? 'tags' : 'technologies'}...`}
                    allowMultiple={true}
                  />
                </div>
              )}

              {/* Portfolio-specific fields */}
              {section === 'portfolio' && (
                <div className="space-y-6">
                  {/* First row: Project Type, Client, Year */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <label className="block text-sm font-bold text-gray-700 mb-3">Project Type</label>
                      <InlineCategorySelector
                        value={item.project_type || ''}
                        onChange={(value) => handleFieldChange('project_type', value)}
                        section="portfolio"
                        placeholder="Select or create project type..."
                        allowMultiple={true}
                      />
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <label className="block text-sm font-bold text-gray-700 mb-3">Client</label>
                      <input
                        type="text"
                        value={item.client || ''}
                        onChange={(e) => handleFieldChange('client', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Client or company name..."
                      />
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <label className="block text-sm font-bold text-gray-700 mb-3">Completion Year</label>
                      <input
                        type="number"
                        value={item.completion_year || item.year || new Date().getFullYear()}
                        onChange={(e) => handleFieldChange('completion_year', parseInt(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="2000"
                        max={new Date().getFullYear() + 5}
                      />
                    </div>
                  </div>

                  {/* Second row: Composer, Publisher, Instrumentation */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <label className="block text-sm font-bold text-gray-700 mb-3">Composer</label>
                      <input
                        type="text"
                        value={item.composer || ''}
                        onChange={(e) => handleFieldChange('composer', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter composer name..."
                      />
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <label className="block text-sm font-bold text-gray-700 mb-3">Publisher</label>
                      <input
                        type="text"
                        value={item.publisher || ''}
                        onChange={(e) => handleFieldChange('publisher', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter publisher name..."
                      />
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <label className="block text-sm font-bold text-gray-700 mb-3">Instrumentation</label>
                      <input
                        type="text"
                        value={item.instrumentation || ''}
                        onChange={(e) => handleFieldChange('instrumentation', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Orchestra, String Quartet, Piano Solo..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Service-specific fields */}
              {section === 'services' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Service Category</label>
                  <InlineCategorySelector
                    value={item.category || ''}
                    onChange={(value) => handleFieldChange('category', value)}
                    section="services"
                    placeholder="Select or create category..."
                  />
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {item.updated_at && (
              <span>Last saved: {new Date(item.updated_at).toLocaleString()}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {saveStatus && (
              <span className={`text-sm font-medium ${
                saveStatus === 'Saved!' ? 'text-green-600' : 
                saveStatus.includes('Error') ? 'text-red-600' : 'text-blue-600'
              }`}>
                {saveStatus}
              </span>
            )}
            <button
              onClick={onSave}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}