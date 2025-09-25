'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Import components with SSR disabled to prevent window errors
const DynamicHome = dynamic(() => import('../components/HomePage'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-xl font-mono">Loading ZSCORE...</div>
    </div>
  )
});

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl font-mono">Loading ZSCORE...</div>
      </div>
    );
  }

  return <DynamicHome />;
}