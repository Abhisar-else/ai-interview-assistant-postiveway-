/*
  API Service Dispatcher
  Mastery Refactor: Cleanly separates Real vs Mock logic.
*/
import axios from 'axios';
import * as mock from './mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Auth Interceptors
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

/**
 * Mastery Helper: Automatically chooses between Mock or Real implementation.
 * Keeps components agnostic of where data comes from.
 */
const apiCall = (realFn, mockFn) => (...args) => USE_MOCK ? mockFn(...args) : realFn(...args);

// --- Auth ---
export const loginUser = apiCall((email, password) => client.post('/auth/login', { email, password }).then(r => r.data), mock.loginUser);
export const registerUser = apiCall((userData) => client.post('/auth/register', userData).then(r => r.data), mock.registerUser);
export const loginAdmin = apiCall((email, password) => client.post('/auth/admin/login', { email, password }).then(r => r.data), mock.loginAdmin);

// --- User & Profile ---
export const getUser = apiCall(() => client.get('/user/me').then(r => r.data), mock.getUser);
export const getProfile = apiCall(() => client.get('/profile').then(r => r.data), mock.getProfile);
export const updateProfile = apiCall((updates) => client.put('/profile', updates).then(r => r.data), mock.updateProfile);

// --- Resume ---
export const getResume = apiCall(() => client.get('/resume').then(r => r.data), mock.getResume);
export const uploadResume = apiCall((file) => {
  const fd = new FormData(); fd.append('file', file);
  return client.post('/resume/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
}, mock.uploadResume);

// --- Interview ---
export const getSessions = apiCall(() => client.get('/interview/history').then(r => r.data), mock.getSessions);
export const getSession = apiCall((id) => client.get(`/interview/${id}`).then(r => r.data), mock.getSession);
export const startInterview = apiCall((config) => client.post('/interview/start', config).then(r => r.data), mock.startInterview);
export const submitAnswer = apiCall((id, answer) => client.post(`/interview/${id}/answer`, { answer }).then(r => r.data), mock.submitAnswer);
export const completeInterview = apiCall((id) => client.post(`/interview/${id}/complete`).then(r => r.data), mock.completeInterview);

// --- Report ---
export const getReport = apiCall((id) => client.get(`/interview/${id}/report`).then(r => r.data), mock.getReport);

// --- Categories ---
export const getCategories = apiCall(() => client.get('/categories').then(r => r.data), mock.getCategories);
export const createCategory = apiCall((cat) => client.post('/admin/categories', cat).then(r => r.data), mock.createCategory);
export const updateCategory = apiCall((id, up) => client.put(`/admin/categories/${id}`, up).then(r => r.data), mock.updateCategory);
export const deleteCategory = apiCall((id) => client.delete(`/admin/categories/${id}`).then(() => ({ id })), mock.deleteCategory);

// --- Admin ---
export const getAdminDashboard = apiCall(() => client.get('/admin/dashboard').then(r => r.data), mock.getAdminDashboard);
export const getAdminUsers = apiCall(() => client.get('/admin/users').then(r => r.data), mock.getAdminUsers);
export const getAdminInterviews = apiCall(() => client.get('/admin/interviews').then(r => r.data), mock.getAdminInterviews);
export const getAdminInterviewReport = apiCall((id) => client.get(`/admin/interviews/${id}/report`).then(r => r.data), mock.getAdminInterviewReport);

export default {
  loginUser, registerUser, loginAdmin, getUser, getProfile, updateProfile,
  getResume, uploadResume, getSessions, getSession, startInterview,
  submitAnswer, completeInterview, getReport, getCategories,
  createCategory, updateCategory, deleteCategory,
  getAdminDashboard, getAdminUsers, getAdminInterviews, getAdminInterviewReport
};
