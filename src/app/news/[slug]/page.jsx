import { Suspense } from 'react';
import NewsDetail from '../../../components/news/NewsDetail';
import ContentManager from '../../../entities/ContentManager';

// Generate static params for all news articles
export async function generateStaticParams() {
  try {
    // Since ContentManager might not work in server context, define news items directly
    const newsItems = [
      {
        slug: 'zscore-studio-launch',
        title: 'ZSCORE Studio Launch'
      },
      {
        slug: 'new-automation-tools-released',
        title: 'Advanced Automation Tools Released'
      }
    ];
    
    // Generate params for each news item
    return newsItems.map((item) => ({
      slug: item.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for news:', error);
    // Return empty array as fallback
    return [];
  }
}

function NewsContent({ slug }) {
  if (!slug) {
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
      <NewsDetail newsSlug={slug} />
    </div>
  );
}

export default async function NewsSlugPage({ params }) {
  const { slug } = await params;
  
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <NewsContent slug={slug} />
    </Suspense>
  );
}