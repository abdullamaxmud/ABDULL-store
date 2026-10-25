import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('abdull_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format error message consistently
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : error.message || 'Something went wrong. Please try again.';

    // If 401 Unauthorized occurs on protected routes (expired token), clear stored token
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('abdull_token')) {
        localStorage.removeItem('abdull_token');
        localStorage.removeItem('abdull_user');
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
