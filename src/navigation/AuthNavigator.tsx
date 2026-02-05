// src/navigation/AuthNavigator.tsx
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import LoginScreen from "../screens/LoginScreen";

const AuthStack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      {/* Pwede mong idagdag dito ang Register screen sa susunod */}
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;
