'use client';

/**
 * Authentication Hook
 * Hook for managing authentication state with enterprise types
 */

import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api/auth';
import { AuthUser, LoginResponse } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to convert API user to AuthUser
  const convertToAuthUser = (apiUser: any): AuthUser => {
    // Berikan default preferences jika tidak ada
    const defaultPreferences = {
      theme: 'light' as const,
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        desktop: true,
      },
      dashboard: {
        layout: 'grid' as const,
        widgets: ['stats', 'recent-posts', 'recent-activity'],
      },
    };

    return {
      id: apiUser.id,
      email: apiUser.email,
      firstName: apiUser.firstName,
      lastName: apiUser.lastName,
      role: apiUser.role,
      isActive: apiUser.isActive,
      // Safely handle potentially missing fields
      permissions: apiUser.permissions || [],
      preferences: apiUser.preferences || defaultPreferences,
      isVerified: apiUser.isVerified !== undefined ? apiUser.isVerified : true,
      avatar: apiUser.avatar || null,
      bio: apiUser.bio || null,
      createdAt: apiUser.createdAt || new Date().toISOString(),
      updatedAt: apiUser.updatedAt || new Date().toISOString(),
    };
  };



  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('ja-cms-token');
        
        if (!token) {
          setLoading(false);
          return;
        }

        // Only check auth if we're not on login page
        if (typeof window !== 'undefined' && window.location.pathname === '/login') {
          setLoading(false);
          return;
        }

        const response = await authApi.getCurrentUser();
        if (response.success && response.data) {
          setUser(convertToAuthUser(response.data));
        } else {
          // Token is invalid, clear tokens
          localStorage.removeItem('ja-cms-token');
          localStorage.removeItem('refreshToken');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // Only remove tokens if it's a real auth error, not a network error
        if (err instanceof Error && err.message.includes('401')) {
          localStorage.removeItem('ja-cms-token');
          localStorage.removeItem('refreshToken');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Attempting login with:', { email, passwordLength: password.length });
      
      const response = await authApi.login({ email, password });
      
      if (response.success && response.data) {
        // Store tokens in localStorage and cookies
        localStorage.setItem('ja-cms-token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        
        // Also set token in cookies for middleware with proper settings
        const cookieOptions = `path=/; max-age=86400; SameSite=Lax; secure=false; domain=localhost`;
        document.cookie = `ja-cms-token=${response.data.token}; ${cookieOptions}`;
        document.cookie = `refreshToken=${response.data.refreshToken}; ${cookieOptions}`;
        
        // Convert response user to AuthUser interface
        const userData = convertToAuthUser(response.data.user);
        setUser(userData);
        
        console.log('✅ Login successful:', userData.email);
        
        // Wait a bit for state to update and cookies to be set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return {
          user: userData,
          token: response.data.token,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn || 86400,
        };
      } else {
        throw new Error(response.error?.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string): Promise<LoginResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.register({ email, password, firstName, lastName });
      
      if (response.success && response.data) {
        // Store tokens in localStorage and cookies
        localStorage.setItem('ja-cms-token', response.data.token);  
        localStorage.setItem('refreshToken', response.data.refreshToken);
        
        // Also set token in cookies for middleware with proper settings
        const cookieOptions = `path=/; max-age=86400; SameSite=Lax; secure=false; domain=localhost`;
        document.cookie = `ja-cms-token=${response.data.token}; ${cookieOptions}`;
        document.cookie = `refreshToken=${response.data.refreshToken}; ${cookieOptions}`;
        
        // Convert response user to AuthUser interface
        const userData = convertToAuthUser(response.data.user);
        setUser(userData);
        
        return {
          user: userData,
          token: response.data.token,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn || 86400,
        };
      } else {
        throw new Error(response.error?.message || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear tokens from localStorage and cookies
    localStorage.removeItem('ja-cms-token');
    localStorage.removeItem('refreshToken');
    document.cookie = 'ja-cms-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    setUser(null);
    setError(null);
  };

  const refreshToken = async (): Promise<string | null> => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (!refreshTokenValue) {
        logout();
        return null;
      }

      const response = await authApi.refreshToken(refreshTokenValue);
      
      if (response.success && response.data) {
        localStorage.setItem('ja-cms-token', response.data.token);
        
        // Update cookie
        const cookieOptions = `path=/; max-age=86400; SameSite=Lax; secure=false; domain=localhost`;
        document.cookie = `ja-cms-token=${response.data.token}; ${cookieOptions}`;
        
        return response.data.token;
      } else {
        logout();
        return null;
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
      logout();
      return null;
    }
  };

  const updateProfile = async (profileData: Partial<AuthUser>): Promise<AuthUser | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.updateProfile(profileData);
      
      if (response.success && response.data) {
        const userData = convertToAuthUser(response.data);
        setUser(userData);
        return userData;
      } else {
        throw new Error(response.error?.message || 'Profile update failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.changePassword({ currentPassword, newPassword });
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.error?.message || 'Password change failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password change failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  // Check if user has specific role
  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };



  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    hasPermission,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
  };
};