import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchCartItems } from '../services/cart';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartCount: number;
  refreshCartCount: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn } = useAuth();

  const refreshCartCount = useCallback(async () => {
    if (!isLoggedIn) {
      setCartCount(0);
      return;
    }
    
    setIsLoading(true);
    try {
      const items = await fetchCartItems();
      setCartCount(items.length);
    } catch (error) {
      console.error('Failed to refresh cart count:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount, isLoggedIn]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount, isLoading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
