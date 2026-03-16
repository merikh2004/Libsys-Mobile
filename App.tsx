import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import { ToastProvider } from "./src/context/ToastContext";
import AppNavigator from "./src/navigation/AppNavigator";
import "./src/styles/global.css";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}