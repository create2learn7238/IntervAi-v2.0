import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    const host = window.location.hostname;
    const backendHost = host.includes('frontend') ? host.replace('frontend', 'backend') : host;
    return `https://${backendHost}/api/v1`;
  }
  return '/api/v1';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach Authorization header from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('intervAi_token') || localStorage.getItem('interai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only redirect if 401 is NOT from the login request itself and not already redirecting
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('intervAi_token');
      localStorage.removeItem('intervAi_user');
      localStorage.removeItem('interai_token');
      localStorage.removeItem('interai_user');
      window.dispatchEvent(new Event('auth_unauthorized'));
    }
    
    // Handle 403 globally for suspended users
    if (err.response?.status === 403 && err.response?.data?.error?.toLowerCase().includes('suspended')) {
      localStorage.removeItem('intervAi_token');
      localStorage.removeItem('intervAi_user');
      localStorage.removeItem('interai_token');
      localStorage.removeItem('interai_user');
      window.dispatchEvent(new Event('auth_unauthorized'));
    }
    
    return Promise.reject(err);
  }
);

export default api;
