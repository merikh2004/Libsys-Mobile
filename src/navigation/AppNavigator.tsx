import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useState } from "react";
import DashboardScreen from "../screens/DashboardScreen";
import AuthNavigator from "./AuthNavigator";

const Stack = createStackNavigator();

const AppNavigator = () => {
  // Samantala, manual muna nating i-set kung 'isLoggedIn'
  // Kapag naging 'true' ito, automatic lilipat sa Dashboard
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
