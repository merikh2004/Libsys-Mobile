import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
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
import { resetPassword } from '../services/auth';

type ResetPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ResetPassword'>;
type ResetPasswordScreenRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute<ResetPasswordScreenRouteProp>();
  const { showToast } = useToast();

  // FIX: ETO ANG PIPIGIL SA PAG-CRASH KAPAG NAG-RELOAD ANG EXPO
  const params = route.params || {};
  const email = params.email || '';
  const reset_token = params.reset_token || ''; // Kinuha natin yung token

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await resetPassword(email, reset_token, password, confirmPassword);

      if (result.success) {
        showToast(result.message || 'Password reset successfully!', 'success');

        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        setError(result.error || 'Failed to reset password.');
      }
    } catch (err) {
      setError('Something went wrong while resetting the password.');
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

          <View className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 items-center w-full">

            {/* Logo */}
            <Image
              source={require('../assets/logo.png')}
              style={{ width: 100, height: 100, marginBottom: 24 }}
              resizeMode="contain"
            />

            <Text className="text-[28px] font-bold text-[#1e293b] text-center mb-2">
              Create New Password
            </Text>
            <Text className="text-slate-500 text-sm text-center mb-8">
              Enter a new password below
            </Text>

            <View className="w-full">
              <View className="mb-4">
                <Text className="text-[#334155] font-bold text-sm mb-2 ml-1">
                  New Password
                </Text>
                <View className="relative">
                  <TextInput
                    placeholder=""
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedInput('pass')}
                    onBlur={() => setFocusedInput(null)}
                    autoCapitalize="none"
                    className={`w-full bg-[#f8fafc] px-4 py-4 rounded-2xl border ${focusedInput === 'pass' ? 'border-[#fa7b36]' : 'border-orange-100'} text-slate-800 text-base pr-12`}
                  />
                  <TouchableOpacity
                    className="absolute right-0 top-0 h-full w-12 items-center justify-center"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-[#334155] font-bold text-sm mb-2 ml-1">
                  Confirm Password
                </Text>
                <View className="relative">
                  <TextInput
                    placeholder=""
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setFocusedInput('confirmPass')}
                    onBlur={() => setFocusedInput(null)}
                    autoCapitalize="none"
                    className={`w-full bg-[#f8fafc] px-4 py-4 rounded-2xl border ${focusedInput === 'confirmPass' ? 'border-[#fa7b36]' : 'border-orange-100'} text-slate-800 text-base pr-12`}
                  />
                  <TouchableOpacity
                    className="absolute right-0 top-0 h-full w-12 items-center justify-center"
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {error && (
                <View className="mb-4 bg-red-50 p-3 rounded-xl border border-red-100">
                  <Text className="text-red-500 text-center text-sm font-medium">
                    {error}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={isLoading}
                className={`w-full py-4 rounded-2xl items-center mt-2 ${isLoading ? 'bg-orange-300' : 'bg-[#EA580C]'}`}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-lg">Change Password</Text>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ResetPasswordScreen;