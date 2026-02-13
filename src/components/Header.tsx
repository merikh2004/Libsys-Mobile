import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';

const Header = () => {
  const { logout } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView className="bg-white">
      <View className="flex-row items-center justify-between p-4 border-b border-slate-200">
        {/* Left Side: Logo and Title */}
        <View className="flex-row items-center">
          <Image
            source={require('../assets/logo.png')}
            style={{ width: 40, height: 40 }} // Adjusted for consistency
            resizeMode="contain"
          />
          <Text className="text-lg font-bold text-slate-800 ml-2">
            UCC Library
          </Text>
        </View>

        {/* Right Side: Icons */}
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <Ionicons name="cart-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout}>
            <Ionicons name="log-out-outline" size={26} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Header;
  