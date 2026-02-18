import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import { format } from 'date-fns';
import Header from '../components/Header';
import { fetchAttendanceRecords, AttendanceRecord } from '../services/attendance';

const AttendanceScreen = () => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [method, setMethod] = useState('All Methods');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const methodOptions = [
    { label: 'All Methods', value: 'All Methods' },
    { label: 'QR', value: 'QR' },
    { label: 'Manual', value: 'Manual' },
  ];

  const loadAttendance = async () => {
    setLoading(true);
    const formattedDate = format(date, 'yyyy-MM-dd');
    let data = await fetchAttendanceRecords(formattedDate, method);
    
    // 1. Strict Date Filtering
    // Siguraduhin na ang record date (e.g., "Wed, Feb 18, 2026") ay tugma sa piniling date sa calendar.
    const selectedDateStr = format(date, 'EEE, MMM d, yyyy');
    data = data.filter(record => record.date === selectedDateStr);

    // 2. Case-Insensitive Method Filtering
    if (method !== 'All Methods') {
      data = data.filter(record => 
        record.method.toLowerCase() === method.toLowerCase()
      );
    }

    // 3. Sorting (Latest Time First)
    data.sort((a, b) => {
      const timeA = new Date(`2000/01/01 ${a.time}`).getTime();
      const timeB = new Date(`2000/01/01 ${b.time}`).getTime();
      return timeB - timeA;
    });

    setRecords(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAttendance();
  }, [date, method]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Helper para ma-format ang short day sa long day
  const getLongDay = (shortDay: string) => {
    const days: {[key: string]: string} = {
      'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday', 
      'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday'
    };
    return days[shortDay] || shortDay;
  };

  return (
    <View className="flex-1 bg-slate-50">
      <Header />
      <ScrollView 
        className="flex-1 px-6 pt-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8">
          <Text className="text-3xl font-bold text-slate-900 mb-2">My Attendance</Text>
          <Text className="text-slate-500 text-base">Track your library visits and check-in times.</Text>
        </View>

        {/* Filter Card */}
        <View className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-slate-100">
          <Text className="text-xl font-bold text-slate-900 mb-1">Attendance History</Text>
          <Text className="text-slate-500 text-sm mb-6">View your library check-ins by date</Text>
          
          {/* Select Date */}
          <View className="mb-6">
            <Text className="text-slate-700 font-bold mb-2">Select Date:</Text>
            <View className="relative">
              <TouchableOpacity 
                className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex-row justify-between items-center"
              >
                <Text className="text-slate-700 text-base">{format(date, 'MM/dd/yyyy')}</Text>
                <Ionicons name="calendar-outline" size={20} color="#334155" />
              </TouchableOpacity>
              
              {Platform.OS === 'web' ? (
                <input 
                  type="date" 
                  value={format(date, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    if (!isNaN(newDate.getTime())) {
                      setDate(newDate);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0,
                    width: '100%',
                    cursor: 'pointer'
                  }}
                />
              ) : (
                <TouchableOpacity 
                  onPress={() => setShowDatePicker(true)}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
              )}
            </View>
            
            {Platform.OS !== 'web' && showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
          </View>

          {/* Select Method */}
          <View className="mb-4">
            <Text className="text-slate-700 font-bold mb-2">Select Method:</Text>
            <Dropdown
              style={{
                backgroundColor: '#FFF7ED',
                borderColor: '#FFEDD5',
                borderWidth: 1,
                borderRadius: 12,
                padding: 12,
              }}
              placeholderStyle={{ color: '#64748b', fontSize: 16 }}
              selectedTextStyle={{ color: '#334155', fontSize: 16 }}
              data={methodOptions}
              labelField="label"
              valueField="value"
              placeholder="Select Method"
              value={method}
              onChange={item => setMethod(item.value)}
              renderRightIcon={() => (
                <Ionicons name="chevron-down-outline" size={20} color="#94a3b8" />
              )}
            />
          </View>

          {/* Records Display Section */}
          <View className="mt-6">
            {loading ? (
              <View className="py-10 items-center">
                <ActivityIndicator size="large" color="#EA580C" />
              </View>
            ) : records.length > 0 ? (
              <View>
                {records.map((record, index) => (
                  <View key={index} className={index !== 0 ? "border-t border-slate-100 pt-6 mt-6" : ""}>
                    <View className="flex-row justify-between mb-4">
                      <Text className="text-slate-500 font-medium">Date</Text>
                      <Text className="text-slate-900 font-bold text-lg text-right w-1/2">
                        {record.date}
                      </Text>
                    </View>
                    
                    <View className="flex-row justify-between mb-4">
                      <Text className="text-slate-500 font-medium">Day</Text>
                      <Text className="text-slate-500 text-lg">{getLongDay(record.day)}</Text>
                    </View>
                    
                    <View className="flex-row justify-between mb-4">
                      <Text className="text-slate-500 font-medium">Check-in Time</Text>
                      <Text className="text-slate-900 font-bold text-lg">{record.time}</Text>
                    </View>
                    
                    <View className="flex-row justify-between">
                      <Text className="text-slate-500 font-medium">Method</Text>
                      <Text className="text-slate-500 text-lg capitalize">{record.method}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center justify-center py-10">
                <Ionicons name="clipboard-outline" size={48} color="#94a3b8" />
                <Text className="text-slate-500 mt-4 text-center font-medium text-base px-10">
                  No attendance records found for the selected criteria.
                </Text>
              </View>
            )}
          </View>
        </View>
        <View className="h-10" />
      </ScrollView>
    </View>
  );
};

export default AttendanceScreen;
