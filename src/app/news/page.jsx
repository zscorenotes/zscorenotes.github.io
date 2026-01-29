/**
 * News Listing Page
 * Displays all news articles with filtering
 */

import { getAllContent } from '@/lib/content-manager-clean';
import NewsListingPage from '@/components/news/NewsListingPage';

/**
 * Generate metadata for SEO
 */
export const metadata = {
  title: 'Feed | ZSCORE.studio',
  description: 'Latest developments in music technology, project updates, and industry insights from ZSCORE.studio.',
  openGraph: {
    title: 'Feed | ZSCORE.studio',
    description: 'Latest developments in music technology, project updates, and industry insights.',
    type: 'website',
  },
};

/**
 * News Listing Page Component
 */
export default async function NewsPage() {
  let news = [];
  let categories = null;

  try {
    const allContent = await getAllContent();
    news = allContent.news || [];
    categories = allContent.categories || null;

    // Sort by publication_date descending
    news = news.sort((a, b) => {
      const dateA = new Date(a.publication_date || a.created_at || 0);
      const dateB = new Date(b.publication_date || b.created_at || 0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error loading news:', error);
  }

  return <NewsListingPage initialNews={news} initialCategories={categories} />;
}
