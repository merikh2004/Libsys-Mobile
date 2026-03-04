// src/services/auth.ts
import { isAxiosError } from 'axios';
import api from './api';
import { saveToken } from './keychain';

interface LoginCredentials {
  identifier: string;
  password: string;
}

interface LoginSuccessResponse {
  message: string;
  data: {
    access_token: string;
  };
}

interface LoginResult {
  success: boolean;
  error?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export const loginUser = async (
  credentials: LoginCredentials,
): Promise<LoginResult> => {
  try {
    const response = await api.post<LoginSuccessResponse>(
      '/api/login',
      credentials,
    );

    const accessToken = response.data.data.access_token;

    if (accessToken) {
      await saveToken(accessToken);
      return { success: true };
    } else {
      return { success: false, error: 'No access token received.' };
    }
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Invalid username or password. Please try again.',
        };
      }
      return {
        success: false,
        error: `A server error occurred. (Status: ${
          error.response?.status || 'N/A'
        })`,
      };
    }

    return {
      success: false,
      error: 'Could not connect to the server. Please check your internet connection.',
    };
  }
};

export const changePassword = async (
  data: ChangePasswordData,
): Promise<ChangePasswordResponse> => {
  try {
    const response = await api.post<ChangePasswordResponse>(
      '/api/changePassword',
      data,
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Failed to change password. Please try again.',
      };
    }
    return {
      success: false,
      message:
        'Could not connect to the server. Please check your internet connection.',
    };
  }
};

export interface GenericApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const forgotPassword = async (username: string): Promise<GenericApiResponse> => {
  try {
    const response = await api.post<GenericApiResponse>('/api/forgotPassword', { identifier: username });
    return { success: true, message: response.data.message };
  } catch (error) {
    if (isAxiosError(error)) {
      return { success: false, error: error.response?.data?.message || error.response?.data?.error || 'Failed to send OTP.' };
    }
    return { success: false, error: 'Could not connect to the server.' };
  }
};

export const verifyOtp = async (email: string, otp: string): Promise<any> => { 
  try {
    const response = await api.post('/api/verifyOtp', { email, otp });
    return { success: true, ...response.data };
  } catch (error) {
    if (isAxiosError(error)) {
      return { success: false, error: error.response?.data?.message || error.response?.data?.error || 'Invalid OTP.' };
    }
    return { success: false, error: 'Could not connect to the server.' };
  }
};

export const resetPassword = async (email: string, reset_token: string, password: string, password_confirmation: string): Promise<GenericApiResponse> => {
  try {
    const response = await api.post<GenericApiResponse>('/api/resetPassword', { 
      email, 
      reset_token,
      password, 
      password_confirmation 
    });
    return { success: true, message: response.data.message };
  } catch (error) {
    if (isAxiosError(error)) {
      return { success: false, error: error.response?.data?.message || error.response?.data?.error || 'Failed to reset password.' };
    }
    return { success: false, error: 'Could not connect to the server.' };
  }
};