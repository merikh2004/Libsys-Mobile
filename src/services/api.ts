// src/services/api.ts
import { API_BASE_URL } from '@env';
import axios from 'axios';
import { Platform } from 'react-native'; // Import Platform
import { getToken } from './keychain';

// Base URL conditional based on platform
const BASE_URL = Platform.OS === 'web' ? 'http://localhost:8000' : API_BASE_URL;

// 1. Gumawa ng Axios instance
// Dito natin itatakda ang mga default configuration para sa lahat ng API calls.
const api = axios.create({
  baseURL: BASE_URL, // Gagamitin ang conditional BASE_URL
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
