/**
 * Individual News Article Page
 * Loads and displays full HTML content for SEO
 */

import { getAllContent } from '@/lib/content-manager-clean';
import { loadHTMLContent } from '@/lib/html-content-manager';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
    const allContent = await getAllContent();
    const news = allContent.news || [];
    const article = news.find(item => (item.slug || item.id) === params.slug);
    
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
  try {
    // Load news content
    const allContent = await getAllContent();
    const news = allContent.news || [];
    
    // Find the specific article
    const article = news.find(item => (item.slug || item.id) === params.slug);
    
    if (!article) {
      notFound();
    }
    
    // Load HTML content if available
    let htmlContent = '';
    if (article.content_file) {
      try {
        htmlContent = await loadHTMLContent(article.content_file);
      } catch (error) {
        console.error('Error loading HTML content:', error);
        htmlContent = article.content || article.excerpt || '';
      }
    } else {
      htmlContent = article.content || article.excerpt || '';
    }
    
    return (
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <Link 
              href="/#news" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6"
            >
              <ArrowLeft size={16} />
              Back to Feed
            </Link>
            
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 text-xs tracking-wider uppercase rounded-full bg-blue-100 text-blue-700">
                {article.category?.replace('_', ' ') || 'News'}
              </span>
              {article.publication_date && (
                <time className="text-sm text-gray-500" dateTime={article.publication_date}>
                  {format(new Date(article.publication_date), 'MMMM d, yyyy')}
                </time>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {article.title}
            </h1>
            
            {article.excerpt && (
              <p className="text-xl text-gray-600 mt-4 leading-relaxed">
                {article.excerpt}
              </p>
            )}
          </div>
        </header>
        
        {/* Featured Image */}
        {article.image_urls && article.image_urls.length > 0 && (
          <div className="w-full h-64 md:h-96 relative overflow-hidden">
            <img
              src={article.image_urls[0]}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Content */}
        <article className="max-w-4xl mx-auto px-6 py-12">
          <div 
            className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
          
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
    );
  } catch (error) {
    console.error('Error rendering news article:', error);
    notFound();
  }
}