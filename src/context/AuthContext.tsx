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
import api, { BASE_URL } from '../services/api';

// 1. I-define ang itsura ng User data base sa actual API response
interface User {
  full_name: string;
  role: string;
  student_number: string;
  profile_picture: string | null;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function para kumpirmahin ang user details mula sa API
  const fetchUser = async () => {
    try {
      const response = await api.get('/api/me');
      // Mapping base sa resultme.png structure
      if (response.data && response.data.data) {
        const userData = response.data.data;
        
        // Siguraduhin natin na ang profile_picture ay may tamang URL prefix at host
        let profilePic = userData.profile_picture;
        if (profilePic) {
          if (profilePic.startsWith('http')) {
            // Kung ang backend ay nagbalik ng URL na may localhost/127.0.0.1, 
            // i-normalize natin ito gamit ang ating kasalukuyang BASE_URL
            profilePic = profilePic.replace(/http:\/\/(localhost|127\.0\.0\.1):8000/, BASE_URL);
          } else {
            // Kung relative path lang (e.g. /storage/...), dugtungan ng BASE_URL
            profilePic = `${BASE_URL}${profilePic.startsWith('/') ? '' : '/'}${profilePic}`;
          }
        }

        setUser({
          full_name: userData.full_name,
          role: userData.role,
          student_number: userData.profile_details?.student_number || 'N/A',
          profile_picture: profilePic || null,
        });
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      logout();
    }
  };

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

  // Kapag nagbago ang isLoggedIn, kunin ang user details
  useEffect(() => {
    if (isLoggedIn) {
      fetchUser();
    } else {
      setUser(null);
    }
  }, [isLoggedIn]);

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
      setUser(null);
    }
  };

  // Habang naglo-load pa (initial check), magpakita ng spinner
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#EA580C" />
      </View>
    );
  }

  // Ibigay ang state at functions sa mga "anak" na component
  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
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
