import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext'; // 1. I-import ang useAuth hook

// Import all the screens for the tabs
import DashboardScreen from '../screens/DashboardScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import BooksScreen from '../screens/BooksScreen';
import HistoryScreen from '../screens/HistoryScreen';
import QRScreen from '../screens/QRScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  // 2. Kunin ang user profile mula sa context
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Itatago natin ang default header ng bawat screen
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

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

          // Return the icon component
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#EA580C', // Orange color for the active tab
        tabBarInactiveTintColor: 'gray', // Gray for inactive tabs
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      
      {/* 
        3. CONDITIONAL RENDERING: 
        Ipakita lang ang Attendance tab kung ang user ay student.
      */}
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
