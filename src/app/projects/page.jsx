/**
 * Projects Listing Page
 * Displays recent projects with filtering
 */

import { getAllContent } from '@/lib/content-manager-clean';
import ProjectsListingPage from '@/components/projects/ProjectsListingPage';

// Force dynamic rendering so content updates are reflected immediately
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Projects | ZSCORE.studio',
  description: 'A museum of recent engravings, orchestrations, and collaborations from ZSCORE.studio.',
  openGraph: {
    title: 'Projects | ZSCORE.studio',
    description: 'A museum of recent engravings, orchestrations, and collaborations.',
    type: 'website',
  },
};

export default async function ProjectsPage() {
  let news = [];
  let categories = null;

  try {
    const allContent = await getAllContent();
    news = allContent.projects || [];
    categories = allContent.categories || null;

    news = news.sort((a, b) => {
      const dateA = new Date(a.publication_date || a.created_at || 0);
      const dateB = new Date(b.publication_date || b.created_at || 0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error loading projects:', error);
  }

  return <ProjectsListingPage initialNews={news} initialCategories={categories} />;
}
