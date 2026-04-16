import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000' 
});
// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Session expired or invalid token → force logout
    if (err.response?.status === 401) {
      const message = err.response?.data?.message || '';
      const isAuthRoute =
        err.config?.url?.includes('/auth/login') ||
        err.config?.url?.includes('/auth/register');

      // Only auto-redirect on protected routes, not login/register
      if (!isAuthRoute) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;