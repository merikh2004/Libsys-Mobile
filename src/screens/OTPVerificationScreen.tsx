import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
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
import { useToast } from '../context/ToastContext';
import { AuthStackParamList } from '../navigation/types';
import { forgotPassword, verifyOtp } from '../services/auth';

type OTPVerificationScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'OTPVerification'>;
type OTPVerificationScreenRouteProp = RouteProp<AuthStackParamList, 'OTPVerification'>;

const OTPVerificationScreen = () => {
  const navigation = useNavigation<OTPVerificationScreenNavigationProp>();
  const route = useRoute<OTPVerificationScreenRouteProp>();
  const { showToast } = useToast();

  const { username, email } = route.params;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');

    if (otpString.length < 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await verifyOtp(email, otpString);

      if (result.success) {
        showToast('OTP verified successfully!', 'success');
        
        navigation.replace('ResetPassword', {
          username: username || '',
          email: email || '',
          reset_token: result.reset_token ? String(result.reset_token) : otpString
        });
      } else {
        setError(result.error || result.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
       console.error("Verify OTP Error:", err);
       setError('Something went wrong verifying the OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);

    try {
      const result = await forgotPassword(username);

      if (result.success) {
        setTimer(59);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']); 
        inputRefs.current[0]?.focus();
        showToast(result.message || 'A new OTP has been sent to your email.', 'success');
      } else {
        showToast(result.error || 'Failed to resend OTP.', 'error');
      }
    } catch (err) {
      showToast('Something went wrong while resending OTP.', 'error');
    } finally {
      setIsResending(false);
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
            <Text className="text-[28px] font-bold text-[#1e293b] text-center mb-2">
              Verify OTP
            </Text>
            <Text className="text-slate-500 text-sm text-center mb-6">
              We sent a 6-digit verification code to your email
            </Text>

            <View className="bg-orange-50 border border-orange-200 rounded-xl p-4 w-full mb-6">
              <Text className="text-orange-900 font-bold text-sm mb-1">
                OTP sent to your email.
              </Text>
              <Text className="text-orange-700 text-xs">
                Check Spam/Promotions folder if you don't see it.
              </Text>
            </View>

            <View className="flex-row justify-between w-full mb-4">
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  className={`w-12 h-14 bg-[#f8fafc] border ${digit ? 'border-[#fa7b36]' : 'border-orange-100'} rounded-xl text-center text-2xl font-bold text-slate-800`}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  autoCapitalize="none"
                />
              ))}
            </View>

            {error && (
              <View className="w-full mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                <Text className="text-red-500 text-sm text-center font-medium">{error}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleVerifyOtp}
              disabled={isLoading || otp.join('').length < 6}
              className={`w-full py-4 rounded-2xl items-center mt-2 mb-6 ${isLoading || otp.join('').length < 6 ? 'bg-orange-300' : 'bg-[#EA580C]'}`}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-lg">Verify Code</Text>
              )}
            </TouchableOpacity>

            <View className="items-center w-full space-y-4">
              <View className="flex-row items-center mb-4">
                <Text className="text-slate-400 font-medium text-sm">Didn't receive a code? </Text>
                {isResending ? (
                  <ActivityIndicator size="small" color="#EA580C" />
                ) : canResend ? (
                  <TouchableOpacity onPress={handleResend}>
                    <Text className="text-[#EA580C] font-bold text-sm">Resend</Text>
                  </TouchableOpacity>
                ) : (
                  <Text className="text-slate-500 font-bold text-sm">Resend in {timer}s</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text className="text-slate-500 font-bold text-sm">Change username</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default OTPVerificationScreen;