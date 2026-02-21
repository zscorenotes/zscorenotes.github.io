'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, Loader } from 'lucide-react';

/**
 * Image Upload Component
 * Handles drag-drop and file selection for image uploads
 * Saves images to /public/images/ and returns the URL
 */
export default function ImageUpload({ 
  onImageUploaded, 
  currentImage = '', 
  label = 'Upload Image',
  accept = 'image/*',
  className = ''
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Handle file upload to server
  const uploadFile = useCallback(async (file) => {
    setIsUploading(true);
    setError('');

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (max 50MB for production, 5MB for local)
      const maxSize = process.env.NODE_ENV === 'development' ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
      const maxSizeText = process.env.NODE_ENV === 'development' ? '5MB' : '50MB';
      
      if (file.size > maxSize) {
        throw new Error(`Image must be smaller than ${maxSizeText}`);
      }

      // Create form data
      const formData = new FormData();
      formData.append('files', file);
      formData.append('folder', 'images');

      // Upload to blob storage via our API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorData.message || `Upload failed (${response.status})`;
        } catch {
          errorMessage = `Upload failed (${response.status}: ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Call the callback with the new image URL and optional thumbnail URL
      if (onImageUploaded) {
        onImageUploaded(data.url, data.thumbnail_url || null);
      }

    } catch (err) {
      const errorMessage = err.message || 'Unknown upload error occurred';
      setError(errorMessage);
      console.error('Upload error details:', {
        message: err.message,
        stack: err.stack,
        error: err
      });
    } finally {
      setIsUploading(false);
    }
  }, [onImageUploaded]);

  // Handle drag events
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, [uploadFile]);

  // Handle file input change
  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, [uploadFile]);

  // Handle remove image
  const handleRemoveImage = useCallback(() => {
    if (onImageUploaded) {
      onImageUploaded('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImageUploaded]);

  return (
    <div className={`image-upload-container ${className}`}>
      <label className="block text-sm font-medium mb-2">{label}</label>
      
      {/* Current Image Preview */}
      {currentImage && !isUploading && (
        <div className="mb-4 relative inline-block">
          <img
            src={currentImage}
            alt="Current image"
            className="w-32 h-32 object-cover rounded border"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            title="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader className="animate-spin mb-2" size={24} />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="mb-2 text-gray-400" size={24} />
            <p className="text-sm text-gray-600 mb-1">
              Drag and drop an image here, or click to select
            </p>
            <p className="text-xs text-gray-400">
              Supports: JPG, PNG, GIF, WebP (max {process.env.NODE_ENV === 'development' ? '5MB' : '50MB'})
            </p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-2">
              <h3 className="text-sm font-medium text-red-800">Upload Failed</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}