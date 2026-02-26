import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Platform, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import CartScreen from '../screens/CartScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isLoggedIn } = useAuth();

  return (
    // Magic fix para hindi sumabog ang scroll sa Web
    <View style={{ flex: 1, height: Platform.OS === 'web' ? '100vh' : '100%' }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: '#f1f5f9',
            },
            headerTitleStyle: {
              fontWeight: 'bold',
              color: '#1e293b',
            },
            // Nagpapasa ng exact boundaries sa mga Screens
            cardStyle: { flex: 1, backgroundColor: '#ffffff' },
          }}
        >
          {isLoggedIn ? (
            <>
              <Stack.Screen
                name="Main"
                component={MainTabNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Cart" 
                component={CartScreen} 
                options={{ title: 'My Cart' }} 
              />
              <Stack.Screen 
                name="Settings" 
                component={SettingsScreen} 
                options={{ title: 'Profile' }} 
              />
              <Stack.Screen 
                name="ChangePassword" 
                component={ChangePasswordScreen} 
                options={{ title: 'Change Password' }} 
              />
            </>
          ) : (
            <Stack.Screen
              name="Auth"
              component={AuthNavigator}
              options={{ headerShown: false }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

export default AppNavigator;