/* API Service Layer
   Wraps axios with auth headers. Delegates to mockData when VITE_USE_MOCK is true. */

import axios from 'axios';
import * as mock from './mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT token into every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth ---
export async function loginUser(email, password) {
  if (USE_MOCK) return mock.loginUser(email, password);
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function registerUser(userData) {
  if (USE_MOCK) return mock.registerUser(userData);
  const { data } = await api.post('/auth/register', userData);
  return data;
}

export async function loginAdmin(email, password) {
  if (USE_MOCK) return mock.loginAdmin(email, password);
  const { data } = await api.post('/auth/admin/login', { email, password });
  return data;
}

// --- User ---
export async function getUser() {
  if (USE_MOCK) return mock.getUser();
  const { data } = await api.get('/user/me');
  return data;
}

// --- Resume ---
export async function getResume() {
  if (USE_MOCK) return mock.getResume();
  const { data } = await api.get('/resume');
  return data;
}

export async function uploadResume(file) {
  if (USE_MOCK) return mock.uploadResume(file);
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// --- Interview ---
export async function getSessions() {
  if (USE_MOCK) return mock.getSessions();
  const { data } = await api.get('/interview/history');
  return data;
}

export async function getSession(id) {
  if (USE_MOCK) return mock.getSession(id);
  const { data } = await api.get(`/interview/${id}`);
  return data;
}

export async function startInterview(config) {
  if (USE_MOCK) return mock.startInterview(config);
  const { data } = await api.post('/interview/start', config);
  return data;
}

export async function submitAnswer(sessionId, answer) {
  if (USE_MOCK) return mock.submitAnswer(sessionId, answer);
  const { data } = await api.post(`/interview/${sessionId}/answer`, { answer });
  return data;
}

export async function completeInterview(sessionId) {
  if (USE_MOCK) return mock.completeInterview(sessionId);
  const { data } = await api.post(`/interview/${sessionId}/complete`);
  return data;
}

// --- Report ---
export async function getReport(sessionId) {
  if (USE_MOCK) return mock.getReport(sessionId);
  const { data } = await api.get(`/interview/${sessionId}/report`);
  return data;
}

// --- Categories ---
export async function getCategories() {
  if (USE_MOCK) return mock.getCategories();
  const { data } = await api.get('/categories');
  return data;
}

export async function createCategory(category) {
  if (USE_MOCK) return mock.createCategory(category);
  const { data } = await api.post('/admin/categories', category);
  return data;
}

export async function updateCategory(id, updates) {
  if (USE_MOCK) return mock.updateCategory(id, updates);
  const { data } = await api.put(`/admin/categories/${id}`, updates);
  return data;
}

export async function deleteCategory(id) {
  if (USE_MOCK) return mock.deleteCategory(id);
  await api.delete(`/admin/categories/${id}`);
  return { id };
}

// --- Admin ---
export async function getAdminDashboard() {
  if (USE_MOCK) return mock.getAdminDashboard();
  const { data } = await api.get('/admin/dashboard');
  return data;
}

export async function getAdminUsers() {
  if (USE_MOCK) return mock.getAdminUsers();
  const { data } = await api.get('/admin/users');
  return data;
}

export default api;
