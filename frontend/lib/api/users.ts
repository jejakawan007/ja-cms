import { apiClient } from './client';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'USER' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  postCount: number;
  loginCount: number;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: User['role'];
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: User['role'];
  status?: User['status'];
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
}

export interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: User['role'];
  status?: User['status'];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  usersByRole: {
    ADMIN: number;
    EDITOR: number;
    USER: number;
    VIEWER: number;
  };
  recentRegistrations: number;
  totalPosts: number;
  totalLogins: number;
}

export const usersApi = {
  // Get all users with pagination and filters
  getUsers: async (params?: UserSearchParams): Promise<{ users: User[]; total: number; page: number; limit: number }> => {
    const response = await apiClient.get<{ users: User[]; total: number; page: number; limit: number }>('/users', params);
    return response.data!;
  },

  // Get user by ID
  getUser: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data!;
  },

  // Create new user
  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<User>('/users', data);
    return response.data!;
  },

  // Update user
  updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return response.data!;
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`/users/${id}`);
  },

  // Update user status
  updateUserStatus: async (id: string, status: User['status']): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}/status`, { status });
    return response.data!;
  },

  // Update user role
  updateUserRole: async (id: string, role: User['role']): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}/role`, { role });
    return response.data!;
  },

  // Get user statistics
  getUserStats: async (): Promise<UserStats> => {
    const response = await apiClient.get<UserStats>('/users/stats');
    return response.data!;
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me');
    return response.data!;
  },

  // Update current user profile
  updateCurrentUser: async (data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<User>('/users/me', data);
    return response.data!;
  },

  // Change current user password
  changeCurrentUserPassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await apiClient.post<void>('/users/me/change-password', data);
  },

  // Enable/disable two-factor authentication
  toggleTwoFactor: async (enabled: boolean): Promise<User> => {
    const response = await apiClient.post<User>('/users/me/two-factor', { enabled });
    return response.data!;
  },

  // Verify two-factor authentication code
  verifyTwoFactor: async (code: string): Promise<void> => {
    await apiClient.post<void>('/users/me/two-factor/verify', { code });
  },

  // Resend email verification
  resendVerification: async (): Promise<void> => {
    await apiClient.post<void>('/users/me/resend-verification');
  },

  // Upload user avatar
  uploadAvatar: async (file: File): Promise<{ avatar: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<{ avatar: string }>('/users/me/avatar', formData);
    return response.data!;
  },

  // Get user activity
  getUserActivity: async (id: string, limit?: number): Promise<unknown[]> => {
    const response = await apiClient.get<unknown[]>(`/users/${id}/activity`, { limit });
    return response.data!;
  },

  // Bulk operations
  bulkUpdateStatus: async (userIds: string[], status: User['status']): Promise<void> => {
    await apiClient.post<void>('/users/bulk/status', { userIds, status });
  },

  bulkUpdateRole: async (userIds: string[], role: User['role']): Promise<void> => {
    await apiClient.post<void>('/users/bulk/role', { userIds, role });
  },

  bulkDelete: async (userIds: string[]): Promise<void> => {
    await apiClient.post<void>('/users/bulk/delete', { userIds });
  },
};
