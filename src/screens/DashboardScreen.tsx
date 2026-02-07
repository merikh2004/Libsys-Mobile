import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext"; // 1. I-import ang useAuth

const DashboardScreen = () => {
  // 2. Kunin ang logout function mula sa context
  const { logout } = useAuth();

  return (
    <ScrollView className="flex-1 bg-slate-50 p-6">
      {/* Header Section */}
      <View className="mt-8 mb-6 flex-row justify-between items-center">
        <View>
          <Text className="text-sm text-slate-500 font-medium">
            UCC Library System
          </Text>
          <Text className="text-3xl font-bold text-slate-900">Dashboard</Text>
        </View>
        {/* 3. Idagdag ang Logout Button */}
        <TouchableOpacity
          onPress={logout}
          className="bg-red-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-bold text-sm">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Welcome Card */}
      <View className="bg-blue-600 p-6 rounded-3xl shadow-lg mb-8">
        <Text className="text-white text-lg opacity-80">Mabuhay,</Text>
        <Text className="text-white text-2xl font-bold">Joshua Paul! 👋</Text>
        <View className="mt-4 bg-blue-500/30 p-3 rounded-xl">
          <Text className="text-white text-xs">
            Mayroon kang 2 aklat na dapat ibalik sa susunod na linggo.
          </Text>
        </View>
      </View>

      {/* Quick Actions (Buttons) */}
      <Text className="text-lg font-bold text-slate-800 mb-4">
        Quick Actions
      </Text>
      <View className="flex-row justify-between mb-8">
        <TouchableOpacity className="bg-white w-[48%] p-4 rounded-2xl shadow-sm items-center border border-slate-100">
          <Text className="text-blue-600 font-bold">Search Books</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-white w-[48%] p-4 rounded-2xl shadow-sm items-center border border-slate-100">
          <Text className="text-blue-600 font-bold">My Loans</Text>
        </TouchableOpacity>
      </View>

      {/* Placeholder para sa Recent Books */}
      <View className="bg-slate-200 h-40 rounded-3xl items-center justify-center border-2 border-dashed border-slate-300">
        <Text className="text-slate-500 italic">
          Coming Soon: Recent Books List
        </Text>
      </View>
    </ScrollView>
  );
};

export default DashboardScreen;
