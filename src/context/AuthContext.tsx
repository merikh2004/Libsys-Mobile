// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from 'react';
import { deleteToken, getToken } from '../services/keychain';
import { ActivityIndicator, View } from 'react-native';

// 1. I-define ang itsura ng ating context
interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

// 2. Gumawa ng Context na may default value
// Ang 'undefined' ay panimula lang, papalitan ito ng actual value ng Provider.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Gumawa ng Provider Component
// Ito ang component na ibabalot natin sa ating buong app.
export const AuthProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Para sa initial check

  // useEffect para i-check kung may token na naka-save sa simula
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Subukang kumuha ng token
        const token = await getToken();
        // Kung may token, i-set na naka-login ang user
        if (token) {
          setIsLoggedIn(true);
        }
      } catch (e) {
        // Kung magka-error (bihira mangyari), i-log ito
        console.error('AuthContext Error: Could not bootstrap app.', e);
      } finally {
        // Itigil ang loading state para maipakita na ang app
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Function para sa pag-login
  const login = () => {
    // Simpleng pag-set ng state. Ang pag-save ng token ay nasa LoginScreen/auth.ts pa rin.
    setIsLoggedIn(true);
  };

  // Function para sa pag-logout
  const logout = async () => {
    try {
      await deleteToken(); // Burahin ang token sa Keychain
    } catch (e) {
      console.error('AuthContext Error: Could not delete token.', e);
    } finally {
      setIsLoggedIn(false); // I-update ang state
    }
  };

  // Habang naglo-load pa (initial check), magpakita ng spinner
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Ibigay ang state at functions sa mga "anak" na component
  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Gumawa ng custom hook para madaling gamitin ang context
// Imbes na `useContext(AuthContext)` lagi, `useAuth()` na lang.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
