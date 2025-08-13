'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ViewToggle, type ViewMode } from '@/components/content/posts/ViewToggle';
import { PostCard } from '@/components/content/posts/PostCard';
import { PostTable } from '@/components/content/posts/PostTable';
import { PostGrid } from '@/components/content/posts/PostGrid';
import { PostList } from '@/components/content/posts/PostList';
import { postsApi } from '@/lib/api/posts';


// Adapter interface untuk komponen
interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  categories: Array<{ id: string; name: string; color: string }>;
  tags: Array<{ id: string; name: string }>;
  featuredImage?: {
    id: string;
    url: string;
    alt: string;
    caption?: string;
  };
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  commentCount: number;
  readingTime: number;
}

// Adapter function untuk mengkonversi API Post ke Post yang diharapkan komponen
const adaptApiPostToComponentPost = (apiPost: any): Post => {
  return {
    id: apiPost.id,
    title: apiPost.title,
    slug: apiPost.slug,
    content: apiPost.content,
    excerpt: apiPost.excerpt || '',
    status: apiPost.status.toLowerCase() as 'draft' | 'published' | 'scheduled' | 'archived',
    author: {
      id: apiPost.author?.id || 'unknown',
      name: apiPost.author ? `${apiPost.author.firstName || ''} ${apiPost.author.lastName || ''}`.trim() || 'Unknown Author' : 'Unknown Author',
      email: apiPost.author?.email || 'unknown@example.com',
      avatar: undefined
    },
    categories: apiPost.category ? [{
      id: apiPost.category.id,
      name: apiPost.category.name,
      color: 'blue'
    }] : [],
    tags: apiPost.tags || [],
    featuredImage: apiPost.featuredImage ? {
      id: '1',
      url: apiPost.featuredImage,
      alt: apiPost.title,
      caption: apiPost.title
    } : undefined,
    publishedAt: apiPost.publishedAt,
    createdAt: apiPost.createdAt,
    updatedAt: apiPost.updatedAt,
    viewCount: apiPost._count?.views || 0,
    commentCount: apiPost._count?.comments || 0,
    readingTime: Math.ceil((apiPost.content || '').split(' ').length / 200) // Estimate reading time
  };
};

export default function PostsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load view mode preference from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('posts-view-mode') as ViewMode;
    if (savedViewMode && ['card', 'table', 'grid', 'list'].includes(savedViewMode)) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if token exists
        const token = localStorage.getItem('ja-cms-token');
        if (!token) {
          throw new Error('No authentication token found. Please login first.');
        }
        
        const response = await postsApi.getPosts();
        if (response.success && response.data) {
          // API returns data directly as array, not wrapped in posts property
          const postsArray = Array.isArray(response.data) ? response.data : response.data.posts || [];
          const adaptedPosts = postsArray.map(adaptApiPostToComponentPost);
          setPosts(adaptedPosts);
          setFilteredPosts(adaptedPosts);
        } else {
          throw new Error(response.error?.message || 'Failed to fetch posts');
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
        setPosts([]);
        setFilteredPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter posts based on search term
  useEffect(() => {
    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.categories.some(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      post.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPosts(filtered);
  }, [searchTerm, posts]);
  
  // Save view mode preference to localStorage
  const handleViewModeChange = (newViewMode: ViewMode) => {
    setViewMode(newViewMode);
    localStorage.setItem('posts-view-mode', newViewMode);
  };

  // Handle post actions
  const handleEdit = (postId: string) => {
    console.log('Edit post:', postId);
    // Navigate to edit page
  };

  const handleDelete = (postId: string) => {
    console.log('Delete post:', postId);
    // Show confirmation dialog and delete
  };

  const handleView = (postId: string) => {
    console.log('View post:', postId);
    // Navigate to view page
  };

  const handlePostAction = (postId: string, action: string) => {
    console.log('Post action:', postId, action);
    // Handle publish/unpublish
  };

  const handleQuickEdit = (postId: string, data: any) => {
    console.log('Quick edit:', postId, data);
    // Handle quick edit
  };

  const handleSaveQuickEdit = (postId: string) => {
    console.log('Save quick edit:', postId);
    // Save quick edit
  };

  const handleCancelQuickEdit = () => {
    console.log('Cancel quick edit');
    // Cancel quick edit
  };

  // Render the appropriate view component
  const renderViewComponent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading posts...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Error loading posts</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      );
    }

    switch (viewMode) {
      case 'card':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </div>
        );
      
      case 'table':
        return (
          <PostTable
            posts={filteredPosts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        );
      
      case 'grid':
        return (
          <PostGrid
            posts={filteredPosts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onPostAction={handlePostAction}
          />
        );
      
      case 'list':
        return (
          <PostList
            posts={filteredPosts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onPostAction={handlePostAction}
            onQuickEdit={handleQuickEdit}
            onSaveQuickEdit={handleSaveQuickEdit}
            onCancelQuickEdit={handleCancelQuickEdit}
          />
        );
      
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
          Manage your blog posts and content ({filteredPosts.length} posts)
          </p>
        </div>
        <Link href="/dashboard/content/posts/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center bg-muted/20 rounded-lg p-4 border">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* View Toggle */}
        <ViewToggle 
          currentView={viewMode} 
          onViewChange={handleViewModeChange}
          className="flex-shrink-0"
        />
      </div>
            
      {/* Content */}
      <div className="space-y-4">
        {!isLoading && !error && filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No posts found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first post to get started'}
            </p>
            {!searchTerm && (
              <Link href="/dashboard/content/posts/new">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </Link>
            )}
          </div>
        ) : (
          renderViewComponent()
        )}
      </div>
    </div>
  );
}
