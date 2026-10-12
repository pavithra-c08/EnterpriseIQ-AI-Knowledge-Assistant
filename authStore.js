import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginUser, getMe } from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      username: null,
      role: null,
      mustChangePassword: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const data = await loginUser(credentials);
          set({
            token: data.access_token,
            username: data.username,
            role: data.role,
            mustChangePassword: data.must_change_password,
            isLoading: false,
          });
          return data;
        } catch (err) {
          const message =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            'Login failed. Check your credentials.';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      logout: () => {
        set({
          token: null,
          username: null,
          role: null,
          mustChangePassword: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      setMustChangePassword: (value) => set({ mustChangePassword: value }),

      fetchMe: async () => {
        try {
          const data = await getMe();
          set({
            username: data.username,
            role: data.role,
            mustChangePassword: data.must_change_password,
          });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'rag-auth',
      partialize: (state) => ({
        token: state.token,
        username: state.username,
        role: state.role,
        mustChangePassword: state.mustChangePassword,
        // NOTE: isLoading and error are intentionally NOT persisted
      }),
    }
  )
);
