import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Header from '../components/Header';
import {
  BorrowingRecord,
  fetchBorrowingHistoryData,
  HistorySummary,
  PaginationInfo,
} from '../services/history';

const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = 'bg-slate-100';
  let textColor = 'text-slate-600';

  const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : '';

  if (normalizedStatus === 'borrowed') {
    bgColor = 'bg-orange-100';
    textColor = 'text-orange-600';
  } else if (normalizedStatus === 'returned') {
    bgColor = 'bg-green-100';
    textColor = 'text-green-600';
  } else if (normalizedStatus === 'expired' || normalizedStatus === 'overdue') {
    bgColor = 'bg-red-100';
    textColor = 'text-red-600';
  }

  const displayStatus = typeof status === 'string' && status 
    ? status.charAt(0).toUpperCase() + status.slice(1) 
    : 'Unknown';

  return (
    <View className={`${bgColor} px-3 py-1 rounded-full`}>
      <Text className={`${textColor} text-xs font-semibold`}>{displayStatus}</Text>
    </View>
  );
};

const formatDate = (dateString: string) => {
  if (!dateString || typeof dateString !== 'string' || dateString.toLowerCase() === 'not yet returned' || dateString.toLowerCase() === 'not returned') {
    return 'Not returned';
  }
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  } catch {
    return dateString;
  }
};

const RecordCard = ({ record }: { record: BorrowingRecord }) => {
  const isReturned = record?.returned_at && 
    typeof record.returned_at === 'string' && 
    record.returned_at.toLowerCase() !== 'not yet returned' && 
    record.returned_at.toLowerCase() !== 'not returned';

  const isValidAuthor = record?.author && 
    record.author.toLowerCase() !== 'na' && 
    record.author.toLowerCase() !== 'n/a';

  return (
    <View className="bg-white border border-orange-100 rounded-2xl p-4 mb-4 shadow-sm">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 pr-3">
          <Text className="text-slate-900 font-bold text-lg leading-tight mb-1">{record?.title || 'No Title'}</Text>
          <Text className="text-slate-500 text-sm">
            {isValidAuthor ? `by ${record.author}` : 'Equipment / Item'}
          </Text>
        </View>
        <StatusBadge status={record?.status} />
      </View>

      <View>
        <View className="bg-orange-50 rounded-xl p-3 flex-row items-center mb-2">
          <View className="w-6 items-center mr-2">
             <Ionicons name="cube-outline" size={18} color="#EA580C" />
          </View>
          <View>
            <Text className="text-slate-600 text-sm font-medium">Borrowed</Text>
            <Text className="text-slate-900 font-bold">{formatDate(record?.borrowed_at)}</Text>
          </View>
        </View>

        <View className="bg-slate-50 rounded-xl p-3 flex-row items-center mb-2">
          <View className="w-6 items-center mr-2">
             <Ionicons name="calendar-outline" size={18} color="#64748b" />
          </View>
          <View>
            <Text className="text-slate-600 text-sm font-medium">Due Date</Text>
            <Text className="text-slate-900 font-bold">{formatDate(record?.due_date)}</Text>
          </View>
        </View>

        <View className={`${isReturned ? 'bg-green-50' : 'bg-slate-50'} rounded-xl p-3 flex-row items-center mb-2`}>
          <View className="w-6 items-center mr-2">
             <Ionicons name="checkmark-circle-outline" size={18} color={isReturned ? "#16a34a" : "#94a3b8"} />
          </View>
          <View>
            <Text className="text-slate-600 text-sm font-medium">Returned</Text>
            <Text className="text-slate-900 font-bold">{isReturned ? formatDate(record?.returned_at) : 'Not returned'}</Text>
          </View>
        </View>

        <View className="bg-slate-50 rounded-xl p-3 flex-row items-center">
          <View className="w-6 items-center mr-2">
             <Ionicons name="person-outline" size={18} color="#64748b" />
          </View>
          <View>
            <Text className="text-slate-600 text-sm font-medium">Librarian</Text>
            <Text className="text-slate-900 font-bold">{record?.librarian || 'N/A'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const Pagination = ({ currentPage, onNext, onPrev, hasMore, lastPage, onPageChange }: any) => {
  const pages = [];
  for (let i = 1; i <= lastPage; i++) {
    pages.push(i);
  }

  return (
    <View className="flex-row items-center justify-center py-4 mb-8 mt-2">
      <View className="bg-white border border-slate-200 rounded-full px-2 py-1.5 flex-row items-center shadow-sm">
        <TouchableOpacity
          onPress={onPrev}
          disabled={currentPage === 1}
          className="flex-row items-center px-3"
        >
          <Ionicons name="chevron-back" size={14} color={currentPage === 1 ? '#cbd5e1' : '#94a3b8'} />
          <Text className={`ml-2 text-sm ${currentPage === 1 ? 'text-slate-300' : 'text-slate-400 font-medium'}`}>Previous</Text>
        </TouchableOpacity>

        <View className="flex-row items-center mx-1">
          {pages.map((page) => (
            <TouchableOpacity
              key={page}
              onPress={() => onPageChange(page)}
              className={`w-8 h-8 rounded-full items-center justify-center ${page === currentPage ? 'bg-[#EA580C]' : ''}`}
            >
              <Text className={`text-sm font-bold ${page === currentPage ? 'text-white' : 'text-slate-600'}`}>
                {page}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={onNext}
          disabled={!hasMore}
          className="flex-row items-center px-3"
        >
          <Text className={`mr-2 text-sm ${!hasMore ? 'text-slate-300' : 'text-slate-500 font-medium'}`}>Next</Text>
          <Ionicons name="chevron-forward" size={14} color={!hasMore ? '#cbd5e1' : '#94a3b8'} />
        </TouchableOpacity>
      </View>
    </View>
  );
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
  <View className={`bg-white rounded-2xl p-5 mb-4 shadow-sm border-l-4 ${borderColorClass} flex-row justify-between items-start`}>
    <View>
      <Text className="text-slate-500 font-medium mb-1">{title}</Text>
      <Text className={`text-4xl font-bold mb-1 ${textClass}`}>{count || 0}</Text>
      <Text className="text-slate-400 text-sm">{label}</Text>
    </View>
    <Ionicons name={icon} size={24} color={colorHex} />
  </View>
);

const HistoryScreen = ({ navigation }: any) => {
  const [summary, setSummary] = useState<HistorySummary>({
    total_borrowed: 0,
    currently_borrowed: 0,
    overdue: 0,
    returned: 0,
  });
  const [records, setRecords] = useState<BorrowingRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async (page: number = 1, isRefresh: boolean = false) => {
    try {
      if (!isRefresh) setIsLoading(true);
      const response = await fetchBorrowingHistoryData(page);
      
      if (response && response.success) {
        if (response.statistics) setSummary(response.statistics);
        if (response.data) {
          // Filter out "expired" records and apply limit of 5
          const filtered = response.data.filter(
            r => r.status && r.status.toLowerCase() !== 'expired'
          );
          setRecords(filtered.slice(0, 5));
        } else {
          setRecords([]);
        }
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error('Failed to load history data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage]);

  const onRefresh = () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    loadData(1, true);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <Header navigation={navigation} />
      <ScrollView
        className="flex-1 px-2 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#EA580C" />
        }
      >
        <View className="mb-6 px-1">
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
          <View>
            <View className="mb-8">
              <SummaryCard
                title="Total Borrowed"
                count={summary?.total_borrowed}
                label="All time"
                icon="library-outline"
                colorHex="#EA580C"
                borderColorClass="border-orange-500"
                textClass="text-orange-600"
              />
              <SummaryCard
                title="Currently Borrowed"
                count={summary?.currently_borrowed}
                label="Active books"
                icon="eye-outline"
                colorHex="#16A34A"
                borderColorClass="border-green-500"
                textClass="text-green-600"
              />
              <SummaryCard
                title="Overdue"
                count={summary?.overdue}
                label="Need attention"
                icon="alert-circle-outline"
                colorHex="#DC2626"
                borderColorClass="border-red-500"
                textClass="text-red-600"
              />
              <SummaryCard
                title="Returned"
                count={summary?.returned}
                label="Completed"
                icon="checkmark-circle-outline"
                colorHex="#EAB308"
                borderColorClass="border-yellow-500"
                textClass="text-yellow-600"
              />
            </View>

            <View className="mb-4">
              <View className="flex-row items-center mb-1">
                <View className="mr-2">
                   <Ionicons name="calendar-outline" size={24} color="#EA580C" />
                </View>
                <Text className="text-xl font-bold text-slate-900 ml-2">Borrowing Records</Text>
              </View>
              <Text className="text-slate-500 text-sm mb-6 ml-8">
                Complete history of your book borrowings with detailed information
              </Text>

              {(!records || records.length === 0) ? (
                <View className="bg-white rounded-2xl py-10 items-center justify-center border border-slate-200 shadow-sm">
                  <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
                  <Text className="text-slate-500 mt-4 text-center font-medium text-base">
                    No borrowing records found.
                  </Text>
                </View>
              ) : (
                <View>
                  {records.map((record, index) => (
                    <RecordCard key={index} record={record} />
                  ))}
                  
                  {pagination && pagination.last_page > 1 && (
                    <Pagination 
                      currentPage={currentPage} 
                      onNext={() => setCurrentPage(p => p + 1)} 
                      onPrev={() => setCurrentPage(p => Math.max(1, p - 1))} 
                      hasMore={pagination.has_more}
                      lastPage={pagination.last_page}
                      onPageChange={(page: number) => setCurrentPage(page)}
                    />
                  )}
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
