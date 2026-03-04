import { CheckoutData } from '../services/cart';

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: { username?: string };
  OTPVerification: { username: string; email: string };
  ResetPassword: { username: string; email: string; reset_token: string }; 
};

export type MainTabParamList = {
  Home: undefined;
  Catalog: undefined;
  QR: { ticket?: CheckoutData }; 
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Cart: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  QR: { ticket?: CheckoutData }; 
};