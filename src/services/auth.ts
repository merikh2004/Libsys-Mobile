// src/services/auth.ts
import { isAxiosError } from 'axios';
import api from './api';
import { saveToken } from './keychain';

// Nag-define tayo ng itsura ng mga parameters para sa login function
interface LoginCredentials {
  identifier: string;
  password: string;
}

// Ito ang itsura ng inaasahan nating sagot mula sa API kapag successful
interface LoginSuccessResponse {
  // Pwede mong i-adjust ito base sa actual response ng iyong API
  // Halimbawa: user: { id: number, name: string }
  message: string;
  data: {
    access_token: string;
  };
}

// Ito ang magiging itsura ng return value ng ating function
interface LoginResult {
  success: boolean;
  error?: string; // Error message sa Tagalog
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

/**
 * Handles user login by calling the API.
 * @param credentials Ang username/identifier at password ng user.
 * @returns Isang object na nagsasabing success ba o hindi, kasama ang error message kung meron.
 */
export const loginUser = async (
  credentials: LoginCredentials,
): Promise<LoginResult> => {
  try {
    // Tawagin ang /api/login endpoint gamit ang 'api' instance na ginawa natin.
    const response = await api.post<LoginSuccessResponse>(
      '/api/login',
      credentials,
    );

    // Kunin ang access token mula sa response
    const accessToken = response.data.data.access_token;

    // Kung may nakuha tayong token...
    if (accessToken) {
      // ...i-save ito nang ligtas sa Keychain.
      await saveToken(accessToken);
      // At i-return na ito ay success.
      return { success: true };
    } else {
      // Kung walang token sa response kahit 200 ang status, ituring itong error.
      return { success: false, error: 'No access token received.' };
    }
  } catch (error) {
    // Dito papasok ang code kung may error sa API call (e.g., network issue, 401, 500)

    // Best Practice: Suriin kung ang error ay mula sa Axios
    if (isAxiosError(error)) {
      // Kung ang error ay 401 (Unauthorized), malamang mali ang password/username.
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Invalid username or password. Please try again.',
        };
      }
      // Para sa ibang server errors (like 500 Internal Server Error)
      return {
        success: false,
        error: `A server error occurred. (Status: ${
          error.response?.status || 'N/A'
        })`,
      };
    }

    // Para sa mga hindi inaasahang error (e.g., network down, etc.)
    return {
      success: false,
      error: 'Could not connect to the server. Please check your internet connection.',
    };
  }
};

/**
 * Handles password change by calling the API.
 * @param data Ang current password, new password, at confirmation ng user.
 * @returns Isang object na nagsasabing success ba o hindi, kasama ang message mula sa API.
 */
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
