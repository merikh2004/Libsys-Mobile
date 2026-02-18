import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext'; // 1. I-import ang useAuth
import { loginUser } from '../services/auth';

const LoginScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Kunin ang login function mula sa context
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError('Please enter your username and password.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await loginUser({ identifier, password });

      if (result.success) {
        // 1. I-clear agad ang credentials sa state para mawala sa memory
        setIdentifier('');
        setPassword('');

        // 2. I-check kung Web ang gamit
        if (Platform.OS === 'web') {
          // 3. HARD REDIRECT: Ginagamit ang replace("/") para mag-force reload.
          // Dahil ang AuthContext ay nag-che-check ng token sa bootstrap (localStorage),
          // automatic na magiging logged in ang user pagka-reload nang hindi naiiwan
          // ang POST request sa Network tab logs.
          window.location.replace('/');
        } else {
          // Para sa Mobile, normal na context update lang
          login();
        }
      } else {
        setError(result.error || 'An unexpected error occurred.');
        setPassword('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F5F7F2] justify-center items-center">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center items-center w-full"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          showsVerticalScrollIndicator={false}
          className="w-full"
        >
          <View className="w-full p-6 shadow-xl shadow-slate-200/50">
            {/* Logo at Title */}
            <View className="items-center mb-8">
              <View className="w-16 h-16 items-center justify-center mb-8">
                <Image
                  source={require('../assets/logo.png')}
                  style={{ width: 100, height: 100 }}
                  resizeMode="contain"
                />
              </View>
              <Text className="text-xl font-bold text-slate-900 text-center mb-1">
                Library Management System
              </Text>
              <Text className="text-slate-500 text-xs text-center">
                Sign in to access your dashboard
              </Text>
            </View>

            {/* Form Section */}
            <View className="w-full">
              {/* Username Input */}
              <View className="mb-4">
                <View className="flex-row items-center mb-1.5 ml-1">
                  <Ionicons name="person-outline" size={14} color="#64748b" />
                  <Text className="text-slate-700 font-bold ml-1.5 text-xs tracking-wider">
                    Username
                  </Text>
                </View>
                <TextInput
                  placeholder="Enter your student number"
                  placeholderTextColor="#94a3b8"
                  value={identifier}
                  onChangeText={setIdentifier}
                  onFocus={() => setFocusedInput('user')}
                  onBlur={() => setFocusedInput(null)}
                  autoCapitalize="none"
                  className={`w-full bg-white px-4 py-3 rounded-xl border ${
                    focusedInput === 'user'
                      ? 'border-[#fa7b36] border-2'
                      : 'border-gray-200 border'
                  } text-slate-800 text-sm`}
                />
              </View>

              {/* Password Input */}
              <View>
                <View className="flex-row items-center mb-1.5 ml-1">
                  <Ionicons name="key-outline" size={14} color="#64748b" />
                  <Text className="text-slate-700 font-bold ml-1.5 text-xs tracking-wider">
                    Password
                  </Text>
                </View>
                <View className="relative">
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedInput('pass')}
                    onBlur={() => setFocusedInput(null)}
                    className={`w-full bg-white px-4 py-3 rounded-xl border ${
                      focusedInput === 'pass'
                        ? 'border-[#fa7b36] border-2'
                        : 'border-gray-200 border'
                    } text-slate-800 text-sm pr-12`}
                  />
                  <TouchableOpacity
                    className="absolute right-0 top-0 h-full w-12 items-center justify-center"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error Message Display */}
              {error && (
                <View className="mt-4 mb-2 bg-red-100 p-3 rounded-lg">
                  <Text className="text-red-600 text-center text-xs">
                    {error}
                  </Text>
                </View>
              )}

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                className={`w-full bg-[#EA580C] py-3.5 rounded-xl items-center shadow-md shadow-orange-200 mt-6 mb-4 ${
                  isLoading ? 'opacity-50' : 'active:bg-orange-700'
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-base">Login</Text>
                )}
              </TouchableOpacity>

              {/* Forgot Password */}
              <TouchableOpacity className="items-center py-2 active:opacity-60">
                <Text className="text-[#EA580C] font-medium text-sm">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;
