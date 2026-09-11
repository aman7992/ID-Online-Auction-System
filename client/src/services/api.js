import axios from 'axios';

// Determine the API base URL:
// 1. Use VITE_API_URL if set (ensuring /api suffix)
// 2. Default to deployed Render backend in production
// 3. Fallback to '/api' in development (proxied by Vite to localhost:5000)
export const getApiBaseUrl = () => {
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl && envApiUrl.trim()) {
    const trimmed = envApiUrl.trim();
    return trimmed.endsWith('/api') ? trimmed : `${trimmed.replace(/\/+$/, '')}/api`;
  }
  if (import.meta.env.PROD) {
    return 'https://id-online-auction-system.onrender.com/api';
  }
  return '/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('id_auction_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized/blocked
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid
      if (localStorage.getItem('id_auction_token')) {
        localStorage.removeItem('id_auction_token');
        localStorage.removeItem('id_auction_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
