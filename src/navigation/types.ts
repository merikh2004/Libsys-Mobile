import { CheckoutData } from '../services/cart';

// If QR is inside your Main Tabs:
export type MainTabParamList = {
  Home: undefined;
  Catalog: undefined;
  QR: { ticket?: CheckoutData }; // <--- THIS IS CRITICAL
  Profile: undefined;
};

// If QR is a global Stack Screen (like Cart):
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Cart: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  QR: { ticket?: CheckoutData }; // <--- Add it here if it's a stack screen
};