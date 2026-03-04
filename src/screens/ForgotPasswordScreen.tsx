import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
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
import { useToast } from '../context/ToastContext';
import { AuthStackParamList } from '../navigation/types';
import api from '../services/api';

type ForgotPasswordNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordNavigationProp>();
  const { showToast } = useToast(); 
  
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleContinue = async () => {
    if (!username) {
      showToast("Please enter your username.", "warning");
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await api.post('/api/forgotPassword', {
        identifier: username.trim()
      });
      
      if (response.data && response.data.success) {
        showToast(response.data.message || 'OTP sent successfully!', 'success');
        navigation.navigate('OTPVerification', { 
          username: username.trim(),
          email: response.data.email 
        });
      } else {
        showToast(response.data?.message || 'Failed to send reset link.', 'error');
      }
    } catch (error: any) {
      console.error('Forgot Password API Error:', error);
      showToast(
        error.response?.data?.message || 
        'An error occurred while sending the reset link. Please try again.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#FDFBF7] justify-center items-center p-6">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="w-full max-w-md"
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          
          {/* Main Card Container */}
          <View className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 items-center w-full">
            
            {/* Logo */}
            <Image 
              source={require('../assets/logo.png')} 
              style={{ width: 100, height: 100, marginBottom: 24 }}
              resizeMode="contain"
            />

            {/* Title & Subtitle */}
            <Text className="text-[28px] font-bold text-[#1e293b] text-center mb-2">
              Reset your password
            </Text>
            <Text className="text-slate-500 text-base text-center mb-8">
              We'll send an OTP to your registered email
            </Text>

            {/* Input Section */}
            <View className="w-full mb-6">
              <Text className="text-[#334155] font-bold text-sm mb-2 ml-1">
                Username
              </Text>
              <TextInput
                placeholder="Enter your student number"
                placeholderTextColor="#94a3b8"
                value={username}
                onChangeText={setUsername}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoCapitalize="none"
                className={`w-full bg-[#f8fafc] px-4 py-4 rounded-2xl border ${
                  isFocused ? 'border-[#fa7b36]' : 'border-orange-100'
                } text-slate-800 text-base`}
              />
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              onPress={handleContinue}
              disabled={isLoading || !username}
              className={`w-full py-4 rounded-2xl items-center mb-6 ${
                isLoading || !username ? 'bg-orange-300' : 'bg-[#EA580C]'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-lg">Continue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-[#EA580C] font-bold text-base">
                Back to Login
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ForgotPasswordScreen;