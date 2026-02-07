// src/services/keychain.ts
import * as Keychain from 'react-native-keychain';

// Ang 'service' name ay parang unique ID para sa item na isasave natin sa Keychain.
const SERVICE_NAME = 'com.libsysmobile.auth';

/**
 * Ligtas na isave ang access token sa Keychain ng device.
 * @param token Ang access token galing sa API.
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    await Keychain.setGenericPassword(SERVICE_NAME, token, {
      service: SERVICE_NAME,
    });
    console.log('Token successfully saved.');
  } catch (error) {
    console.error('Keychain Error: Could not save the token.', error);
    // Mag-throw ng error para ma-handle ito ng calling function kung kailangan.
    throw new Error('Failed to save authentication token.');
  }
};

/**
 * Kunin ang access token mula sa Keychain.
 * @returns Ang naka-save na token, o null kung walang nahanap.
 */
export const getToken = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: SERVICE_NAME,
    });
    if (credentials) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error('Keychain Error: Could not retrieve the token.', error);
    return null;
  }
};

/**
 * Burahin ang access token mula sa Keychain (para sa logout).
 */
export const deleteToken = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({ service: SERVICE_NAME });
    console.log('Token successfully deleted.');
  } catch (error) {
    console.error('Keychain Error: Could not delete the token.', error);
    throw new Error('Failed to delete authentication token.');
  }
};
