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
  return <NewsDetail newsSlug={slug} />;
}