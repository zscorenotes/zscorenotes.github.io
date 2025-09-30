/**
 * Individual Portfolio Project Page
 * Loads and displays full HTML content for SEO
 */

import { getAllContent } from '@/lib/content-manager-clean';
import PortfolioDetail from '../../../components/portfolio/PortfolioDetailPage';

/**
 * Generate static params for all portfolio projects
 */
export async function generateStaticParams() {
  try {
    const allContent = await getAllContent();
    const portfolio = allContent.portfolio || [];
    
    return portfolio.map((item) => ({
      slug: item.slug || item.id,
    }));
  } catch (error) {
    console.error('Error generating static params for portfolio:', error);
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
    const portfolio = allContent.portfolio || [];
    const project = portfolio.find(item => (item.slug || item.id) === slug);
    
    if (!project) {
      return {
        title: 'Project Not Found',
      };
    }
    
    return {
      title: project.title,
      description: project.description,
      openGraph: {
        title: project.title,
        description: project.description,
        type: 'article',
        publishedTime: project.created_at,
        images: project.image_urls || [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Portfolio Project',
    };
  }
}

/**
 * Portfolio Project Page Component
 */
export default async function PortfolioProjectPage({ params }) {
  const { slug } = await params;
  return <PortfolioDetail portfolioSlug={slug} />;
}