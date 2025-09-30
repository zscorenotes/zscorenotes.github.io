/**
 * Individual News Article Page
 * Loads and displays full HTML content for SEO
 */

import { getAllContent } from '@/lib/content-manager-clean';
import NewsDetail from '../../../components/news/NewsDetail';

/**
 * Generate static params for all news articles
 */
export async function generateStaticParams() {
  try {
    const allContent = await getAllContent();
    const news = allContent.news || [];
    
    return news.map((item) => ({
      slug: item.slug || item.id,
    }));
  } catch (error) {
    console.error('Error generating static params for news:', error);
    return [];
  }
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const allContent = await getAllContent();
    const news = allContent.news || [];
    const article = news.find(item => (item.slug || item.id) === slug);
    
    if (!article) {
      return {
        title: 'Article Not Found',
      };
    }
    
    return {
      title: article.title,
      description: article.excerpt,
      openGraph: {
        title: article.title,
        description: article.excerpt,
        type: 'article',
        publishedTime: article.publication_date || article.created_at,
        images: article.image_urls || [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Article',
    };
  }
}

/**
 * News Article Page Component
 */
export default async function NewsArticlePage({ params }) {
  const { slug } = await params;
  
  try {
    // Fetch all content server-side
    const allContent = await getAllContent();
    const allNews = allContent.news || [];
    
    // Find the specific news item by slug or ID
    let newsItem = allNews.find(item => item.slug === slug);
    if (!newsItem) {
      newsItem = allNews.find(item => item.id === slug);
    }
    
    // If still not found, show 404
    if (!newsItem) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center p-6">
          <div>
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-6">The requested article could not be found.</p>
            <a
              href="/#feed"
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
            >
              Back to Feed
            </a>
          </div>
        </div>
      );
    }
    
    // Load the item with HTML content for display
    const { getContentWithHTML } = await import('@/lib/content-manager-clean');
    const newsItemWithHTML = await getContentWithHTML('news', newsItem.id);
    
    // Get related posts (same category, excluding current post, limit to 3)
    const relatedPosts = allNews
      .filter(item => {
        const isCurrentItem = item.slug === slug || item.id === slug;
        return !isCurrentItem && item.category === newsItem.category;
      })
      .slice(0, 3);
    
    return (
      <NewsDetail 
        newsItem={newsItemWithHTML}
        allNews={allNews}
        relatedPosts={relatedPosts}
      />
    );
  } catch (error) {
    console.error('Error loading news article:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center p-6">
        <div>
          <h1 className="text-2xl font-bold mb-4">Error Loading Article</h1>
          <p className="text-gray-600 mb-6">There was an error loading the article. Please try again.</p>
          <a
            href="/#feed"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Back to Feed
          </a>
        </div>
      </div>
    );
  }
}