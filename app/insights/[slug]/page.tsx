'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBlogPostBySlug, blogPosts, blogCategories } from '@/lib/blogData';
import { BlogPost } from '@/types/blog';

const BlogDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    checkTheme();
    const interval = setInterval(checkTheme, 100);
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (params.slug) {
      const blogPost = getBlogPostBySlug(params.slug as string);
      if (blogPost) {
        setPost(blogPost);
        // Find related posts (same category, excluding current post)
        const related = blogPosts
          .filter(p => p.category.id === blogPost.category.id && p.id !== blogPost.id)
          .slice(0, 3);
        setRelatedPosts(related);
      }
      setLoading(false);
    }
  }, [params.slug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatReadingTime = (minutes: number) => {
    return `${minutes} min${minutes > 1 ? 's' : ''} read`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-[#f9f9f7]'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0b5d68] mx-auto mb-4"></div>
          <p className={isDark ? 'text-gray-300' : 'text-[#666666]'}>Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-[#f9f9f7]'} flex items-center justify-center`}>
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl mb-4 block text-[#666666]">
            article_not_found
          </span>
          <h1 className={`font-headline text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>
            Article Not Found
          </h1>
          <p className={`text-lg mb-8 ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/insights">
            <button className={`px-6 py-3 rounded-xl font-headline font-semibold transition-all hover:scale-105 ${
              isDark ? 'bg-[#2eb5c2] text-white hover:bg-[#0b5d68]' : 'bg-[#0b5d68] text-white hover:bg-[#2eb5c2]'
            }`}>
              Back to Insights
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-[#f9f9f7]'}`}>
      {/* Back Navigation */}
      <section className={`py-6 px-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
              isDark ? 'text-[#2eb5c2] hover:text-white' : 'text-[#0b5d68] hover:text-[#2eb5c2]'
            }`}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Insights
          </button>
        </div>
      </section>

      {/* Article Header */}
      <section className={`py-12 px-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link href="/insights" className={isDark ? 'text-gray-400 hover:text-[#2eb5c2]' : 'text-[#666666] hover:text-[#0b5d68]'}>
              Insights
            </Link>
            <span className={isDark ? 'text-gray-400' : 'text-[#666666]'}>/</span>
            <Link 
              href={`/insights?category=${post.category.slug}`} 
              className={isDark ? 'text-gray-400 hover:text-[#2eb5c2]' : 'text-[#666666] hover:text-[#0b5d68]'}
            >
              {post.category.name}
            </Link>
          </nav>

          {/* Category Badge */}
          <div className="mb-6">
            <span className={`inline-block px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase ${
              isDark ? 'bg-[#2eb5c2]/20 text-[#2eb5c2]' : 'bg-[#0b5d68]/20 text-[#0b5d68]'
            }`}>
              {post.category.name}
            </span>
          </div>

          {/* Title */}
          <h1 className={`font-headline text-4xl md:text-5xl font-bold leading-tight mb-8 ${
            isDark ? 'text-white' : 'text-[#0b5d68]'
          }`}>
            {post.title}
          </h1>

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-gray-200">
            {/* Author */}
            <div className="flex items-center gap-3">
              <img 
                src={post.author.avatar} 
                alt={post.author.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className={`font-semibold ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>
                  {post.author.name}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-[#666666]'}`}>
                  {post.author.expertise?.[0]}
                </div>
              </div>
            </div>

            {/* Meta Info */}
            <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-[#666666]'}`}>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span>{formatReadingTime(post.readTime)}</span>
              </div>
              {post.viewCount && (
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  <span>{post.viewCount.toLocaleString()} views</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag, index) => (
                <span 
                  key={index}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-[#f9f9f7] text-[#666666]'
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cover Image */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        <img 
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </section>

      {/* Article Content */}
      <section className={`py-12 px-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto">
          <div 
            className={`prose prose-lg max-w-none ${
              isDark 
                ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-a:text-[#2eb5c2] prose-code:text-[#2eb5c2]' 
                : 'prose-headings:text-[#0b5d68] prose-p:text-[#1c1c19] prose-strong:text-[#0b5d68] prose-a:text-[#0b5d68] prose-code:text-[#0b5d68]'
            }`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </section>

      {/* Author Section */}
      <section className={`py-12 px-8 ${isDark ? 'bg-gray-900' : 'bg-[#f9f9f7]'}`}>
        <div className="max-w-4xl mx-auto">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8`}>
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <img 
                src={post.author.avatar} 
                alt={post.author.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className={`font-headline text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>
                  {post.author.name}
                </h3>
                <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>
                  {post.author.bio}
                </p>
                {post.author.expertise && (
                  <div className="flex flex-wrap gap-2">
                    {post.author.expertise.map((skill, index) => (
                      <span 
                        key={index}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isDark ? 'bg-[#2eb5c2]/20 text-[#2eb5c2]' : 'bg-[#0b5d68]/20 text-[#0b5d68]'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className={`py-12 px-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className={`font-headline text-3xl font-bold mb-2 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'}`}>
                Related Articles
              </h2>
              <p className={isDark ? 'text-gray-300' : 'text-[#666666]'}>
                Explore more insights on similar topics
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link href={`/insights/${relatedPost.slug}`} key={relatedPost.id}>
                  <div className={`${isDark ? 'bg-gray-700' : 'bg-[#f9f9f7]'} rounded-2xl overflow-hidden group transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer h-full flex flex-col`}>
                    <div className="h-48 relative overflow-hidden">
                      <img 
                        alt={relatedPost.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        src={relatedPost.coverImage}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {relatedPost.featured && (
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                            isDark ? 'bg-[#2eb5c2]/90 text-white' : 'bg-[#0b5d68]/90 text-white'
                          }`}>
                            Featured
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className={`font-headline text-lg font-bold mb-3 ${isDark ? 'text-white group-hover:text-[#2eb5c2]' : 'text-[#0b5d68] group-hover:text-[#2eb5c2]'} transition-colors duration-300`}>
                        {relatedPost.title}
                      </h3>
                      <p className={`text-sm leading-relaxed mb-4 flex-1 ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>
                        {relatedPost.excerpt}
                      </p>
                      <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-gray-600' : 'border-[#e0e0e0]'}`}>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-[#666666]'}`}>
                          {formatDate(relatedPost.publishedAt)}
                        </span>
                        <div className={`flex items-center gap-2 text-sm font-semibold ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'} group-hover:gap-3 transition-all duration-300`}>
                          <span>Read More</span>
                          <span className="material-symbols-outlined">arrow_forward</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to Top */}
      <div className="fixed bottom-8 right-8">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
            isDark 
              ? 'bg-[#2eb5c2] text-white hover:bg-[#0b5d68]' 
              : 'bg-[#0b5d68] text-white hover:bg-[#2eb5c2]'
          } shadow-lg`}
        >
          <span className="material-symbols-outlined">keyboard_arrow_up</span>
        </button>
      </div>
    </div>
  );
};

export default BlogDetailPage;
