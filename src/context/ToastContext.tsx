import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Animated, Text, View, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('success');
  const [visible, setVisible] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const showToast = useCallback((msg: string, toastType: ToastType = 'success') => {
    setMessage(msg);
    setType(toastType);
    setVisible(true);

    // Animation In
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 50, // Floating position
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after 3 seconds
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setVisible(false));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <Animated.View 
          style={[
            styles.toastContainer, 
            { 
              opacity: fadeAnim, 
              transform: [{ translateY: slideAnim }],
              backgroundColor: 
                type === 'success' ? '#059669' : 
                type === 'error' ? '#dc2626' : 
                type === 'warning' ? '#f97316' : '#2563eb',
              borderColor: 
                type === 'success' ? '#10b981' : 
                type === 'error' ? '#f87171' : 
                type === 'warning' ? '#fb923c' : '#60a5fa',
              borderWidth: 1,
            }
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons 
              name={
                type === 'success' ? 'checkmark-circle' : 
                type === 'error' ? 'alert-circle' : 
                type === 'warning' ? 'warning' : 'information-circle'
              } 
              size={24} 
              color="white" 
            />
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.toastTitle}>
              {type === 'success' ? 'Success' : 
               type === 'error' ? 'Error' : 
               type === 'warning' ? 'Notification' : 'Notification'}
            </Text>
            <Text style={styles.toastText}>{message}</Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 20,
    zIndex: 9999,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
  },
  toastTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toastText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    fontSize: 13,
    marginTop: 1,
  },
});
