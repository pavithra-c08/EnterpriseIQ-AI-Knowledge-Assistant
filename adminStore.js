import { create } from 'zustand';
import * as api from '../services/api';

export const useAdminStore = create((set) => ({
  users: [],
  isLoading: false,
  isCreating: false,
  error: null,

  loadUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getAdminUsers();
      const users = Array.isArray(data) ? data : data.users ?? [];
      set({ users, isLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.detail || 'Failed to load users',
        isLoading: false,
      });
    }
  },

  createUser: async (userData) => {
    set({ isCreating: true, error: null });
    try {
      const result = await api.createAdminUser(userData);
      // Reload users after creation
      const data = await api.getAdminUsers();
      const users = Array.isArray(data) ? data : data.users ?? [];
      set({ users, isCreating: false });
      return result; // contains { message, default_password }
    } catch (err) {
      set({
        error: err.response?.data?.detail || 'Failed to create user',
        isCreating: false,
      });
      throw err;
    }
  },

  deleteUser: async (userId) => {
    try {
      await api.deleteAdminUser(userId);
      set((state) => ({
        users: state.users.filter((u) => u.id !== userId),
      }));
    } catch (err) {
      set({ error: err.response?.data?.detail || 'Failed to delete user' });
      throw err;
    }
  },

  resetPassword: async (userId) => {
    try {
      const result = await api.resetUserPassword(userId);
      return result; // contains { message, default_password }
    } catch (err) {
      set({ error: err.response?.data?.detail || 'Failed to reset password' });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
