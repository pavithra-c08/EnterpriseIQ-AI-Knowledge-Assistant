import { create } from 'zustand';
import * as api from '../services/api';

export const useChatStore = create((set, get) => ({
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,

  loadMessages: async (sessionId) => {
    set({ isLoading: true, error: null, messages: [] });
    try {
      const data = await api.getMessages(sessionId);
      // API may return array or { messages: [...] }
      const messages = Array.isArray(data) ? data : data.messages ?? [];
      set({ messages, isLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.detail || 'Failed to load messages',
        isLoading: false,
      });
    }
  },

  sendMessage: async (sessionId, question) => {
    // Optimistically add the user message
    const userMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: question,
      created_at: new Date().toISOString(),
    };
    set((state) => ({
      messages: [...state.messages, userMsg],
      isSending: true,
      error: null,
    }));

    try {
      const data = await api.askQuestion(sessionId, question);
      const assistantMsg = {
        id: `resp-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        sources: data.sources ?? [],
        created_at: new Date().toISOString(),
      };
      set((state) => ({
        messages: [...state.messages, assistantMsg],
        isSending: false,
      }));
      return data;
    } catch (err) {
      // Remove the optimistic user message on failure
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== userMsg.id),
        error: err.response?.data?.detail || 'Failed to send message',
        isSending: false,
      }));
      throw err;
    }
  },

  clearMessages: () => set({ messages: [], error: null }),
  clearError: () => set({ error: null }),
}));
