import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LoginScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  return (
    <View className="flex-1 bg-[#F5F7F2] justify-center items-center">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center items-center w-full"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          showsVerticalScrollIndicator={false}
          className="w-full"
        >
          {/* Card Container - Fixed Width for "App-like" feel */}
          <View className="bg-white w-[320px] rounded-[30px] p-6 shadow-xl shadow-slate-200/50">
            {/* Logo Section */}
            <View className="items-center mb-6">
              <View className="w-16 h-16 items-center justify-center mb-2">
                <Image
                  source={require("../assets/logo.png")} // Dito mo ilagay ang path
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
                  <Ionicons
                    name="person-outline"
                    size={14}
                    color="#64748b"
                    fontWeight="bold"
                  />
                  <Text className="text-slate-700 font-semibold ml-1.5 text-xs tracking-wider">
                    Username
                  </Text>
                </View>
                <TextInput
                  placeholder="Enter your student number"
                  placeholderTextColor="#94a3b8"
                  onFocus={() => setFocusedInput("user")}
                  onBlur={() => setFocusedInput(null)}
                  className={`w-full bg-white px-4 py-3 rounded-xl border ${
                    focusedInput === "user"
                      ? "border-[#fa7b36] border-2"
                      : "border-gray-200 border"
                  } text-slate-800 text-sm`}
                />
              </View>

              {/* Password Input */}
              <View className="mb-6">
                <View className="flex-row items-center mb-1.5 ml-1">
                  <Ionicons
                    name="key-outline"
                    size={14}
                    color="#64748b"
                    fontWeight="bold"
                  />
                  <Text className="text-slate-700 font-semibold ml-1.5 text-xs tracking-wider">
                    Password
                  </Text>
                </View>
                <View className="relative">
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedInput("pass")}
                    onBlur={() => setFocusedInput(null)}
                    className={`w-full bg-white px-4 py-3 rounded-xl border ${
                      focusedInput === "pass"
                        ? "border-[#fa7b36] border-2"
                        : "border-gray-200 border"
                    } text-slate-800 text-sm pr-12`}
                  />
                  <TouchableOpacity
                    className="absolute right-0 top-0 h-full w-12 items-center justify-center"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity className="w-full bg-[#EA580C] py-3.5 rounded-xl items-center shadow-md shadow-orange-200 mb-4 active:bg-orange-700">
                <Text className="text-white font-bold text-base">Login</Text>
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
