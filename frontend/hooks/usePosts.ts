// Posts Hook
// Hook for managing posts data

import { useState, useEffect } from 'react';
import { postsApi } from '@/lib/api/posts';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
  publishedAt?: string;
  authorId: string;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export interface PostSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
  categoryId?: string;
  authorId?: string;
  tagIds?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export const usePosts = (initialParams?: PostSearchParams) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<PostSearchParams>(initialParams || {});

  // Fetch posts
  const fetchPosts = async (params?: PostSearchParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await postsApi.getPosts(params || searchParams);
      if (response.success && response.data) {
        setPosts(response.data.posts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  // Create post
  const createPost = async (postData: {
    title: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
    categoryId?: string;
    tagIds?: string[];
    publishedAt?: string;
  }) => {
    try {
      setLoading(true);
      const response = await postsApi.createPost(postData);
      if (response.success && response.data) {
        setPosts(prev => [response.data!, ...prev]);
        return response.data;
      }
      throw new Error('Failed to create post');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh posts list
  const refreshPosts = () => {
    fetchPosts();
  };

  // Update post
  const updatePost = async (id: string, postData: {
    title?: string;
    content?: string;
    excerpt?: string;
    featuredImage?: string;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
    categoryId?: string;
    tagIds?: string[];
    publishedAt?: string;
  }) => {
    try {
      setLoading(true);
      const response = await postsApi.updatePost({ id, ...postData });
      if (response.success && response.data) {
        setPosts(prev => prev.map(post => post.id === id ? response.data! : post));
        return response.data;
      }
      throw new Error('Failed to update post');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update posts list
  const updatePostsList = (updatedPost: Post) => {
    setPosts(prev => prev.map(post => post.id === updatedPost.id ? updatedPost : post));
  };

  // Delete post
  const deletePost = async (id: string) => {
    try {
      setLoading(true);
      await postsApi.deletePost(id);
      setPosts(prev => prev.filter(post => post.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove post from list
  const removePostFromList = (id: string) => {
    setPosts(prev => prev.filter(post => post.id !== id));
  };

  // Publish post
  const publishPost = async (id: string) => {
    try {
      setLoading(true);
      const response = await postsApi.publishPost(id);
      if (response.success && response.data) {
        updatePostsList(response.data);
        return response.data;
      }
      throw new Error('Failed to publish post');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish post');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update post in list
  const updatePostInList = (updatedPost: Post) => {
    setPosts(prev => prev.map(post => post.id === updatedPost.id ? updatedPost : post));
  };

  // Unpublish post
  const unpublishPost = async (id: string) => {
    try {
      setLoading(true);
      const response = await postsApi.unpublishPost(id);
      if (response.success && response.data) {
        updatePostsList(response.data);
        return response.data;
      }
      throw new Error('Failed to unpublish post');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unpublish post');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update post in list
  const updatePostInList2 = (updatedPost: Post) => {
    setPosts(prev => prev.map(post => post.id === updatedPost.id ? updatedPost : post));
  };

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    searchParams,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    publishPost,
    unpublishPost,
    updateSearchParams: (newParams: Partial<PostSearchParams>) => {
      const updatedParams = { ...searchParams, ...newParams };
      setSearchParams(updatedParams);
      fetchPosts(updatedParams);
    },
    resetSearchParams: () => {
      const defaultParams: PostSearchParams = {};
      setSearchParams(defaultParams);
      fetchPosts(defaultParams);
    },
    refreshPosts,
    removePostFromList,
    updatePostInList,
    updatePostInList2,
  };
};
