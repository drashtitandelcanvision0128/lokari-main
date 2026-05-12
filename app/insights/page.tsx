'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { blogPosts, blogCategories, searchBlogPosts, getBlogPostsByCategory } from '@/lib/blogData';
import { BlogPost, BlogCategory } from '@/types/blog';

const InsightsPage = () => {
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(blogPosts);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);

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
    let filtered = blogPosts;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = getBlogPostsByCategory(selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const searchResults = searchBlogPosts(searchQuery);
      filtered = filtered.filter(post => searchResults.includes(post));
    }

    setFilteredPosts(filtered);
    setFeaturedPosts(filtered.filter(post => post.featured));
  }, [searchQuery, selectedCategory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-[#f9f9f7]'}`}>
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Agricultural Insights" 
            className="w-full h-full object-cover" 
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&h=400&fit=crop"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${
            isDark ? 'from-[#0b5d68]/90 to-black/70' : 'from-[#0b5d68]/80 to-black/60'
          }`}></div>
        </div>
        <div className="container mx-auto px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="font-headline text-5xl font-bold text-white leading-tight mb-6 tracking-tighter">
              Agricultural <span className="text-[#2eb5c2]">Insights</span>
            </h1>
            <p className="text-white/90 text-lg mb-8 font-body leading-relaxed">
              Stay informed with the latest trends, research, and innovations in agricultural technology, 
              sustainable farming, and market analysis from industry experts.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className={`py-8 px-8 ${isDark ? 'bg-gray-800' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-10 py-3 rounded-xl font-body text-sm transition-all duration-300 ${
                  isDark 
                    ? 'bg-gray-700/50 text-white placeholder-gray-400 focus:bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 text-[#0b5d68] placeholder-[#666666] focus:bg-white border-gray-200'
                } border focus:outline-none focus:border-[#2eb5c2] focus:ring-1 focus:ring-[#2eb5c2]/20`}
              />
              <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 material-symbols-outlined text-lg ${
                isDark ? 'text-gray-400' : 'text-[#666666]'
              }`}>
                search
              </span>
            </div>

            {/* Premium Category Filter */}
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#f9f9f7] to-[#f0f0f0] border border-gray-200">
                <span className="material-symbols-outlined text-sm text-[#666666]">filter_list</span>
                <span className="text-xs font-medium text-[#666666] uppercase tracking-wider">Filter</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] text-white border-transparent shadow-md'
                      : isDark 
                        ? 'bg-transparent text-gray-300 border-gray-600 hover:bg-gray-700' 
                        : 'bg-white text-[#666666] border-gray-200 hover:border-[#0b5d68] hover:text-[#0b5d68]'
                  }`}
                >
                  All
                </button>
                {blogCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                      selectedCategory === category.slug
                        ? 'bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] text-white border-transparent shadow-md'
                        : isDark 
                          ? 'bg-transparent text-gray-300 border-gray-600 hover:bg-gray-700' 
                          : 'bg-white text-[#666666] border-gray-200 hover:border-[#0b5d68] hover:text-[#0b5d68]'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className={`mb-8 text-lg ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>
            {searchQuery && (
              <span>Showing {filteredPosts.length} results for "{searchQuery}"</span>
            )}
            {!searchQuery && selectedCategory !== 'all' && (
              <span>Showing {filteredPosts.length} articles in "{blogCategories.find(c => c.slug === selectedCategory)?.name}"</span>
            )}
            {!searchQuery && selectedCategory === 'all' && (
              <span>Showing all {filteredPosts.length} articles</span>
            )}
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && !searchQuery && selectedCategory === 'all' && (
        <section className={`py-12 px-8 ${isDark ? 'bg-gray-900' : 'bg-[#f9f9f7]'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className={`font-headline text-3xl font-bold mb-2 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'}`}>
                Featured Articles
              </h2>
              <p className={isDark ? 'text-gray-300' : 'text-[#666666]'}>
                Hand-picked insights from our expert contributors
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Link href={`/insights/${post.slug}`} key={post.id}>
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl overflow-hidden group transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer`}>
                    <div className="h-64 relative overflow-hidden">
                      <img 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        src={post.coverImage}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <span className={`px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase ${
                          isDark ? 'bg-[#2eb5c2]/90 text-white' : 'bg-[#0b5d68]/90 text-white'
                        }`}>
                          Featured
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="font-headline text-2xl font-bold text-white mb-2 group-hover:text-[#2eb5c2] transition-colors duration-300">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-4 text-white/90 text-sm">
                          <span>{post.author.name}</span>
                          <span>•</span>
                          <span>{formatDate(post.publishedAt)}</span>
                          <span>•</span>
                          <span>{post.readTime} min read</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'}`}>
                          Read More
                        </span>
                        <span className={`material-symbols-outlined ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'} group-hover:translate-x-1 transition-transform duration-300`}>
                          arrow_forward
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts Grid */}
      <section className={`py-12 px-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Link href={`/insights/${post.slug}`} key={post.id}>
                  <div className={`${isDark ? 'bg-gray-700' : 'bg-[#f9f9f7]'} rounded-2xl overflow-hidden group transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer h-full flex flex-col`}>
                    <div className="h-48 relative overflow-hidden">
                      <img 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        src={post.coverImage}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {post.featured && (
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                            isDark ? 'bg-[#2eb5c2]/90 text-white' : 'bg-[#0b5d68]/90 text-white'
                          }`}>
                            Featured
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                          isDark ? 'bg-gray-600/90 text-white' : 'bg-white/90 text-[#0b5d68]'
                        }`}>
                          {post.category.name}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className={`font-headline text-xl font-bold mb-3 ${isDark ? 'text-white group-hover:text-[#2eb5c2]' : 'text-[#0b5d68] group-hover:text-[#2eb5c2]'} transition-colors duration-300`}>
                        {post.title}
                      </h3>
                      <p className={`text-sm leading-relaxed mb-4 flex-1 ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs mb-4">
                        <div className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-[#666666]'}`}>
                          <span className="material-symbols-outlined text-sm">person</span>
                          <span>{post.author.name}</span>
                        </div>
                        <div className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-[#666666]'}`}>
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          <span>{post.readTime} min</span>
                        </div>
                      </div>
                      <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-gray-600' : 'border-[#e0e0e0]'}`}>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-[#666666]'}`}>
                          {formatDate(post.publishedAt)}
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
          ) : (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl mb-4 block text-[#666666]">
                search_off
              </span>
              <h3 className={`font-headline text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>
                No articles found
              </h3>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>
                Try adjusting your search terms or browse all categories
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default InsightsPage;
