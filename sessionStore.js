import { create } from 'zustand';
import * as api from '../services/api';

export const useSessionStore = create((set, get) => ({
  sessions: [],
  selectedSession: null,
  isLoading: false,
  error: null,

  loadSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getSessions();
      // API might return array directly or { sessions: [...] }
      const sessions = Array.isArray(data) ? data : data.sessions ?? [];
      set({ sessions, isLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.detail || 'Failed to load sessions',
        isLoading: false,
      });
    }
  },

  createSession: async (title = 'New Chat') => {
    set({ isLoading: true, error: null });
    try {
      const session = await api.createSession(title);
      set((state) => ({
        sessions: [session, ...state.sessions],
        selectedSession: session,
        isLoading: false,
      }));
      return session;
    } catch (err) {
      set({
        error: err.response?.data?.detail || 'Failed to create session',
        isLoading: false,
      });
      throw err;
    }
  },

  deleteSession: async (id) => {
    try {
      await api.deleteSession(id);
      set((state) => {
        const sessions = state.sessions.filter((s) => s.id !== id);
        const selectedSession =
          state.selectedSession?.id === id ? (sessions[0] || null) : state.selectedSession;
        return { sessions, selectedSession };
      });
    } catch (err) {
      set({ error: err.response?.data?.detail || 'Failed to delete session' });
      throw err;
    }
  },

  renameSession: async (id, title) => {
    const prev = get().sessions;
    // Optimistic update
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, title } : s
      ),
      selectedSession:
        state.selectedSession?.id === id
          ? { ...state.selectedSession, title }
          : state.selectedSession,
    }));
    try {
      const updated = await api.renameSession(id, title);
      // Sync with server response
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === id ? { ...s, title: updated.title } : s
        ),
        selectedSession:
          state.selectedSession?.id === id
            ? { ...state.selectedSession, title: updated.title }
            : state.selectedSession,
      }));
      return updated;
    } catch (err) {
      // Rollback
      set({ sessions: prev });
      throw err;
    }
  },

  selectSession: (session) => {
    set({ selectedSession: session });
  },

  clearError: () => set({ error: null }),
}));
