import Link from 'next/link';
import { format } from "date-fns";
import { getCategoryColorSSR } from '@/utils/categoryColorsSSR';
import Footer from '@/components/shared/Footer';
import {
  BackToFeedButton,
  BackToBreadcrumb,
  ImageGallery,
  ClickableImage,
  TitleUpdater
} from './ProjectDetailClient';

/**
 * Server-side News Detail Component
 * Renders news article content with SSR for optimal SEO and performance
 */
export default function NewsDetail({ newsItem, allNews = [], relatedPosts = [] }) {
  if (!newsItem) {
    return null; // This should be handled by the server component
  }

  const getCategoryColor = (category) => {
    return getCategoryColorSSR(category, 'projects', null);
  };

  return (
    <ImageGallery newsItem={newsItem}>
      <div className="min-h-screen bg-white">
        {/* Title updater for client-side */}
        <TitleUpdater title={newsItem.title} />

        {/* Skip Links */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-black text-white px-4 py-2 z-50">
          Skip to content
        </a>

        {/* Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="w-[85%] mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              {/* Left: Back Button */}
              <BackToFeedButton />

              {/* Center: Logo */}
              <Link 
                href="/" 
                className="absolute left-1/2 transform -translate-x-1/2 font-black text-lg hover:text-gray-600 transition-colors"
              >
                ZSCORE<span className="font-extralight">.studio</span>
              </Link>

              {/* Right: Menu placeholder */}
              <div className="w-16"></div>
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="w-[85%] mx-auto px-6 py-3 text-sm text-gray-500">
          <nav className="flex items-center space-x-2">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span>›</span>
            <BackToBreadcrumb />
            <span>›</span>
            <span className="text-gray-900 font-medium">{newsItem.title}</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="relative">
          <div className="grid lg:grid-cols-12 gap-0">
            {/* Image Column */}
            {newsItem.image_urls && newsItem.image_urls.length > 0 && (
              <div className="lg:col-span-7 relative">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <ClickableImage
                    src={newsItem.image_urls[0]}
                    alt={newsItem.title}
                    className="w-full h-full object-cover transition-transform duration-700"
                    index={0}
                  />
                </div>
              </div>
            )}

            {/* Content Column */}
            <div className={`${newsItem.image_urls && newsItem.image_urls.length > 0 ? 'lg:col-span-5' : 'lg:col-span-12'} flex items-center py-8`}>
              <div className="w-full px-6 lg:px-12 py-8 md:py-12 lg:py-16 xl:py-20 2xl:py-24">
                {/* Category & Meta */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className={`px-3 py-1 text-xs font-medium tracking-wider uppercase ${getCategoryColor(newsItem.category)}`}>
                    {newsItem.category.replace('_', ' ')}
                  </span>
                </div>

                {/* Publication Date */}
                {newsItem.publication_date && (
                  <p className="text-sm text-gray-600 mb-4 font-medium">
                    {format(new Date(newsItem.publication_date), 'yyyy')}
                  </p>
                )}

                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black mb-6 leading-tight tracking-tight">
                  {newsItem.title}
                </h1>

                {/* Subtitle/Excerpt */}
                {newsItem.excerpt && (
                  <p className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed font-light max-w-prose">
                    {newsItem.excerpt}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main id="main-content" className="w-[85%] mx-auto px-6 py-16 lg:py-0 xl:py-0 mt-8 lg:mt-0">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Article Content */}
            <div className="lg:col-span-8">
              <div className="prose prose-lg max-w-none">
                {/* Content Blocks */}
                {newsItem.content_blocks && newsItem.content_blocks.length > 0 ? (
                  newsItem.content_blocks.map((block, index) => {
                    if (block.type === 'heading') {
                      return <h2 key={index} className="text-2xl font-bold mt-12 mb-6 tracking-tight">{block.content}</h2>;
                    } else if (block.type === 'paragraph') {
                      return <p key={index} className="text-lg leading-relaxed mb-6 text-gray-800">{block.content}</p>;
                    } else if (block.type === 'markdown' && block.content) {
                      return (
                        <div 
                          key={index} 
                          dangerouslySetInnerHTML={{ __html: block.content }} 
                          className="prose-content text-lg leading-relaxed mb-6 text-gray-800"
                        />
                      );
                    } else if (block.type === 'image') {
                      return (
                        <figure key={index} className="my-12">
                          <ClickableImage
                            src={block.src}
                            alt={block.caption || `Content image ${index}`}
                            className="w-full h-auto"
                            index={0}
                          />
                          {block.caption && (
                            <figcaption className="text-center text-sm text-gray-600 mt-4 font-medium">
                              {block.caption}
                            </figcaption>
                          )}
                        </figure>
                      );
                    }
                    return null;
                  })
                ) : newsItem.content ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: newsItem.content }} 
                    className="prose-content text-lg leading-relaxed text-gray-800"
                  />
                ) : null}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                {/* Article Meta */}
                <div className="bg-gray-50 p-6 mb-8">
                  <h3 className="font-bold text-sm tracking-wider uppercase text-gray-900 mb-4">
                    Project Information
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Published</dt>
                      <dd className="text-sm text-gray-900 font-medium">
                        {newsItem.publication_date && format(new Date(newsItem.publication_date), 'yyyy')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</dt>
                      <dd className="text-sm text-gray-900 font-medium">
                        {newsItem.category?.replace('_', ' ')}
                      </dd>
                    </div>
                    {newsItem.tags && newsItem.tags.length > 0 && (
                      <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</dt>
                        <dd className="flex flex-wrap gap-1 mt-2">
                          {newsItem.tags.slice(0, 5).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 text-xs bg-white text-gray-700 border border-gray-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}
                    {newsItem.field_visibility?.composer && newsItem.composer && (
                      <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Composer</dt>
                        <dd className="text-sm text-gray-900 font-medium">{newsItem.composer}</dd>
                      </div>
                    )}
                    {newsItem.field_visibility?.client && newsItem.client && (
                      <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Client</dt>
                        <dd className="text-sm text-gray-900 font-medium">{newsItem.client}</dd>
                      </div>
                    )}
                    {newsItem.field_visibility?.instrumentation && newsItem.instrumentation && (
                      <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Instrumentation</dt>
                        <dd className="text-sm text-gray-900 font-medium">{newsItem.instrumentation}</dd>
                      </div>
                    )}
                    {newsItem.field_visibility?.publisher && newsItem.publisher && (
                      <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Publisher</dt>
                        <dd className="text-sm text-gray-900 font-medium">{newsItem.publisher}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Additional Images */}
                {newsItem.image_urls && newsItem.image_urls.length > 1 && (
                  <div className="mb-8">
                    <h3 className="font-bold text-sm tracking-wider uppercase text-gray-900 mb-4">
                      Additional Images
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {newsItem.image_urls.slice(1, 5).map((imageUrl, index) => (
                        <ClickableImage
                          key={index}
                          src={imageUrl}
                          alt={`Additional image ${index + 1}`}
                          className="w-full h-20 object-cover"
                          index={index + 1}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Articles */}
                {relatedPosts.length > 0 && (
                  <div>
                    <h3 className="font-bold text-sm tracking-wider uppercase text-gray-900 mb-4">
                      Related Projects
                    </h3>
                    <div className="space-y-4">
                      {relatedPosts.map((post, index) => (
                        <Link 
                          key={index}
                          href={`/projects/${post.slug || post.id}`}
                          className="block group"
                        >
                          <div className="flex gap-3">
                            {post.image_urls && post.image_urls[0] && (
                              <img 
                                src={post.image_urls[0]} 
                                alt={post.title}
                                className="w-16 h-16 object-cover flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-black transition-colors">
                                {post.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {post.publication_date && format(new Date(post.publication_date), 'yyyy')}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ImageGallery>
  );
}