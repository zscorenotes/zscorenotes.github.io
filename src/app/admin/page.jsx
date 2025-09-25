'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Import the AdminPanel component with SSR disabled
const DynamicAdminPanel = dynamic(() => import('../../components/AdminPanel'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-xl font-mono">Loading Admin Panel...</div>
    </div>
  )
});

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home in production
    if (process.env.NODE_ENV === 'production') {
      router.replace('/');
      return;
    }
  }, [router]);

  // Don't render admin panel in production
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <p className="text-gray-600">This page is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <DynamicAdminPanel />
    </Suspense>
  );
}