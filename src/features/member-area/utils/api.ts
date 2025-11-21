/**
 * API Client Utility
 * Provides a configured axios instance for API calls
 */

import axios from 'axios';
import { supabase } from '../services/supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (!refreshError && data.session) {
        // Retry the original request with new token
        error.config.headers.Authorization = `Bearer ${data.session.access_token}`;
        return api.request(error.config);
      }
      
      // Refresh failed, redirect to login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
