import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';

const Header = () => {
  const { logout, user } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Function para makuha ang initials mula sa pangalan
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    // Gumamit ng edges={['top']} para header lang ang may safe area
    <SafeAreaView className="bg-white z-50 shadow-sm" edges={['top']}>
      <View className="flex-row items-center justify-between p-4 border-b border-slate-200 bg-white">
        {/* Left Side: Logo and Title */}
        <View className="flex-row items-center">
          <Image
            source={require('../assets/logo.png')}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
          <Text className="text-lg font-bold text-slate-800 ml-2">
            UCC Library
          </Text>
        </View>

        {/* Right Side: Icons */}
        <View className="flex-row items-center space-x-5">
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <Ionicons name="cart-outline" size={24} color="#334155" />
          </TouchableOpacity>
          
          {/* Profile Avatar Button - Initials ONLY */}
          <TouchableOpacity 
            onPress={() => setIsMenuVisible(true)} // Binago to `true`
            className="w-9 h-9 rounded-full bg-orange-500 items-center justify-center border-2 border-orange-200"
          >
            <Text className="text-white font-bold text-xs">
              {user ? getInitials(user.full_name) : 'U'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* DITO ANG MAGIC FIX: Gumamit tayo ng Modal para hindi masira ang layout ng ibang screens */}
      <Modal 
        visible={isMenuVisible} 
        transparent={true} 
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        {/* Background Overlay na Clickable para magsara */}
        <TouchableWithoutFeedback onPress={() => setIsMenuVisible(false)}>
          <View className="flex-1 bg-transparent" />
        </TouchableWithoutFeedback>

        {/* Dropdown Menu Container */}
        <View 
          className="absolute top-[80px] right-4 bg-white rounded-2xl p-4 shadow-2xl border border-slate-100 z-50 w-[240px]"
          style={{ 
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
          }}
        >
          {/* User Info Header */}
          <View className="flex-row items-center mb-4 border-b border-slate-50 pb-3">
            <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3 border border-slate-200">
              <Text className="text-slate-600 font-bold text-sm">
                {user ? getInitials(user.full_name) : 'U'}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-bold text-sm" numberOfLines={1}>
                {user?.full_name || 'Loading...'}
              </Text>
              <Text className="text-slate-500 text-[10px]" numberOfLines={1}>
                {user?.student_number || '...'}
              </Text>
            </View>
          </View>

          {/* Menu Items */}
          <TouchableOpacity 
            className="flex-row items-center py-2.5 active:bg-slate-50 rounded-lg px-1"
            onPress={() => {
              setIsMenuVisible(false);
              navigation.navigate('Settings');
            }}
          >
            <Ionicons name="person-outline" size={18} color="#64748b" />
            <Text className="ml-3 text-slate-700 font-medium text-sm">Manage Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center py-2.5 mt-1 active:bg-slate-50 rounded-lg px-1"
            onPress={() => {
              setIsMenuVisible(false);
               navigation.navigate('ChangePassword');
            }}
          >
            <Ionicons name="key-outline" size={18} color="#64748b" />
            <Text className="ml-3 text-slate-700 font-medium text-sm">Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center py-2.5 mt-1 active:bg-red-50 rounded-lg px-1"
            onPress={() => {
              setIsMenuVisible(false);
              logout();
            }}
          >
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            <Text className="ml-3 text-red-500 font-medium text-sm">Logout</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Header;