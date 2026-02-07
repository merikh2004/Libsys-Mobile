import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { useAuth } from "../context/AuthContext"; // 1. I-import ang useAuth hook
import DashboardScreen from "../screens/DashboardScreen";
import AuthNavigator from "./AuthNavigator";

const Stack = createStackNavigator();

const AppNavigator = () => {
  // 2. Kunin ang global state mula sa context
  const { isLoggedIn } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // MAIN FLOW: Kapag naka-login na
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
        ) : (
          // AUTH FLOW: Kapag kailangan pa mag-login
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
