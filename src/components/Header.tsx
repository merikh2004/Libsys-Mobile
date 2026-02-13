import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { logout } = useAuth();

  return (
    <SafeAreaView className="bg-white">
      <View className="flex-row items-center justify-between p-4 border-b border-slate-200">
        {/* Left Side: Logo and Title */}
        <View className="flex-row items-center">
          <Image
            source={require('../assets/logo.png')}
            // Idinagdag natin ang style prop para sigurado
            style={{ width: 60, height: 60 }}
            className="w-10 h-10"
            resizeMode="contain"
          />
          <Text className="text-lg font-bold text-slate-800 ml-2">
            UCC Library
          </Text>
        </View>

        {/* Right Side: Icons */}
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity>
            <Ionicons name="cart-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity>
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
