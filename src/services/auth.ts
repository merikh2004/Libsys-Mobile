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
      return { success: false, error: 'Walang access token na natanggap.' };
    }
  } catch (error) {
    // Dito papasok ang code kung may error sa API call (e.g., network issue, 401, 500)

    // Best Practice: Suriin kung ang error ay mula sa Axios
    if (isAxiosError(error)) {
      // Kung ang error ay 401 (Unauthorized), malamang mali ang password/username.
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Mali ang iyong username o password. Pakisubukang muli.',
        };
      }
      // Para sa ibang server errors (like 500 Internal Server Error)
      return {
        success: false,
        error: `Nagkaroon ng problema sa server. (Status: ${
          error.response?.status || 'N/A'
        })`,
      };
    }

    // Para sa mga hindi inaasahang error (e.g., network down, etc.)
    return {
      success: false,
      error: 'Hindi makakonekta sa server. Pakisuri ang iyong internet.',
    };
  }
};
