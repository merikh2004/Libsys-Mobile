import React from 'react';
import { View, Text } from 'react-native';
import Header from '../components/Header';

const QRScreen = () => {
  return (
    <View className="flex-1 bg-slate-50">
      <Header />
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg">QR Screen</Text>
      </View>
    </View>
  );
};

export default QRScreen;
