import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

const LoginScreen = () => {
  return (
    <View className="flex-1 justify-center items-center bg-slate-100 p-6">
      <Text className="text-3xl font-bold text-blue-800 mb-8">
        LIBSYS Mobile
      </Text>

      <TextInput
        placeholder="Student ID"
        className="w-full bg-white p-4 rounded-xl border border-gray-300 mb-4"
      />

      <TouchableOpacity className="w-full bg-blue-600 p-4 rounded-xl items-center shadow-md">
        <Text className="text-white font-semibold text-lg">Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
