/**
 * Portfolio Listing Page
 * Displays all portfolio items with filtering
 */

import { getAllContent } from '@/lib/content-manager-clean';
import { loadHTMLContent } from '@/lib/html-content-manager';
import PortfolioListingPage from '@/components/portfolio/PortfolioListingPage';

/**
 * Generate metadata for SEO
 */
export const metadata = {
  title: 'Portfolio | ZSCORE.studio',
  description: 'A curated collection of professional music engraving, orchestration, and audio programming projects by ZSCORE.studio.',
  openGraph: {
    title: 'Portfolio | ZSCORE.studio',
    description: 'A curated collection of professional music engraving, orchestration, and audio programming projects.',
    type: 'website',
  },
};

/**
 * Portfolio Listing Page Component
 */
export default async function PortfolioPage() {
  // Fetch portfolio data server-side for SEO
  let portfolio = [];
  let categories = null;

  try {
    const allContent = await getAllContent();
    portfolio = allContent.portfolio || [];
    categories = allContent.categories || null;

    // Sort by order field (ascending), fallback to creation date
    portfolio = portfolio.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;

      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error loading portfolio:', error);
  }

  return <PortfolioListingPage initialPortfolio={portfolio} initialCategories={categories} />;
}
