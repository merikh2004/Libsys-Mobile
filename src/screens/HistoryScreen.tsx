import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View
} from 'react-native';
import Header from '../components/Header';
import {
  BorrowingRecord,
  fetchBorrowingHistory,
  fetchHistorySummary,
  HistorySummary,
} from '../services/history';

const HistoryScreen = () => {
  const [summary, setSummary] = useState<HistorySummary>({
    total_borrowed: 0,
    currently_borrowed: 0,
    overdue: 0,
    returned: 0,
  });
  const [records, setRecords] = useState<BorrowingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [summaryData, recordsData] = await Promise.all([
        fetchHistorySummary(),
        fetchBorrowingHistory(),
      ]);
      setSummary(summaryData);
      setRecords(recordsData);
    } catch (error) {
      console.error('Failed to load history data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const SummaryCard = ({
    title,
    count,
    label,
    icon,
    colorHex,
    borderColorClass,
    textClass,
  }: {
    title: string;
    count: number;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    colorHex: string;
    borderColorClass: string;
    textClass: string;
  }) => (
    <View className={`bg-white rounded-2xl p-5 mb-4 border-l-4 ${borderColorClass} shadow-sm border border-slate-100 flex-row justify-between items-start`}>
      <View>
        <Text className="text-slate-500 font-medium mb-1">{title}</Text>
        <Text className={`text-4xl font-bold mb-1 ${textClass}`}>{count}</Text>
        <Text className="text-slate-400 text-sm">{label}</Text>
      </View>
      <Ionicons name={icon} size={24} color={colorHex} />
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <Header />
      <ScrollView
        className="flex-1 px-3 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#EA580C" />
        }
      >
        {/* Page Title Section */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-slate-900 mb-2">My Borrowing History</Text>
          <Text className="text-slate-500 text-base">
            Complete record of your library borrowing activity with detailed information.
          </Text>
        </View>

        {isLoading && !isRefreshing ? (
          <View className="py-20">
            <ActivityIndicator size="large" color="#EA580C" />
          </View>
        ) : (
          <>
            {/* Summary Cards Vertical List */}
            <View className="mb-8">
              <SummaryCard
                title="Total Borrowed"
                count={summary.total_borrowed}
                label="All time"
                icon="library-outline"
                colorHex="#F97316"
                borderColorClass="border-orange-500"
                textClass="text-slate-900"
              />
              <SummaryCard
                title="Currently Borrowed"
                count={summary.currently_borrowed}
                label="Active books"
                icon="eye-outline"
                colorHex="#22C55E"
                borderColorClass="border-green-500"
                textClass="text-slate-900"
              />
              <SummaryCard
                title="Overdue"
                count={summary.overdue}
                label="Need attention"
                icon="alert-circle-outline"
                colorHex="#EF4444"
                borderColorClass="border-red-500"
                textClass="text-red-600"
              />
              <SummaryCard
                title="Returned"
                count={summary.returned}
                label="Completed"
                icon="checkmark-circle-outline"
                colorHex="#EAB308"
                borderColorClass="border-yellow-500"
                textClass="text-slate-900"
              />
            </View>

            {/* Borrowing Records Section */}
            <View className="bg-white rounded-2xl p-6 mb-10 shadow-sm border border-slate-100">
              <Text className="text-xl font-bold text-slate-900 mb-1">Borrowing Records</Text>
              <Text className="text-slate-500 text-sm mb-6">
                Complete history of your book borrowings
              </Text>

              {records.length === 0 ? (
                <View className="py-10 items-center justify-center border-t border-slate-50 pt-10">
                  <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
                  <Text className="text-slate-500 mt-4 text-center font-medium text-base">
                    No borrowing records found.
                  </Text>
                </View>
              ) : (
                <View>
                  <Text className="text-slate-400 text-center italic py-10">Record list placeholder</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default HistoryScreen;
