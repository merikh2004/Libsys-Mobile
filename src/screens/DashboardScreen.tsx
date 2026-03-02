import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import { DashboardBook, fetchDashboard } from '../services/api';

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  borderColor, 
  iconColor,
  textColor = "text-slate-900"
}: { 
  title: string; 
  value: string | number; 
  subtitle: string; 
  icon: any; 
  borderColor: string;
  iconColor: string;
  textColor?: string;
}) => (
  <View className={`bg-white rounded-2xl p-5 mb-4 shadow-sm border-l-4 ${borderColor} flex-row justify-between items-start`}>
    <View>
      <Text className="text-slate-500 font-medium mb-1">{title}</Text>
      <Text className={`text-4xl font-bold mb-1 ${textColor}`}>{value}</Text>
      <Text className="text-slate-400 text-sm">{subtitle}</Text>
    </View>
    <Ionicons name={icon} size={24} color={iconColor} />
  </View>
);

const ActionButton = ({ 
  title, 
  subtitle, 
  icon, 
  bgColor, 
  iconColor,
  onPress
}: { 
  title: string; 
  subtitle: string; 
  icon: any; 
  bgColor: string; 
  iconColor: string;
  onPress: () => void;
}) => (
  <TouchableOpacity 
    onPress={onPress}
    className={`${bgColor} p-4 rounded-xl mb-3 flex-row items-center border border-slate-100`}
    style={{ elevation: 1 }}
  >
    <View className="mr-4">
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <View>
      <Text className="text-orange-600 font-bold text-base">{title}</Text>
      <Text className="text-slate-500 text-xs">{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

const BorrowedBookCard = ({ book }: { book: DashboardBook }) => (
  <View className="bg-orange-50/40 rounded-xl p-4 mb-3 border border-orange-100/50 flex-row justify-between items-center">
    <View className="flex-1 mr-2">
      <Text className="text-slate-900 font-bold text-base mb-0.5" numberOfLines={1}>
        {book.title}
      </Text>
      <Text className="text-slate-500 text-xs mb-1" numberOfLines={1}>
        by {book.author || 'N/A'}
      </Text>
      <Text className="text-slate-400 text-[10px]">
        Due: {new Date(book.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </Text>
    </View>
    <View className="bg-orange-500 px-3 py-1.5 rounded-full">
      <Text className="text-white text-[10px] font-bold uppercase tracking-wider">{book.status}</Text>
    </View>
  </View>
);

const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const [summary, setSummary] = useState({
    books_borrowed: 0,
    days_visited: 0,
    overdue_books: 0
  });
  const [borrowedBooks, setBorrowedBooks] = useState<DashboardBook[]>([]);
  const [roleLabel, setRoleLabel] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const dashboardData = await fetchDashboard();

      if (dashboardData && dashboardData.summary) {
        setSummary(dashboardData.summary);
      }
      
      if (dashboardData && Array.isArray(dashboardData.currently_borrowed_books)) {
        setBorrowedBooks(dashboardData.currently_borrowed_books);
      } else {
        setBorrowedBooks([]);
      }

      if (dashboardData && dashboardData.role_label) {
        setRoleLabel(dashboardData.role_label);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <View className="flex-1 bg-slate-50">
      <Header />
      <ScrollView 
        className="flex-1 px-2 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />
        }
      >
        <View className="mb-8 px-3">
          <Text className="text-3xl font-bold text-slate-900 mb-2">{roleLabel}</Text>
          <Text className="text-slate-500 text-base">Here's your library overview for today.</Text>
        </View>

        {loading && !refreshing ? (
          <View className="py-20">
            <ActivityIndicator size="large" color="#f97316" />
          </View>
        ) : (
          <View className="px-3">
            {/* Stats Section */}
            <View className="mb-8">
              <StatCard 
                title="Books Borrowed"
                value={summary.books_borrowed}
                subtitle="Currently borrowed"
                icon="library-outline"
                borderColor="border-orange-500"
                iconColor="#f97316"
              />

              <StatCard 
                title="Days Visited"
                value={summary.days_visited}
                subtitle="This month"
                icon="calendar-outline"
                borderColor="border-green-500"
                iconColor="#22c55e"
              />

              <StatCard 
                title="Overdue Books"
                value={summary.overdue_books}
                subtitle="Need attention"
                icon="warning-outline"
                borderColor="border-red-500"
                iconColor="#ef4444"
                textColor="text-red-600"
              />
            </View>

            {/* Currently Borrowed Section */}
            <View className="bg-white rounded-2xl mb-8 shadow-sm border-t-4 border-orange-500 overflow-hidden">
              <View className="p-5">
                <Text className="text-xl font-bold text-slate-900 mb-1">Currently Borrowed</Text>
                <Text className="text-slate-500 mb-6">Books you need to return</Text>
                
                {borrowedBooks.length > 0 ? (
                  <View>
                    {borrowedBooks.slice(0, 3).map((book, index) => (
                      <BorrowedBookCard key={`${book.accession_number}-${index}`} book={book} />
                    ))}
                    
                    {borrowedBooks.length > 3 && (
                      <TouchableOpacity 
                        onPress={() => navigation.navigate('History')}
                        className="mt-2 py-2 items-center"
                      >
                        <Text className="text-orange-600 font-bold text-base">
                          View All ({borrowedBooks.length})
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <View className="items-center justify-center py-10">
                    <Ionicons name="book-outline" size={48} color="#94a3b8" />
                    <Text className="text-slate-500 mt-4 font-medium text-base">You have no borrowed books.</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Quick Actions Section */}
            <View className="bg-white rounded-2xl mb-10 shadow-sm border-t-4 border-green-500 overflow-hidden">
              <View className="p-5">
                <Text className="text-xl font-bold text-slate-900 mb-1">Quick Actions</Text>
                <Text className="text-slate-500 mb-6">Common tasks</Text>

                <ActionButton 
                  title="Search Books"
                  subtitle="Find books in our catalog"
                  icon="search-outline"
                  bgColor="bg-orange-50"
                  iconColor="#f97316"
                  onPress={() => navigation.navigate('Books')}
                />

                <ActionButton 
                  title="Generate QR Ticket"
                  subtitle="For borrowing books"
                  icon="qr-code-outline"
                  bgColor="bg-green-50"
                  iconColor="#22c55e"
                  onPress={() => navigation.navigate('QR')}
                />

                <ActionButton 
                  title="View History"
                  subtitle="Check your borrowing history"
                  icon="time-outline"
                  bgColor="bg-orange-50"
                  iconColor="#f97316"
                  onPress={() => navigation.navigate('History')}
                />

                <ActionButton 
                  title="My Attendance"
                  subtitle="Check your attendance history"
                  icon="person-outline"
                  bgColor="bg-green-50"
                  iconColor="#22c55e"
                  onPress={() => navigation.navigate('Attendance')}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;
