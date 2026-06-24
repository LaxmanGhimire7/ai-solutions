import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const backendOrigin = baseURL.replace(/\/api\/?$/, '');
let warmupPromise;
let lastWarmupAt = 0;

const api = axios.create({
  baseURL,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const warmBackend = () => {
  const shouldRefresh = Date.now() - lastWarmupAt > 10 * 60 * 1000;

  if (!warmupPromise || (lastWarmupAt > 0 && shouldRefresh)) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 85000);

    warmupPromise = fetch(`${backendOrigin}/health`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Backend health check failed');
        }
        lastWarmupAt = Date.now();
        return response.json();
      })
      .catch((error) => {
        warmupPromise = undefined;
        throw error;
      })
      .finally(() => {
        window.clearTimeout(timeout);
      });
  }

  return warmupPromise;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ai_solutions_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(
        new Error('The server took too long to respond. Please try again in a moment.')
      );
    }

    if (!error.response) {
      return Promise.reject(
        new Error('Unable to reach the server. Please check your connection and try again.')
      );
    }

    return Promise.reject(error.response.data || error);
  }
);

export default api;
