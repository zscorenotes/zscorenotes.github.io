/**
 * Materials Listing Page
 * Displays all material/service offerings
 */

import { getAllContent } from '@/lib/content-manager-clean';
import MaterialsListingPage from '@/components/materials/MaterialsListingPage';

/**
 * Generate metadata for SEO
 */
export const metadata = {
  title: 'Materials | ZSCORE.studio',
  description: 'Preparation of contemporary music materials for performance and publication. Full scores, performance materials, editorial preparation, and more.',
  openGraph: {
    title: 'Materials | ZSCORE.studio',
    description: 'Preparation of contemporary music materials for performance and publication.',
    type: 'website',
  },
};

/**
 * Materials Listing Page Component
 */
export default async function MaterialsPage() {
  let services = [];
  let categories = null;

  try {
    const allContent = await getAllContent();
    services = allContent.services || [];
    categories = allContent.categories || null;

    // Sort by order field (ascending), fallback to creation date
    services = services.sort((a, b) => {
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
    console.error('Error loading materials:', error);
  }

  return <MaterialsListingPage initialServices={services} initialCategories={categories} />;
}
