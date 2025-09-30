import HomePage from '../components/HomePage';
import * as ContentManager from '@/lib/content-manager-clean';
import { loadHTMLContent } from '@/lib/html-content-manager';
import { preloadCategories } from '@/utils/categoryColors';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

export default async function Page() {
  // Load all content server-side for SEO
  let initialContent = null;
  let initialCategories = null;
  
  try {
    const allContent = await ContentManager.getAllContent();
    
    // Load HTML content for services and portfolio items during SSR
    const servicesWithHTML = await Promise.all(
      (allContent.services || []).map(async (service) => {
        if (service.content_file) {
          try {
            const htmlContent = await loadHTMLContent(service.content_file);
            return { ...service, content: htmlContent };
          } catch (error) {
            console.error(`Failed to load HTML for service ${service.id}:`, error);
            return service;
          }
        }
        return service;
      })
    );
    
    const portfolioWithHTML = await Promise.all(
      (allContent.portfolio || []).map(async (item) => {
        if (item.content_file) {
          try {
            const htmlContent = await loadHTMLContent(item.content_file);
            return { ...item, content: htmlContent };
          } catch (error) {
            console.error(`Failed to load HTML for portfolio ${item.id}:`, error);
            return item;
          }
        }
        return item;
      })
    );
    
    // Sort news by publication_date descending (newest first)
    const sortedNews = (allContent.news || []).sort((a, b) => {
      const dateA = new Date(a.publication_date || a.created_at || 0);
      const dateB = new Date(b.publication_date || b.created_at || 0);
      return dateB - dateA; // Newest first
    });

    initialContent = {
      services: servicesWithHTML,
      portfolio: portfolioWithHTML, 
      news: sortedNews,
      about: allContent.about || {},
      settings: allContent.settings || {}
    };
    
    // Pre-load categories for consistent server/client rendering
    initialCategories = allContent.categories || {};
  } catch (error) {
    console.error('Failed to load content for SSR:', error);
    // Fallback to empty content
    initialContent = {
      services: [],
      portfolio: [],
      news: [],
      about: {},
      settings: {}
    };
    initialCategories = {};
  }
  
  return <HomePage initialContent={initialContent} initialCategories={initialCategories} />;
}