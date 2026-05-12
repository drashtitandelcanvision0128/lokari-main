import { BlogPost, BlogAuthor, BlogCategory } from '@/types/blog';

export const blogAuthors: BlogAuthor[] = [
  {
    id: '1',
    name: 'Dr. Rajesh Kumar',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Agricultural economist with 15+ years of experience in sustainable farming practices and market analysis.',
    expertise: ['Sustainable Agriculture', 'Market Analysis', 'Policy Research']
  },
  {
    id: '2',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    bio: 'Supply chain optimization expert specializing in agricultural logistics and cold storage solutions.',
    expertise: ['Supply Chain', 'Logistics', 'Cold Storage']
  },
  {
    id: '3',
    name: 'Amit Patel',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Technology consultant focused on digital transformation in agriculture and farming automation.',
    expertise: ['AgriTech', 'Digital Transformation', 'Automation']
  },
  {
    id: '4',
    name: 'Sneha Reddy',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    bio: 'Environmental scientist and advocate for climate-smart agriculture practices.',
    expertise: ['Climate Smart Agriculture', 'Environmental Science', 'Sustainability']
  }
];

export const blogCategories: BlogCategory[] = [
  {
    id: '1',
    name: 'Sustainable Farming',
    slug: 'sustainable-farming',
    description: 'Best practices for sustainable and organic farming methods',
    color: '#0b5d68'
  },
  {
    id: '2',
    name: 'Market Insights',
    slug: 'market-insights',
    description: 'Analysis of agricultural market trends and price movements',
    color: '#e89151'
  },
  {
    id: '3',
    name: 'Technology & Innovation',
    slug: 'technology-innovation',
    description: 'Latest technological advancements in agriculture',
    color: '#2eb5c2'
  },
  {
    id: '4',
    name: 'Supply Chain',
    slug: 'supply-chain',
    description: 'Logistics and supply chain optimization strategies',
    color: '#d55b39'
  },
  {
    id: '5',
    name: 'Policy & Regulation',
    slug: 'policy-regulation',
    description: 'Government policies affecting agricultural trade',
    color: '#0b5d68'
  }
];

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of Sustainable Agriculture: Trends to Watch in 2024',
    slug: 'future-sustainable-agriculture-2024',
    excerpt: 'Explore the cutting-edge trends shaping sustainable agriculture in 2024, from precision farming to AI-driven crop management.',
    content: `
      <h2>Introduction</h2>
      <p>Sustainable agriculture is rapidly evolving, driven by technological advancements and growing environmental concerns. As we move through 2024, several key trends are emerging that will shape the future of farming.</p>
      
      <h2>Precision Agriculture</h2>
      <p>Precision agriculture continues to revolutionize farming practices. GPS-guided equipment, drones, and IoT sensors are enabling farmers to optimize resource use and maximize yields while minimizing environmental impact.</p>
      
      <h2>AI and Machine Learning</h2>
      <p>Artificial intelligence is transforming how we approach crop management. Machine learning algorithms can now predict crop diseases, optimize irrigation schedules, and provide real-time insights to farmers.</p>
      
      <h2>Regenerative Agriculture</h2>
      <p>Regenerative farming practices are gaining momentum as farmers recognize the long-term benefits of soil health and biodiversity. These practices not only improve yields but also help combat climate change.</p>
      
      <h2>Conclusion</h2>
      <p>The future of agriculture lies in the integration of technology and sustainable practices. Farmers who embrace these trends will be better positioned to meet the growing global food demand while protecting our planet.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=400&fit=crop',
    publishedAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    readTime: 8,
    author: blogAuthors[0],
    category: blogCategories[0],
    tags: ['sustainable farming', 'precision agriculture', 'AI', 'regenerative agriculture'],
    featured: true,
    status: 'published',
    seoTitle: 'Future of Sustainable Agriculture 2024 | Trends and Innovations',
    seoDescription: 'Discover the top sustainable agriculture trends for 2024, including precision farming, AI, and regenerative practices.',
    viewCount: 1250,
    likeCount: 89
  },
  {
    id: '2',
    title: 'Optimizing Cold Storage Solutions for Agricultural Produce',
    slug: 'optimizing-cold-storage-solutions',
    excerpt: 'Learn how modern cold storage technologies are reducing post-harvest losses and improving the quality of agricultural produce.',
    content: `
      <h2>The Challenge of Post-Harvest Losses</h2>
      <p>Post-harvest losses remain a significant challenge in the agricultural sector, with up to 40% of produce lost before reaching consumers. Cold storage solutions play a crucial role in addressing this issue.</p>
      
      <h2>Modern Cold Storage Technologies</h2>
      <p>Today's cold storage facilities are far more advanced than traditional warehouses. Smart temperature monitoring, humidity control systems, and automated inventory management are revolutionizing how we preserve agricultural products.</p>
      
      <h2>Energy Efficiency Considerations</h2>
      <p>Modern cold storage facilities are increasingly focusing on energy efficiency. Solar panels, advanced insulation materials, and smart energy management systems are helping reduce operational costs while maintaining optimal storage conditions.</p>
      
      <h2>Best Practices for Implementation</h2>
      <p>When implementing cold storage solutions, it's essential to consider factors such as location, energy availability, and the specific requirements of different agricultural products. A well-designed system can significantly extend shelf life and reduce waste.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=400&fit=crop',
    publishedAt: '2024-01-10T14:30:00Z',
    readTime: 6,
    author: blogAuthors[1],
    category: blogCategories[3],
    tags: ['cold storage', 'supply chain', 'post-harvest', 'logistics'],
    featured: false,
    status: 'published',
    seoTitle: 'Cold Storage Solutions for Agricultural Produce | Supply Chain Optimization',
    seoDescription: 'Learn how modern cold storage technologies reduce post-harvest losses and improve agricultural supply chains.',
    viewCount: 890,
    likeCount: 67
  },
  {
    id: '3',
    title: 'Digital Transformation in Agriculture: The Role of IoT',
    slug: 'digital-transformation-agriculture-iot',
    excerpt: 'Discover how Internet of Things (IoT) devices are revolutionizing farming operations and enabling data-driven decision making.',
    content: `
      <h2>The IoT Revolution in Agriculture</h2>
      <p>The Internet of Things is transforming agriculture from a traditional practice into a data-driven industry. Smart sensors, connected devices, and real-time monitoring are enabling farmers to make informed decisions like never before.</p>
      
      <h2>Smart Farming Applications</h2>
      <p>IoT devices are being used across various farming operations. Soil moisture sensors help optimize irrigation, weather stations provide real-time climate data, and automated systems can adjust growing conditions automatically.</p>
      
      <h2>Data Analytics and Insights</h2>
      <p>The true power of IoT in agriculture lies in data analytics. By collecting and analyzing data from multiple sources, farmers can identify patterns, predict outcomes, and optimize their operations for maximum efficiency.</p>
      
      <h2>Challenges and Solutions</h2>
      <p>While IoT offers tremendous potential, challenges remain. Connectivity issues in rural areas, data security concerns, and the need for technical skills are common hurdles. However, solutions are emerging to address these challenges.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop',
    publishedAt: '2024-01-08T09:15:00Z',
    readTime: 7,
    author: blogAuthors[2],
    category: blogCategories[2],
    tags: ['IoT', 'digital transformation', 'smart farming', 'data analytics'],
    featured: true,
    status: 'published',
    seoTitle: 'Digital Transformation in Agriculture | IoT and Smart Farming',
    seoDescription: 'Explore how IoT devices are revolutionizing agriculture through smart farming and data-driven decision making.',
    viewCount: 1567,
    likeCount: 112
  },
  {
    id: '4',
    title: 'Climate-Smart Agriculture: Adapting to Environmental Changes',
    slug: 'climate-smart-agriculture-adaptation',
    excerpt: 'Understanding climate-smart agriculture practices that help farmers adapt to changing environmental conditions while increasing productivity.',
    content: `
      <h2>The Climate Challenge</h2>
      <p>Climate change presents significant challenges to agriculture worldwide. Changing weather patterns, increased frequency of extreme events, and shifting growing seasons require farmers to adapt their practices.</p>
      
      <h2>Climate-Smart Agriculture Principles</h2>
      <p>Climate-smart agriculture focuses on three main objectives: sustainably increasing productivity, enhancing resilience to climate shocks, and reducing greenhouse gas emissions where possible.</p>
      
      <h2>Practical Implementation</h2>
      <p>Implementing climate-smart practices includes drought-resistant crop varieties, conservation agriculture techniques, improved water management, and agroforestry systems. These practices help farmers adapt while maintaining productivity.</p>
      
      <h2>Economic Benefits</h2>
      <p>Beyond environmental benefits, climate-smart agriculture often leads to economic advantages. Reduced input costs, improved yields, and access to premium markets for sustainably grown products make these practices financially viable.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=400&fit=crop',
    publishedAt: '2024-01-05T16:45:00Z',
    readTime: 9,
    author: blogAuthors[3],
    category: blogCategories[0],
    tags: ['climate change', 'sustainability', 'adaptation', 'resilience'],
    featured: false,
    status: 'published',
    seoTitle: 'Climate-Smart Agriculture | Adapting to Environmental Changes',
    seoDescription: 'Learn about climate-smart agriculture practices that help farmers adapt to climate change while increasing productivity.',
    viewCount: 1102,
    likeCount: 78
  },
  {
    id: '5',
    title: 'Agricultural Market Trends: What Farmers Need to Know in 2024',
    slug: 'agricultural-market-trends-2024',
    excerpt: 'Key market trends and price movements that every farmer should monitor to make informed decisions about their crops and livestock.',
    content: `
      <h2>Current Market Landscape</h2>
      <p>The agricultural market is experiencing significant shifts driven by global events, changing consumer preferences, and technological advancements. Understanding these trends is crucial for farmers to make informed decisions.</p>
      
      <h2>Price Volatility Factors</h2>
      <p>Several factors are contributing to price volatility in agricultural markets. Supply chain disruptions, weather events, and changing trade policies all play a role in determining market prices.</p>
      
      <h2>Emerging Opportunities</h2>
      <p>Despite challenges, new opportunities are emerging. Organic products, specialty crops, and direct-to-consumer sales channels are providing farmers with alternative revenue streams.</p>
      
      <h2>Risk Management Strategies</h2>
      <p>Effective risk management is essential in today's volatile markets. Diversification, forward contracts, and insurance products can help farmers protect their income against price fluctuations.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&h=400&fit=crop',
    publishedAt: '2024-01-03T11:20:00Z',
    readTime: 6,
    author: blogAuthors[0],
    category: blogCategories[1],
    tags: ['market trends', 'price analysis', 'risk management', 'commodities'],
    featured: false,
    status: 'published',
    seoTitle: 'Agricultural Market Trends 2024 | Price Analysis and Insights',
    seoDescription: 'Key agricultural market trends and price movements that farmers need to know for informed decision making.',
    viewCount: 945,
    likeCount: 71
  },
  {
    id: '6',
    title: 'Blockchain Technology in Agricultural Supply Chains',
    slug: 'blockchain-agricultural-supply-chains',
    excerpt: 'How blockchain technology is bringing transparency and traceability to agricultural supply chains, benefiting both farmers and consumers.',
    content: `
      <h2>The Need for Transparency</h2>
      <p>Modern consumers increasingly demand transparency about where their food comes from and how it's produced. Blockchain technology offers a solution to provide this transparency while improving supply chain efficiency.</p>
      
      <h2>How Blockchain Works in Agriculture</h2>
      <p>Blockchain creates an immutable record of transactions as products move through the supply chain. From farm to table, each step is recorded, creating a transparent and traceable history.</p>
      
      <h2>Benefits for Farmers</h2>
      <p>For farmers, blockchain technology offers several benefits. It can help prove the authenticity of organic or specialty products, enable faster payments, and provide better access to premium markets.</p>
      
      <h2>Implementation Challenges</h2>
      <p>While promising, blockchain implementation faces challenges including technical complexity, cost considerations, and the need for industry-wide adoption standards.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop',
    publishedAt: '2023-12-28T13:00:00Z',
    readTime: 8,
    author: blogAuthors[2],
    category: blogCategories[3],
    tags: ['blockchain', 'supply chain', 'transparency', 'traceability'],
    featured: true,
    status: 'published',
    seoTitle: 'Blockchain in Agricultural Supply Chains | Transparency and Traceability',
    seoDescription: 'Discover how blockchain technology is transforming agricultural supply chains with transparency and traceability.',
    viewCount: 1324,
    likeCount: 94
  }
];

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};

export const getBlogPostsByCategory = (categorySlug: string): BlogPost[] => {
  return blogPosts.filter(post => post.category.slug === categorySlug);
};

export const getBlogPostsByAuthor = (authorId: string): BlogPost[] => {
  return blogPosts.filter(post => post.author.id === authorId);
};

export const getFeaturedBlogPosts = (): BlogPost[] => {
  return blogPosts.filter(post => post.featured);
};

export const searchBlogPosts = (query: string): BlogPost[] => {
  const lowercaseQuery = query.toLowerCase();
  return blogPosts.filter(post => 
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.excerpt.toLowerCase().includes(lowercaseQuery) ||
    post.content.toLowerCase().includes(lowercaseQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};
