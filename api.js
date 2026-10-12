import axios from "axios";
import { useAuthStore } from "../store/authStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle 401 globally — auto logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ─── Auth ─────────────────────────────────────────────────────────
export const loginUser = (credentials) =>
  api.post("/login", credentials).then((r) => r.data);

export const getMe = () => api.get("/me").then((r) => r.data);

export const changePassword = (data) =>
  api.post("/change-password", data).then((r) => r.data);

// ─── Sessions ─────────────────────────────────────────────────────
export const getSessions = () => api.get("/sessions").then((r) => r.data);

export const createSession = (title) =>
  api.post("/sessions", { title }).then((r) => r.data);

export const deleteSession = (id) =>
  api.delete(`/sessions/${id}`).then((r) => r.data);

export const renameSession = (id, title) =>
  api.put(`/sessions/${id}`, { title }).then((r) => r.data);

export const getMessages = (sessionId) =>
  api.get(`/sessions/${sessionId}/messages`).then((r) => r.data);

export const askQuestion = (sessionId, question) =>
  api.post(`/sessions/${sessionId}/ask`, { question }).then((r) => r.data);

// ─── Admin ────────────────────────────────────────────────────────
export const getAdminUsers = () => api.get("/admin/users").then((r) => r.data);

export const createAdminUser = (data) =>
  api.post("/admin/users", data).then((r) => r.data);

export const deleteAdminUser = (userId) =>
  api.delete(`/admin/users/${userId}`).then((r) => r.data);

export const resetUserPassword = (userId) =>
  api.post(`/admin/users/${userId}/reset-password`).then((r) => r.data);

// ─── Documents ────────────────────────────────────────────────────
export const getDocuments = () => api.get("/documents").then((r) => r.data);

export const uploadDocument = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api
    .post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

export const rebuildIndex = () => api.post("/rebuild").then((r) => r.data);

export const deleteDocument = (filename) =>
  api.delete(`/documents/${filename}`).then((r) => r.data);

export default api;
