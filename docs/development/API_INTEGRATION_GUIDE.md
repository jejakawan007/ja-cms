# 🔗 API INTEGRATION GUIDE - JA-CMS

## 📋 **OVERVIEW**

Dokumentasi ini menjelaskan cara mengintegrasikan frontend dengan backend API menggunakan data sample dari seeder.

---

## 🗄️ **DATABASE SEEDER SETUP**

### **📊 Seeder Configuration**

**File:** `backend/prisma/seed.ts`

**Data yang akan dibuat:**
- **Users:** Admin & Editor accounts
- **Posts:** Sample blog posts dengan categories & tags
- **Categories:** Technology, Business, Lifestyle
- **Tags:** JavaScript, React, Next.js, TypeScript, Business, Marketing
- **Media:** Sample images dari Unsplash
- **Themes:** Default & Dark themes

### **🚀 Commands untuk Setup:**

```bash
# Reset database dan jalankan seeder
cd backend
npm run db:reset
npm run db:seed

# Cek data yang dibuat
npm run db:studio
```

### **📊 Sample Data Structure:**

```typescript
// Users
{
  email: 'admin@jacms.com',
  password: 'admin123',
  role: 'SUPER_ADMIN'
}

// Posts
{
  title: 'Getting Started with Next.js 14',
  content: 'Next.js 14 introduces many new features...',
  status: 'PUBLISHED',
  category: 'Technology',
  tags: ['JavaScript', 'React', 'Next.js']
}

// Categories
[
  { name: 'Technology', color: '#3B82F6' },
  { name: 'Business', color: '#10B981' },
  { name: 'Lifestyle', color: '#F59E0B' }
]
```

---

## 🔧 **BACKEND API ENDPOINTS**

### **🔐 Authentication Endpoints**

```typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message: string;
}

// GET /api/auth/me
interface MeResponse {
  success: boolean;
  data: User;
  message: string;
}

// POST /api/auth/logout
interface LogoutResponse {
  success: boolean;
  message: string;
}
```

### **📝 Posts Endpoints**

```typescript
// GET /api/posts
interface PostsRequest {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

interface PostsResponse {
  success: boolean;
  data: {
    posts: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message: string;
}

// POST /api/posts
interface CreatePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  categoryId: string;
  tagIds: string[];
  featuredImage?: string;
}

// PUT /api/posts/:id
interface UpdatePostRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  categoryId?: string;
  tagIds?: string[];
  featuredImage?: string;
}

// DELETE /api/posts/:id
interface DeletePostResponse {
  success: boolean;
  message: string;
}
```

### **👥 Users Endpoints**

```typescript
// GET /api/users
interface UsersRequest {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AUTHOR';
}

interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message: string;
}

// POST /api/users
interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AUTHOR';
}

// PUT /api/users/:id
interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AUTHOR';
  isActive?: boolean;
}
```

### **🖼️ Media Endpoints**

```typescript
// GET /api/media
interface MediaRequest {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'image' | 'video' | 'document';
}

interface MediaResponse {
  success: boolean;
  data: {
    media: Media[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message: string;
}

// POST /api/media (multipart/form-data)
interface UploadMediaRequest {
  file: File;
  alt?: string;
}

interface UploadMediaResponse {
  success: boolean;
  data: Media;
  message: string;
}

// DELETE /api/media/:id
interface DeleteMediaResponse {
  success: boolean;
  message: string;
}
```

### **🎨 Themes Endpoints**

```typescript
// GET /api/themes
interface ThemesResponse {
  success: boolean;
  data: Theme[];
  message: string;
}

// GET /api/themes/:id
interface ThemeResponse {
  success: boolean;
  data: Theme;
  message: string;
}

// POST /api/themes
interface CreateThemeRequest {
  name: string;
  description: string;
  category: string;
  colors: ColorPalette;
  typography: TypographySettings;
  spacing: SpacingSettings;
  borderRadius: BorderRadiusSettings;
}

// PUT /api/themes/:id
interface UpdateThemeRequest {
  name?: string;
  description?: string;
  category?: string;
  colors?: ColorPalette;
  typography?: TypographySettings;
  spacing?: SpacingSettings;
  borderRadius?: BorderRadiusSettings;
}

// PUT /api/themes/:id/activate
interface ActivateThemeResponse {
  success: boolean;
  message: string;
}
```

### **📊 Dashboard Endpoints**

```typescript
// GET /api/dashboard/stats
interface DashboardStatsResponse {
  success: boolean;
  data: {
    totalPosts: number;
    totalUsers: number;
    totalViews: number;
    totalMedia: number;
    postsByStatus: {
      draft: number;
      published: number;
      archived: number;
    };
    postsByCategory: Record<string, number>;
  };
  message: string;
}

// GET /api/dashboard/recent-activity
interface RecentActivityResponse {
  success: boolean;
  data: ActivityItem[];
  message: string;
}

// GET /api/dashboard/widgets
interface WidgetsResponse {
  success: boolean;
  data: Widget[];
  message: string;
}
```

---

## 🔗 **FRONTEND API INTEGRATION**

### **📡 API Client Setup**

**File:** `frontend/lib/api/client.ts`

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor untuk menambahkan token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ja-cms-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ja-cms-token');
      localStorage.removeItem('ja-cms-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### **🔐 Authentication API**

**File:** `frontend/lib/api/auth.ts`

```typescript
import apiClient from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message: string;
}

export const authAPI = {
  // Login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/api/auth/login', data);
    return response.data;
  },

  // Get current user
  me: async (): Promise<{ success: boolean; data: User }> => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  // Logout
  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  },
};
```

### **📝 Posts API**

**File:** `frontend/lib/api/posts.ts`

```typescript
import apiClient from './client';

export interface PostsRequest {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  categoryId: string;
  tagIds: string[];
  featuredImage?: string;
}

export const postsAPI = {
  // Get posts list
  getPosts: async (params: PostsRequest = {}) => {
    const response = await apiClient.get('/api/posts', { params });
    return response.data;
  },

  // Get single post
  getPost: async (id: string) => {
    const response = await apiClient.get(`/api/posts/${id}`);
    return response.data;
  },

  // Create post
  createPost: async (data: CreatePostRequest) => {
    const response = await apiClient.post('/api/posts', data);
    return response.data;
  },

  // Update post
  updatePost: async (id: string, data: Partial<CreatePostRequest>) => {
    const response = await apiClient.put(`/api/posts/${id}`, data);
    return response.data;
  },

  // Delete post
  deletePost: async (id: string) => {
    const response = await apiClient.delete(`/api/posts/${id}`);
    return response.data;
  },
};
```

### **👥 Users API**

**File:** `frontend/lib/api/users.ts`

```typescript
import apiClient from './client';

export interface UsersRequest {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AUTHOR';
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AUTHOR';
}

export const usersAPI = {
  // Get users list
  getUsers: async (params: UsersRequest = {}) => {
    const response = await apiClient.get('/api/users', { params });
    return response.data;
  },

  // Get single user
  getUser: async (id: string) => {
    const response = await apiClient.get(`/api/users/${id}`);
    return response.data;
  },

  // Create user
  createUser: async (data: CreateUserRequest) => {
    const response = await apiClient.post('/api/users', data);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, data: Partial<CreateUserRequest>) => {
    const response = await apiClient.put(`/api/users/${id}`, data);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response.data;
  },
};
```

### **🖼️ Media API**

**File:** `frontend/lib/api/media.ts`

```typescript
import apiClient from './client';

export interface MediaRequest {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'image' | 'video' | 'document';
}

export const mediaAPI = {
  // Get media list
  getMedia: async (params: MediaRequest = {}) => {
    const response = await apiClient.get('/api/media', { params });
    return response.data;
  },

  // Upload media
  uploadMedia: async (file: File, alt?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (alt) formData.append('alt', alt);

    const response = await apiClient.post('/api/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete media
  deleteMedia: async (id: string) => {
    const response = await apiClient.delete(`/api/media/${id}`);
    return response.data;
  },
};
```

### **🎨 Themes API**

**File:** `frontend/lib/api/themes.ts`

```typescript
import apiClient from './client';

export interface CreateThemeRequest {
  name: string;
  description: string;
  category: string;
  colors: ColorPalette;
  typography: TypographySettings;
  spacing: SpacingSettings;
  borderRadius: BorderRadiusSettings;
}

export const themesAPI = {
  // Get themes list
  getThemes: async () => {
    const response = await apiClient.get('/api/themes');
    return response.data;
  },

  // Get single theme
  getTheme: async (id: string) => {
    const response = await apiClient.get(`/api/themes/${id}`);
    return response.data;
  },

  // Create theme
  createTheme: async (data: CreateThemeRequest) => {
    const response = await apiClient.post('/api/themes', data);
    return response.data;
  },

  // Update theme
  updateTheme: async (id: string, data: Partial<CreateThemeRequest>) => {
    const response = await apiClient.put(`/api/themes/${id}`, data);
    return response.data;
  },

  // Delete theme
  deleteTheme: async (id: string) => {
    const response = await apiClient.delete(`/api/themes/${id}`);
    return response.data;
  },

  // Activate theme
  activateTheme: async (id: string) => {
    const response = await apiClient.put(`/api/themes/${id}/activate`);
    return response.data;
  },
};
```

### **📊 Dashboard API**

**File:** `frontend/lib/api/dashboard.ts`

```typescript
import apiClient from './client';

export const dashboardAPI = {
  // Get dashboard stats
  getStats: async () => {
    const response = await apiClient.get('/api/dashboard/stats');
    return response.data;
  },

  // Get recent activity
  getRecentActivity: async () => {
    const response = await apiClient.get('/api/dashboard/recent-activity');
    return response.data;
  },

  // Get widgets data
  getWidgets: async () => {
    const response = await apiClient.get('/api/dashboard/widgets');
    return response.data;
  },
};
```

---

## 📊 **DATA FETCHING HOOKS**

### **🔐 Authentication Hook**

**File:** `frontend/hooks/useAuth.ts`

```typescript
import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '@/lib/api/auth';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (token) {
        const response = await authAPI.me();
        setUser(response.data);
      }
    } catch (error) {
      localStorage.removeItem('ja-cms-token');
      localStorage.removeItem('ja-cms-user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    localStorage.setItem('ja-cms-token', response.data.token);
    localStorage.setItem('ja-cms-user', JSON.stringify(response.data.user));
    setUser(response.data.user);
  };

  const logout = async () => {
    await authAPI.logout();
    localStorage.removeItem('ja-cms-token');
    localStorage.removeItem('ja-cms-user');
    setUser(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### **📝 Posts Hook**

**File:** `frontend/hooks/usePosts.ts`

```typescript
import { useState, useEffect } from 'react';
import { postsAPI, PostsRequest } from '@/lib/api/posts';

export const usePosts = (params: PostsRequest = {}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getPosts(params);
      setPosts(response.data.posts);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [params.page, params.limit, params.search, params.category, params.status]);

  return {
    posts,
    loading,
    error,
    pagination,
    refetch: fetchPosts,
  };
};
```

### **👥 Users Hook**

**File:** `frontend/hooks/useUsers.ts`

```typescript
import { useState, useEffect } from 'react';
import { usersAPI, UsersRequest } from '@/lib/api/users';

export const useUsers = (params: UsersRequest = {}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getUsers(params);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [params.page, params.limit, params.search, params.role]);

  return {
    users,
    loading,
    error,
    pagination,
    refetch: fetchUsers,
  };
};
```

### **🖼️ Media Hook**

**File:** `frontend/hooks/useMedia.ts`

```typescript
import { useState, useEffect } from 'react';
import { mediaAPI, MediaRequest } from '@/lib/api/media';

export const useMedia = (params: MediaRequest = {}) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await mediaAPI.getMedia(params);
      setMedia(response.data.media);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [params.page, params.limit, params.search, params.type]);

  return {
    media,
    loading,
    error,
    pagination,
    refetch: fetchMedia,
  };
};
```

### **🎨 Themes Hook**

**File:** `frontend/hooks/useThemes.ts`

```typescript
import { useState, useEffect } from 'react';
import { themesAPI } from '@/lib/api/themes';

export const useThemes = () => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const response = await themesAPI.getThemes();
      setThemes(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch themes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  return {
    themes,
    loading,
    error,
    refetch: fetchThemes,
  };
};
```

### **📊 Dashboard Hook**

**File:** `frontend/hooks/useDashboard.ts`

```typescript
import { useState, useEffect } from 'react';
import { dashboardAPI } from '@/lib/api/dashboard';

export const useDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, activityResponse, widgetsResponse] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentActivity(),
        dashboardAPI.getWidgets(),
      ]);

      setStats(statsResponse.data);
      setActivity(activityResponse.data);
      setWidgets(widgetsResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats,
    activity,
    widgets,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};
```

---

## 🧪 **TESTING INTEGRATION**

### **📋 Testing Checklist:**

**Backend Testing:**
- [ ] Database seeder berjalan dengan baik
- [ ] API endpoints berfungsi dengan data real
- [ ] Authentication flow berfungsi
- [ ] CRUD operations berfungsi
- [ ] File upload berfungsi
- [ ] Theme management berfungsi

**Frontend Testing:**
- [ ] Login dengan data real
- [ ] Dashboard menampilkan data real
- [ ] Posts CRUD dengan data real
- [ ] Users CRUD dengan data real
- [ ] Media upload dengan data real
- [ ] Theme customization berfungsi

**Integration Testing:**
- [ ] Frontend-backend communication
- [ ] Real-time data updates
- [ ] Error handling
- [ ] Loading states
- [ ] Form validation
- [ ] File upload integration

### **🚀 Commands untuk Testing:**

```bash
# Backend testing
cd backend
npm run test

# Frontend testing
cd frontend
npm run test

# E2E testing
npm run test:e2e
```

---

## 📝 **ERROR HANDLING**

### **🔧 Error Types:**

```typescript
// API Error Response
interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Common Error Codes
enum ErrorCodes {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
```

### **🎯 Error Handling Strategy:**

```typescript
// Global error handler
const handleAPIError = (error: any) => {
  if (error.response?.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    // Show forbidden message
    toast.error('You do not have permission to perform this action');
  } else if (error.response?.status === 404) {
    // Show not found message
    toast.error('Resource not found');
  } else {
    // Show generic error
    toast.error('An error occurred. Please try again.');
  }
};
```

---

## 📊 **PERFORMANCE OPTIMIZATION**

### **⚡ Optimization Strategies:**

1. **Caching:** Implement React Query/SWR untuk caching
2. **Pagination:** Load data in chunks
3. **Lazy Loading:** Load components on demand
4. **Image Optimization:** Use Next.js Image component
5. **Bundle Splitting:** Code splitting untuk routes

### **📈 Monitoring:**

```typescript
// Performance monitoring
const monitorAPI = (endpoint: string, duration: number) => {
  console.log(`API Call: ${endpoint} - ${duration}ms`);
  // Send to analytics service
};
```

---

**Last Updated:** January 6, 2025  
**Version:** 1.0.0
