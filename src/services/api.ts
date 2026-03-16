// src/services/api.ts
import { API_BASE_URL } from '@env';
import axios from 'axios';
import { Platform } from 'react-native'; // Import Platform
import { getToken } from './keychain';

// Base URL conditional based on platform
export const BASE_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL, 
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
  },
});
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
export default api;

export interface DashboardBook {
  title: string;
  author: string;
  due_date: string;
  status: string;
  accession_number: string;
}

export interface DashboardData {
  success: boolean;
  data: {
    summary: {
      books_borrowed: number;
      days_visited: number;
      overdue_books: number;
    };
    currently_borrowed_books: DashboardBook[];
    role_label: string;
  };
}

export const fetchDashboard = async (): Promise<DashboardData['data']> => {
  try {
    const response = await api.get<DashboardData>('/api/dashboard');
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Failed to fetch dashboard data');
  } catch (error) {
    console.warn('Using fallback dashboard data:', error);
    return {
      summary: {
        books_borrowed: 0,
        days_visited: 0,
        overdue_books: 0,
      },
      currently_borrowed_books: [],
      role_label: 'Dashboard',
    };
  }
};
