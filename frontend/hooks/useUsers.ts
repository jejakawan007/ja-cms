// Users Hook
// Hook for managing users data

import { useState, useEffect } from 'react';
import { usersApi, type User, type UserSearchParams, type CreateUserRequest, type UpdateUserRequest } from '@/lib/api/users';

export const useUsers = (initialParams?: UserSearchParams) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<UserSearchParams>(initialParams || {});

  // Fetch users
  const fetchUsers = async (params?: UserSearchParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getUsers(params || searchParams);
      setUsers(response.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Create user
  const createUser = async (userData: CreateUserRequest) => {
    try {
      setLoading(true);
      const newUser = await usersApi.createUser(userData);
      setUsers(prev => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh users list
  const refreshUsers = () => {
    fetchUsers();
  };

  // Update user
  const updateUser = async (id: string, userData: UpdateUserRequest) => {
    try {
      setLoading(true);
      const updatedUser = await usersApi.updateUser(id, userData);
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update users list
  const updateUsersList = (updatedUser: User) => {
    setUsers(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user));
  };

  // Delete user
  const deleteUser = async (id: string) => {
    try {
      setLoading(true);
      await usersApi.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove user from list
  const removeUserFromList = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  // Update user status
  const updateUserStatus = async (id: string, status: User['status']) => {
    try {
      setLoading(true);
      const updatedUser = await usersApi.updateUserStatus(id, status);
      updateUsersList(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user role
  const updateUserRole = async (id: string, role: User['role']) => {
    try {
      setLoading(true);
      const updatedUser = await usersApi.updateUserRole(id, role);
      updateUsersList(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Bulk update status
  const bulkUpdateStatus = async (userIds: string[], status: User['status']) => {
    try {
      setLoading(true);
      await usersApi.bulkUpdateStatus(userIds, status);
      setUsers(prev => prev.map(user => 
        userIds.includes(user.id) ? { ...user, status } : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk update user status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Bulk update role
  const bulkUpdateRole = async (userIds: string[], role: User['role']) => {
    try {
      setLoading(true);
      await usersApi.bulkUpdateRole(userIds, role);
      setUsers(prev => prev.map(user => 
        userIds.includes(user.id) ? { ...user, role } : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk update user role');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Bulk delete
  const bulkDelete = async (userIds: string[]) => {
    try {
      setLoading(true);
      await usersApi.bulkDelete(userIds);
      setUsers(prev => prev.filter(user => !userIds.includes(user.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk delete users');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update search parameters
  const updateSearchParams = (newParams: Partial<UserSearchParams>) => {
    const updatedParams = { ...searchParams, ...newParams };
    setSearchParams(updatedParams);
    fetchUsers(updatedParams);
  };

  // Reset search parameters
  const resetSearchParams = () => {
    const defaultParams: UserSearchParams = {};
    setSearchParams(defaultParams);
    fetchUsers(defaultParams);
  };

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    searchParams,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    updateUserRole,
    bulkUpdateStatus,
    bulkUpdateRole,
    bulkDelete,
    updateSearchParams,
    resetSearchParams,
    refreshUsers,
    removeUserFromList,
  };
};

export const useUserStats = () => {
  const [stats, setStats] = useState<{
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
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getUserStats();
      setStats(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

export const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getCurrentUser();
      setUser(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch current user');
    } finally {
      setLoading(false);
    }
  };

  // Update current user
  const updateCurrentUser = async (userData: UpdateUserRequest) => {
    try {
      setLoading(true);
      const updatedUser = await usersApi.updateCurrentUser(userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update current user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwordData: { currentPassword: string; newPassword: string }) => {
    try {
      setLoading(true);
      await usersApi.changeCurrentUserPassword(passwordData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload avatar
  const uploadAvatar = async (file: File) => {
    try {
      setLoading(true);
      const response = await usersApi.uploadAvatar(file);
      setUser(prev => prev ? { ...prev, avatar: response.avatar } : null);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return {
    user,
    loading,
    error,
    fetchCurrentUser,
    updateCurrentUser,
    changePassword,
    uploadAvatar,
  };
};
