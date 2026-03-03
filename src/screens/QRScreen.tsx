import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Header from '../components/Header';
import { MainTabParamList } from '../navigation/types';
import { CheckoutData, fetchActiveTicket } from '../services/cart';

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row justify-between mb-3">
    <Text className="text-orange-800 font-bold flex-1">{label}</Text>
    <Text className="text-slate-600 flex-1 text-right">{value}</Text>
  </View>
);

const QRScreen = () => {
  const route = useRoute<RouteProp<MainTabParamList, 'QR'>>();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<CheckoutData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Priority 1: Check if ticket was passed as a route param
      if (route.params?.ticket) {
        setActiveTicket(route.params.ticket);
        setIsLoading(false);
        return;
      }

      // Priority 2: Fetch active ticket if none passed or needed refresh
      try {
        const ticketData = await fetchActiveTicket();
        if (ticketData) {
          setActiveTicket(ticketData);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [route.params?.ticket]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50">
        <Header />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <Header />
      <ScrollView 
        className="flex-1 px-6 pt-7"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <Text className="text-3xl font-bold text-[#3E2723] mb-1">QR Borrowing Ticket</Text>
          <Text className="text-slate-500 text-sm">
            Your QR code for book borrowing and library access.
          </Text>
        </View>

        {/* Your QR Ticket Card */}
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-slate-100 items-center">
          <Text className="text-[#3E2723] font-bold text-lg mb-1">Your QR Ticket</Text>
          <Text className="text-slate-500 text-sm mb-6 text-center">Present this to the librarian</Text>

          {/* QR Code Container */}
          <View className="w-full aspect-square bg-white border border-slate-200 rounded-2xl items-center justify-center p-8 mb-6 overflow-hidden">
            {!activeTicket ? (
              <View className="flex-row items-center justify-center px-4">
                <Ionicons name="information-circle-outline" size={40} color="#94a3b8" />
                <View className="ml-3">
                  <Text className="text-slate-400 font-bold text-xl leading-6">No active</Text>
                  <Text className="text-slate-400 font-bold text-xl leading-6">borrowing ticket.</Text>
                </View>
              </View>
            ) : (
              <QRCode
                value={activeTicket.transaction_code}
                size={220}
                color="#3E2723"
                backgroundColor="white"
              />
            )}
          </View>

          <View className="w-full h-[1.5px] bg-slate-100 mb-4" />
          
          <View className="flex-row items-center">
            <Text className="text-[#3E2723] font-bold text-lg mr-2">Ticket Code:</Text>
            <Text className="text-orange-600 font-bold text-lg">{activeTicket ? activeTicket.transaction_code : 'N/A'}</Text>
          </View>
        </View>

        {/* Ticket Details Card */}
        <View className="bg-white rounded-2xl p-6 mb-10 shadow-sm border border-slate-100">
          <Text className="text-[#3E2723] font-bold text-xl mb-1">Ticket Details</Text>
          <Text className="text-orange-800 text-sm mb-6">Information encoded in your QR ticket</Text>

          <View className="mb-6">
            <DetailRow label="Student Number:" value={activeTicket?.student_number || 'N/A'} />
            <DetailRow label="Name:" value={activeTicket?.full_name || 'N/A'} />
            <DetailRow label="Year & Section:" value={activeTicket?.year ? `${activeTicket.year} - ${activeTicket.section || ''}` : 'N/A'} />
            <DetailRow label="Course:" value={activeTicket?.course || 'N/A'} />
            <DetailRow label="Expires at:" value={activeTicket?.expires_at || 'N/A'} />
          </View>


          {/* How to use section */}
          <View className="bg-[#EBF5FF] rounded-2xl p-6 border border-[#D1E9FF]">
            <Text className="text-[#3E2723] font-bold text-xl mb-4">How to use:</Text>
            <View className="space-y-3">
              <Text className="text-orange-800 text-sm font-medium leading-5">1. Show this QR code to the librarian</Text>
              <Text className="text-orange-800 text-sm font-medium leading-5">2. They will scan it to verify your identity</Text>
              <Text className="text-orange-800 text-sm font-medium leading-5">3. Proceed with book borrowing or return</Text>
              <Text className="text-orange-800 text-sm font-medium leading-5">4. Use cart checkout for specific book borrowing</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default QRScreen;
