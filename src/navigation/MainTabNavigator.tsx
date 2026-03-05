import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import insets
import { useAuth } from '../context/AuthContext';

// Import all the screens for the tabs
import AttendanceScreen from '../screens/AttendanceScreen';
import BooksScreen from '../screens/BooksScreen';
import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import QRScreen from '../screens/QRScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets(); // Kukuha ng sukat ng navigation bar ng phone
  const isStudent = user?.role === 'student';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Attendance':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Books':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'History':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'QR':
              iconName = focused ? 'qr-code' : 'qr-code-outline';
              break;
            default:
              iconName = 'alert-circle';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#EA580C',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: insets.bottom > 0 ? 60 + insets.bottom : 65,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      {isStudent && (
        <Tab.Screen name="Attendance" component={AttendanceScreen} />
      )}
      
      <Tab.Screen name="Books" component={BooksScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="QR" component={QRScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;