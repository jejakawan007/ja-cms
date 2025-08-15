/**
 * Authentication API Service
 * Service for authentication with enterprise types
 */

import { apiClient, ApiResponse } from './client';
import { AuthUser, LoginRequest, LoginResponse, RegisterRequest } from '@/types';

export const authApi = {
  // Login user
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>('/auth/login', data);
  },

  // Register user
  async register(data: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>('/auth/register', data);
  },

  // Logout user
  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/logout');
  },

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<AuthUser>> {
    return apiClient.get<AuthUser>('/auth/profile');
  },

  // Update user profile
  async updateProfile(data: Partial<AuthUser>): Promise<ApiResponse<AuthUser>> {
    return apiClient.put<AuthUser>('/auth/profile', data);
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string }>> {
    return apiClient.post<{ token: string }>('/auth/refresh', { refreshToken });
  },

  // Change password
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/change-password', data);
  },

  // Forgot password
  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/forgot-password', { email });
  },

  // Reset password
  async resetPassword(data: { token: string; newPassword: string }): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/reset-password', data);
  }
};
