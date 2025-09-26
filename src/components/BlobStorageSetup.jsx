'use client';

import { useState, useEffect } from 'react';
import { Cloud, Database, Upload, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Blob Storage Setup Component
 * Helps users set up and migrate to Vercel Blob Storage
 */
export default function BlobStorageSetup({ onComplete }) {
  const [status, setStatus] = useState('checking'); // checking, ready, migrating, complete, error
  const [migrationProgress, setMigrationProgress] = useState([]);
  const [error, setError] = useState('');
  const [storageInfo, setStorageInfo] = useState(null);

  useEffect(() => {
    checkBlobStorageStatus();
  }, []);

  const checkBlobStorageStatus = async () => {
    try {
      setStatus('checking');
      
      // Check if we're in production (blob storage should be available)
      const isProduction = window.location.hostname !== 'localhost';
      
      if (!isProduction) {
        setStatus('ready');
        setStorageInfo({ 
          environment: 'development', 
          message: 'Development environment - using localStorage' 
        });
        return;
      }

      // Test blob storage connectivity
      const response = await fetch('/api/content');
      
      if (response.ok) {
        const data = await response.json();
        setStatus('ready');
        setStorageInfo({ 
          environment: 'production', 
          message: 'Blob storage is connected and ready',
          hasData: data.data && Object.keys(data.data).length > 0
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      console.error('Blob storage check failed:', error);
      setStatus('error');
      setError(`Blob storage connection failed: ${error.message}`);
    }
  };

  const initializeBlobStorage = async () => {
    try {
      setStatus('migrating');
      setMigrationProgress([{ step: 'Initializing blob storage...', status: 'running' }]);

      // Initialize with default data
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'site_content',
          data: {
            lastUpdated: new Date().toISOString(),
            version: 1,
            news: [],
            portfolio: [],
            services: [],
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize: ${response.statusText}`);
      }

      setMigrationProgress(prev => [
        ...prev.map(p => ({ ...p, status: 'complete' })),
        { step: 'Blob storage initialized successfully', status: 'complete' }
      ]);

      setStatus('complete');
      
      if (onComplete) {
        onComplete();
      }

    } catch (error) {
      console.error('Initialization failed:', error);
      setMigrationProgress(prev => [
        ...prev,
        { step: `Error: ${error.message}`, status: 'error' }
      ]);
      setStatus('error');
      setError(error.message);
    }
  };

  const migrateLocalStorage = async () => {
    try {
      setStatus('migrating');
      setMigrationProgress([]);

      // Check for localStorage data
      const STORAGE_KEY = 'zscore_cms_content';
      const storedData = localStorage.getItem(STORAGE_KEY);

      if (!storedData) {
        setMigrationProgress([{ step: 'No localStorage data found', status: 'complete' }]);
        await initializeBlobStorage();
        return;
      }

      const localData = JSON.parse(storedData);
      const contentTypes = Object.keys(localData);

      setMigrationProgress([
        { step: `Found ${contentTypes.length} content types to migrate`, status: 'complete' }
      ]);

      // Migrate each content type
      for (const contentType of contentTypes) {
        setMigrationProgress(prev => [
          ...prev,
          { step: `Migrating ${contentType}...`, status: 'running' }
        ]);

        const response = await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: contentType,
            data: localData[contentType]
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to migrate ${contentType}: ${response.statusText}`);
        }

        setMigrationProgress(prev => 
          prev.map((p, i) => 
            i === prev.length - 1 
              ? { ...p, status: 'complete' }
              : p
          )
        );
      }

      // Create backup
      const backupKey = `${STORAGE_KEY}_backup_${Date.now()}`;
      localStorage.setItem(backupKey, storedData);

      setMigrationProgress(prev => [
        ...prev,
        { step: `Created backup: ${backupKey}`, status: 'complete' },
        { step: 'Migration completed successfully!', status: 'complete' }
      ]);

      setStatus('complete');
      
      if (onComplete) {
        onComplete();
      }

    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationProgress(prev => [
        ...prev,
        { step: `Error: ${error.message}`, status: 'error' }
      ]);
      setStatus('error');
      setError(error.message);
    }
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="animate-spin text-blue-500" size={16} />;
      case 'complete':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={16} />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin mr-3" size={24} />
        <span>Checking blob storage status...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <Cloud className="mx-auto mb-4 text-blue-500" size={48} />
        <h2 className="text-2xl font-bold text-gray-900">Vercel Blob Storage Setup</h2>
        <p className="text-gray-600 mt-2">
          Set up persistent data storage for your website content
        </p>
      </div>

      {/* Storage Info */}
      {storageInfo && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Database className="mr-3 text-blue-600" size={20} />
            <div>
              <p className="font-medium text-blue-900">
                Environment: {storageInfo.environment}
              </p>
              <p className="text-blue-700 text-sm">
                {storageInfo.message}
              </p>
              {storageInfo.hasData && (
                <p className="text-blue-600 text-sm mt-1">
                  ✅ Existing data found in blob storage
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {status === 'ready' && (
        <div className="space-y-4">
          {storageInfo?.environment === 'production' && !storageInfo?.hasData && (
            <>
              <button
                onClick={migrateLocalStorage}
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="mr-2" size={20} />
                Migrate localStorage Data to Blob Storage
              </button>
              
              <div className="text-center text-gray-500">or</div>
              
              <button
                onClick={initializeBlobStorage}
                className="w-full flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Database className="mr-2" size={20} />
                Initialize with Default Data
              </button>
            </>
          )}

          {storageInfo?.environment === 'development' && (
            <div className="text-center">
              <p className="text-gray-600">
                You're in development mode. Data will be stored in localStorage.
              </p>
              <button
                onClick={() => onComplete && onComplete()}
                className="mt-3 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Continue to Admin Panel
              </button>
            </div>
          )}

          {storageInfo?.hasData && (
            <div className="text-center">
              <p className="text-green-600 mb-3">
                ✅ Blob storage is already set up and contains data
              </p>
              <button
                onClick={() => onComplete && onComplete()}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Continue to Admin Panel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Migration Progress */}
      {status === 'migrating' && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Migration Progress</h3>
          <div className="space-y-2">
            {migrationProgress.map((step, index) => (
              <div key={index} className="flex items-center space-x-3">
                <StatusIcon status={step.status} />
                <span className={`text-sm ${
                  step.status === 'error' ? 'text-red-600' : 'text-gray-700'
                }`}>
                  {step.step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success */}
      {status === 'complete' && (
        <div className="text-center">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
          <h3 className="text-xl font-semibold text-green-900 mb-2">
            Setup Complete!
          </h3>
          <p className="text-green-700 mb-4">
            Your data is now stored in Vercel Blob Storage and will persist across deployments.
          </p>
          <button
            onClick={() => onComplete && onComplete()}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Continue to Admin Panel
          </button>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h3 className="text-xl font-semibold text-red-900 mb-2">
            Setup Failed
          </h3>
          <p className="text-red-700 mb-4">
            {error}
          </p>
          <div className="space-x-3">
            <button
              onClick={checkBlobStorageStatus}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => onComplete && onComplete()}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Make sure your Vercel project has blob storage enabled</li>
          <li>• Check that your <code>BLOB_READ_WRITE_TOKEN</code> environment variable is set</li>
          <li>• Blob storage requires a Vercel Pro plan or higher</li>
        </ul>
      </div>
    </div>
  );
}