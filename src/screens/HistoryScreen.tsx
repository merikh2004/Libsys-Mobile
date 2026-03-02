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

const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = 'bg-slate-100';
  let textColor = 'text-slate-600';

  if (status === 'Borrowed') {
    bgColor = 'bg-orange-100';
    textColor = 'text-orange-600';
  } else if (status === 'Returned') {
    bgColor = 'bg-green-100';
    textColor = 'text-green-600';
  } else if (status === 'Overdue') {
    bgColor = 'bg-red-100';
    textColor = 'text-red-600';
  }

  return (
    <View className={`${bgColor} px-3 py-1 rounded-full`}>
      <Text className={`${textColor} text-[10px] font-bold uppercase`}>{status}</Text>
    </View>
  );
};

const RecordCard = ({ record }: { record: BorrowingRecord }) => (
  <View className="bg-white border border-slate-100 rounded-xl p-4 mb-4 shadow-sm">
    <View className="flex-row justify-between items-start mb-3">
      <View className="flex-1 mr-2">
        <Text className="text-slate-900 font-bold text-base mb-1">{record.book_title}</Text>
        <Text className="text-slate-500 text-xs">by {record.book_author || 'N/A'}</Text>
      </View>
      <StatusBadge status={record.status} />
    </View>

    <View className="border-t border-slate-50 pt-3 flex-row justify-between">
      <View>
        <Text className="text-slate-400 text-[10px] uppercase font-semibold mb-1">Borrowed Date</Text>
        <Text className="text-slate-700 text-xs">
          {new Date(record.borrow_date).toLocaleDateString()}
        </Text>
      </View>
      <View>
        <Text className="text-slate-400 text-[10px] uppercase font-semibold mb-1">Due Date</Text>
        <Text className="text-slate-700 text-xs">
          {new Date(record.due_date).toLocaleDateString()}
        </Text>
      </View>
      {record.return_date && (
        <View>
          <Text className="text-slate-400 text-[10px] uppercase font-semibold mb-1">Returned Date</Text>
          <Text className="text-slate-700 text-xs">
            {new Date(record.return_date).toLocaleDateString()}
          </Text>
        </View>
      )}
    </View>
  </View>
);

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
        <View className="mb-8 px-3">
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
          <View className="px-3">
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
            <View className="mb-10">
              <Text className="text-xl font-bold text-slate-900 mb-1">Borrowing Records</Text>
              <Text className="text-slate-500 text-sm mb-6">
                Complete history of your book borrowings
              </Text>

              {records.length === 0 ? (
                <View className="bg-white rounded-2xl py-10 items-center justify-center border border-slate-100 shadow-sm">
                  <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
                  <Text className="text-slate-500 mt-4 text-center font-medium text-base">
                    No borrowing records found.
                  </Text>
                </View>
              ) : (
                <View>
                  {records.map((record) => (
                    <RecordCard key={record.id} record={record} />
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HistoryScreen;
