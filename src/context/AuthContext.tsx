// src/context/AuthContext.tsx
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ActivityIndicator, View } from 'react-native';
import { deleteToken, getToken } from '../services/keychain';

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await getToken();
        if (token) {
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.error('AuthContext Error: Could not bootstrap app.', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = () => {
    setIsLoggedIn(true);
  };

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
