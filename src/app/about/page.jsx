/**
 * About Page
 * Displays information about ZSCORE: philosophy, team, and expertise.
 */

import { getAllContent } from '@/lib/content-manager-clean';
import AboutPage from '@/components/about/AboutPage';

/**
 * Generate metadata for SEO
 */
export const metadata = {
  title: 'About | ZSCORE.studio',
  description: 'Founded by active composers who understand the intricacies of contemporary music notation. Learn about our philosophy, team, and expertise.',
  openGraph: {
    title: 'About | ZSCORE.studio',
    description: 'Founded by active composers who understand the intricacies of contemporary music notation.',
    type: 'website',
  },
};

/**
 * About Page Component
 */
export default async function AboutRoutePage() {
  let about = {};

  try {
    const allContent = await getAllContent();
    about = allContent.about || {};
  } catch (error) {
    console.error('Error loading about content:', error);
  }

  return <AboutPage initialAbout={about} />;
}
