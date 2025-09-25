'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import NewsDetail from '../../components/news/NewsDetail';

function NewsContent() {
  const searchParams = useSearchParams();
  const newsId = searchParams.get('id');
  
  if (!newsId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">News Article Not Found</h1>
          <p className="text-gray-600">Please select a news article to view.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <NewsDetail newsId={newsId} />
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <NewsContent />
    </Suspense>
  );
}