export interface BlogAuthor {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  expertise?: string[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  publishedAt: string;
  updatedAt?: string;
  readTime: number; // in minutes
  author: BlogAuthor;
  category: BlogCategory;
  tags: string[];
  featured?: boolean;
  status: 'draft' | 'published' | 'archived';
  seoTitle?: string;
  seoDescription?: string;
  viewCount?: number;
  likeCount?: number;
}

export interface BlogListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface BlogFilters {
  category?: string;
  tags?: string[];
  author?: string;
  featured?: boolean;
  search?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface BlogSidebarProps {
  categories: BlogCategory[];
  popularPosts: BlogPost[];
  authors: BlogAuthor[];
}
