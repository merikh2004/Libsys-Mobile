// src/services/keychain.ts
import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native'; // Import Platform

// Ang 'service' name ay parang unique ID para sa item na isasave natin sa Keychain.
const SERVICE_NAME = 'com.libsysmobile.auth';

/**
 * Ligtas na isave ang access token.
 * Kung Web, gagamitin ang localStorage. Kung Mobile, Keychain.
 * @param token Ang access token galing sa API.
 */
export const saveToken = async (token: string): Promise<void> => {
  if (Platform.OS === 'web') {
    // Para sa Web, gamitin ang localStorage
    localStorage.setItem(SERVICE_NAME, token);
    console.log('Web: Token successfully saved to localStorage.');
  } else {
    // Para sa Mobile (Android/iOS), gamitin ang Keychain
    try {
      await Keychain.setGenericPassword(SERVICE_NAME, token, {
        service: SERVICE_NAME,
      });
      console.log('Mobile: Token successfully saved to Keychain.');
    } catch (error) {
      console.error('Keychain Error: Could not save the token.', error);
      throw new Error('Failed to save authentication token.');
    }
  }
};

/**
 * Kunin ang access token.
 * Kung Web, kukunin sa localStorage. Kung Mobile, sa Keychain.
 * @returns Ang naka-save na token, o null kung walang nahanap.
 */
export const getToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    // Para sa Web, kunin mula sa localStorage
    return localStorage.getItem(SERVICE_NAME);
  } else {
    // Para sa Mobile (Android/iOS), kunin mula sa Keychain
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
  }
};

/**
 * Burahin ang access token.
 * Kung Web, buburahin sa localStorage. Kung Mobile, sa Keychain.
 */
export const deleteToken = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    // Para sa Web, burahin sa localStorage
    localStorage.removeItem(SERVICE_NAME);
    console.log('Web: Token successfully deleted from localStorage.');
  } else {
    // Para sa Mobile (Android/iOS), burahin sa Keychain
    try {
      await Keychain.resetGenericPassword({ service: SERVICE_NAME });
      console.log('Mobile: Token successfully deleted from Keychain.');
    } catch (error) {
      console.error('Keychain Error: Could not delete the token.', error);
      throw new Error('Failed to delete authentication token.');
    }
  }
};
