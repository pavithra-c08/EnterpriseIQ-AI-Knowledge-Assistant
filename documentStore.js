import { create } from 'zustand';
import * as api from '../services/api';

export const useDocumentStore = create((set) => ({
  documents: [],
  count: 0,
  isLoading: false,
  isUploading: false,
  isRebuilding: false,
  error: null,

  loadDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getDocuments();
      set({
        documents: data.documents ?? [],
        count: data.count ?? 0,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.detail || 'Failed to load documents',
        isLoading: false,
      });
    }
  },

  uploadDocument: async (file) => {
    set({ isUploading: true, error: null });
    try {
      const result = await api.uploadDocument(file);
      // Reload documents after upload
      const data = await api.getDocuments();
      set({
        documents: data.documents ?? [],
        count: data.count ?? 0,
        isUploading: false,
      });
      return result;
    } catch (err) {
      set({
        error: err.response?.data?.detail || 'Failed to upload document',
        isUploading: false,
      });
      throw err;
    }
  },

  rebuildIndex: async () => {
    set({ isRebuilding: true, error: null });
    try {
      const result = await api.rebuildIndex();
      set({ isRebuilding: false });
      return result;
    } catch (err) {
      set({
        error: err.response?.data?.detail || 'Failed to rebuild index',
        isRebuilding: false,
      });
      throw err;
    }
  },

  deleteDocument: async (filename) => {
    try {
      const result = await api.deleteDocument(filename);
      set((state) => {
        const documents = state.documents.filter((doc) => {
          const name = typeof doc === 'string' ? doc : doc.filename || doc.name;
          return name !== filename;
        });
        return { documents, count: documents.length };
      });
      return result;
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to delete document';
      set({ error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
