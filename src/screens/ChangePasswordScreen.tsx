import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // FIX: Idinagdag ang SafeAreaView
import { useToast } from '../context/ToastContext';
import { changePassword } from '../services/auth';

const ChangePasswordScreen = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { showToast } = useToast();

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      showToast('Please fill in all fields.', 'error');
      setSuccess(null);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      showToast('New passwords do not match.', 'error');
      setSuccess(null);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      showToast('Password must be at least 6 characters long.', 'error');
      setSuccess(null);
      return;
    }

    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    try {
      const result = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      if (result.success) {
        showToast(result.message || 'Password updated successfully!', 'success');
        setSuccess(result.message || 'Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(result.message || 'Failed to update password.', 'error');
        setError(result.message || 'Failed to update password.');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      showToast('An unexpected error occurred.', 'error');
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordField = (
    label: string,
    value: string,
    onChange: (text: string) => void,
    show: boolean,
    setShow: (val: boolean) => void,
    placeholder: string
  ) => (
    <View className="mb-4">
      <Text className="text-slate-700 font-bold mb-1.5 text-sm">
        {label} <Text className="text-red-500">*</Text>
      </Text>
      <View className="relative">
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#f97316"
          secureTextEntry={!show}
          value={value}
          onChangeText={onChange}
          className="w-full bg-orange-50/30 px-4 py-3 rounded-lg border border-orange-200 focus:border-orange-500 text-orange-600 text-sm pr-12"
        />
        <TouchableOpacity
          className="absolute right-0 top-0 h-full w-12 items-center justify-center"
          onPress={() => setShow(!show)}
          focusable={false}
          // @ts-ignore
          tabIndex={-1}
        >
          <Ionicons
            name={show ? 'eye-off-outline' : 'eye-outline'}
            size={18}
            color="#94a3b8"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    // FIX: Binalot sa SafeAreaView para consistent
    <SafeAreaView style={{ flex: 1 }} className="bg-[#F9FBFA]" edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        enabled={Platform.OS !== 'web'} // FIX: I-disable ang KeyboardAvoidingView sa Web para iwas scroll lock
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 100, // FIX: Dinagdagan ang padding bottom para hindi matakpan
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Title Header */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-[#1E293B]">
              Change Password
            </Text>
            <Text className="text-slate-500 text-sm mt-1">
              Update your account password to keep your account secure.
            </Text>
          </View>

          {/* Form Card */}
          <View className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
            <Text className="text-xl font-bold text-[#1E293B]">Update Password</Text>
            <Text className="text-slate-500 text-[13px] mb-6 mt-1">
              Update your account password to keep your account secure.
            </Text>

            {renderPasswordField(
              'Current Password',
              currentPassword,
              setCurrentPassword,
              showCurrent,
              setShowCurrent,
              'Enter current password'
            )}

            {renderPasswordField(
              'New Password',
              newPassword,
              setNewPassword,
              showNew,
              setShowNew,
              'Enter new password'
            )}

            {renderPasswordField(
              'Confirm New Password',
              confirmPassword,
              setConfirmPassword,
              showConfirm,
              setShowConfirm,
              'Confirm new password'
            )}

            {/* Notifications */}
            {error && (
              <View className="mt-2 mb-4 bg-red-50 border border-red-100 p-3 rounded-lg">
                <Text className="text-red-600 text-xs font-medium text-center">{error}</Text>
              </View>
            )}

            {success && (
              <View className="mt-2 mb-4 bg-green-50 border border-green-100 p-3 rounded-lg">
                <Text className="text-green-600 text-xs font-medium text-center">{success}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={isLoading}
              className={`w-full bg-[#16A34A] py-3.5 rounded-lg items-center mt-2 ${
                isLoading ? 'opacity-70' : 'active:bg-green-700'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text className="text-white font-medium text-base">
                  Change Password
                </Text>
              )}
            </TouchableOpacity>

            {/* Security Info Box */}
            <View className="mt-10 bg-orange-50/40 border border-orange-100 rounded-2xl p-4">
              <Text className="text-orange-600 font-bold text-lg mb-4">
                Password Security
              </Text>
              
              <View className="flex-row">
                <View className="flex-1">
                  <Text className="text-orange-700 font-bold text-sm mb-2">Security Tips</Text>
                  {[
                    'At least 6 characters long',
                    'Mix of letters, numbers, and symbols',
                    'Avoid common words or phrases',
                    'Don\'t use personal information'
                  ].map((tip, i) => (
                    <View key={i} className="flex-row items-center mb-1.5">
                      <View className="w-1 h-1 rounded-full bg-orange-400 mr-2" />
                      <Text className="text-orange-600 text-[11px] leading-tight flex-1">{tip}</Text>
                    </View>
                  ))}
                </View>
                
                <View className="flex-1 ml-4">
                  <Text className="text-orange-700 font-bold text-sm mb-2">Security Reminders</Text>
                  {[
                    'Never share your password',
                    'Log out from public computers',
                    'Change password if compromised',
                    'Use different passwords'
                  ].map((rem, i) => (
                    <View key={i} className="flex-row items-center mb-1.5">
                      <View className="w-1 h-1 rounded-full bg-orange-400 mr-2" />
                      <Text className="text-orange-600 text-[11px] leading-tight flex-1">{rem}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;