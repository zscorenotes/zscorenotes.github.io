'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

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
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <DynamicAdminPanel />
    </Suspense>
  );
}