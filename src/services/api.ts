// src/services/api.ts
import { API_BASE_URL } from '@env';
import axios from 'axios';
import { Platform } from 'react-native'; // Import Platform
import { getToken } from './keychain';

// Base URL conditional based on platform
export const BASE_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : API_BASE_URL;

// 1. Gumawa ng Axios instance
const api = axios.create({
  baseURL: BASE_URL, 
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// 2. Gumawa ng Request Interceptor
// Ito ay isang special function na tatakbo BAGO ipadala ang bawat request.
api.interceptors.request.use(
  async (config) => {
    // Kunin ang token mula sa secure storage
    const token = await getToken();

    // Kung may token, ilagay ito sa 'Authorization' header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ibalik ang na-modify na config para maipagpatuloy ang request
    return config;
  },
  (error) => {
    // Kung may error sa pag-setup ng request, i-reject ito.
    return Promise.reject(error);
  },
);

// I-export ang na-configure na 'api' instance para magamit sa ibang parts ng app.
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
