import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
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
  
  // Gumamit ng StackNavigationProp para mas accurate ang typing
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Function para makuha ang initials mula sa pangalan
  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Function para isara ang modal bago mag-navigate (Prevents UI glitching)
  const handleNavigation = (screen: keyof RootStackParamList) => {
    setIsMenuVisible(false);
    setTimeout(() => {
      navigation.navigate(screen as any);
    }, 100);
  };

  return (
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

        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <Ionicons name="cart-outline" size={24} color="#334155" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setIsMenuVisible(true)}
            className="w-9 h-9 rounded-full bg-orange-500 items-center justify-center border-2 border-orange-200"
          >
            <Text className="text-white font-bold text-xs">
              {getInitials(user?.full_name)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal 
        visible={isMenuVisible} 
        transparent={true} 
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsMenuVisible(false)}>
          <View className="flex-1 bg-black/10" /> 
        </TouchableWithoutFeedback>

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
          <View className="flex-row items-center mb-4 border-b border-slate-50 pb-3">
            <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3 border border-slate-200">
              <Text className="text-slate-600 font-bold text-sm">
                {getInitials(user?.full_name)}
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

          <TouchableOpacity 
            className="flex-row items-center py-2.5 active:bg-slate-50 rounded-lg px-1"
            onPress={() => handleNavigation('Settings')}
          >
            <Ionicons name="person-outline" size={18} color="#64748b" />
            <Text className="ml-3 text-slate-700 font-medium text-sm">Manage Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center py-2.5 mt-1 active:bg-slate-50 rounded-lg px-1"
            onPress={() => handleNavigation('ChangePassword')}
          >
            <Ionicons name="key-outline" size={18} color="#64748b" />
            <Text className="ml-3 text-slate-700 font-medium text-sm">Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center py-2.5 mt-1 active:bg-red-50 rounded-lg px-1"
            onPress={() => {
              setIsMenuVisible(false);
              setTimeout(() => logout(), 100);
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