/**
 * Individual Project Page
 * Loads and displays full HTML content for SEO
 */

import { getAllContent } from '@/lib/content-manager-clean';
import ProjectDetail from '../../../components/projects/ProjectDetail';

export async function generateStaticParams() {
  try {
    const allContent = await getAllContent();
    const news = allContent.projects || [];
    return news.map((item) => ({
      slug: item.slug || item.id,
    }));
  } catch (error) {
    console.error('Error generating static params for projects:', error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const allContent = await getAllContent();
    const news = allContent.projects || [];
    const project = news.find(item => (item.slug || item.id) === slug);

    if (!project) {
      return { title: 'Project Not Found' };
    }

    return {
      title: `${project.title} | ZSCORE.studio`,
      description: project.excerpt,
      openGraph: {
        title: project.title,
        description: project.excerpt,
        type: 'website',
        images: project.image_urls || [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return { title: 'Project' };
  }
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;

  try {
    const allContent = await getAllContent();
    const allNews = allContent.projects || [];

    let newsItem = allNews.find(item => item.slug === slug);
    if (!newsItem) {
      newsItem = allNews.find(item => item.id === slug);
    }

    if (!newsItem) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center p-6">
          <div>
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <p className="text-gray-600 mb-6">The requested project could not be found.</p>
            <a
              href="/projects"
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
            >
              Back to Projects
            </a>
          </div>
        </div>
      );
    }

    const { getContentWithHTML } = await import('@/lib/content-manager-clean');
    const newsItemWithHTML = await getContentWithHTML('projects', newsItem.id);

    const relatedPosts = allNews
      .filter(item => {
        const isCurrentItem = item.slug === slug || item.id === slug;
        return !isCurrentItem && item.category === newsItem.category;
      })
      .slice(0, 3);

    return (
      <ProjectDetail
        newsItem={newsItemWithHTML}
        allNews={allNews}
        relatedPosts={relatedPosts}
      />
    );
  } catch (error) {
    console.error('Error loading project:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center p-6">
        <div>
          <h1 className="text-2xl font-bold mb-4">Error Loading Project</h1>
          <p className="text-gray-600 mb-6">There was an error loading the project. Please try again.</p>
          <a
            href="/projects"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Back to Projects
          </a>
        </div>
      </div>
    );
  }
}
