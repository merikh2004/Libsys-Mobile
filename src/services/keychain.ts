import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SERVICE_NAME = 'libsys_auth_token';

export const saveToken = async (token: string): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.setItem(SERVICE_NAME, token);
    console.log('Web: Token successfully saved to localStorage.');
  } else {
    try {
      await SecureStore.setItemAsync(SERVICE_NAME, token);
      console.log('Mobile: Token successfully saved to SecureStore.');
    } catch (error) {
      console.error('SecureStore Error: Could not save the token.', error);
      throw new Error('Failed to save authentication token.');
    }
  }
};

export const getToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(SERVICE_NAME);
  } else {
    try {
      const token = await SecureStore.getItemAsync(SERVICE_NAME);
      return token;
    } catch (error) {
      console.error('SecureStore Error: Could not retrieve the token.', error);
      return null;
    }
  }
};

export const deleteToken = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(SERVICE_NAME);
    console.log('Web: Token successfully deleted from localStorage.');
  } else {
    try {
      await SecureStore.deleteItemAsync(SERVICE_NAME);
      console.log('Mobile: Token successfully deleted from SecureStore.');
    } catch (error) {
      console.error('SecureStore Error: Could not delete the token.', error);
      throw new Error('Failed to delete authentication token.');
    }
  }
};