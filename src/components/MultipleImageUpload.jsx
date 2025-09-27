'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, Loader, Plus } from 'lucide-react';

/**
 * Multiple Image Upload Component
 * Handles multiple image selection and upload at once
 */
export default function MultipleImageUpload({ 
  onImagesUploaded, 
  label = 'Upload Multiple Images',
  accept = 'image/*',
  className = ''
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef(null);

  // Handle multiple file upload to server
  const uploadFiles = useCallback(async (files) => {
    setIsUploading(true);
    setError('');
    setUploadProgress(`Uploading ${files.length} image(s)...`);

    try {
      const validFiles = [];
      
      // Validate all files first
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        const maxSize = process.env.NODE_ENV === 'development' ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
        const maxSizeText = process.env.NODE_ENV === 'development' ? '5MB' : '50MB';
        
        if (file.size > maxSize) {
          throw new Error(`${file.name} is larger than ${maxSizeText}`);
        }
        
        validFiles.push(file);
      }

      // Create form data with all files
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('folder', 'images');

      setUploadProgress(`Uploading ${validFiles.length} image(s) to server...`);

      // Upload to server
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
      
      // Extract URLs from successful uploads
      const urls = [];
      if (data.results) {
        // Multiple files response
        data.results.forEach(result => {
          if (result.success && result.url) {
            urls.push(result.url);
          }
        });
      } else if (data.url) {
        // Single file response
        urls.push(data.url);
      }

      if (urls.length > 0) {
        setUploadProgress(`Successfully uploaded ${urls.length} image(s)`);
        setTimeout(() => setUploadProgress(''), 2000);
        
        // Call the callback with the new image URLs
        if (onImagesUploaded) {
          onImagesUploaded(urls);
        }
      } else {
        throw new Error('No images were successfully uploaded');
      }

    } catch (err) {
      const errorMessage = err.message || 'Unknown upload error occurred';
      setError(errorMessage);
      console.error('Multiple upload error details:', {
        message: err.message,
        stack: err.stack,
        error: err
      });
    } finally {
      setIsUploading(false);
    }
  }, [onImagesUploaded]);

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
      uploadFiles(files);
    }
  }, [uploadFiles]);

  // Handle file input change
  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      uploadFiles(files);
    }
  }, [uploadFiles]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 hover:bg-gray-50
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader className="mb-2 animate-spin text-blue-500" size={24} />
            <p className="text-sm text-gray-600">{uploadProgress}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-2">
              <Upload className="mr-2 text-gray-400" size={24} />
              <Plus className="text-gray-400" size={16} />
            </div>
            <p className="text-sm text-gray-600 mb-1">
              {label}
            </p>
            <p className="text-xs text-gray-400">
              Drag and drop multiple images here, or click to select
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports: JPG, PNG, GIF, WebP (max {process.env.NODE_ENV === 'development' ? '5MB' : '50MB'} each)
            </p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
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