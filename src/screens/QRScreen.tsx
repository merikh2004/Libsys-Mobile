import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native'; // FIX: Idinagdag ang useFocusEffect
import React, { useCallback, useState } from 'react'; // FIX: Idinagdag ang useCallback
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Header from '../components/Header';
import { useToast } from '../context/ToastContext';
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
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<CheckoutData | null>(null);

  // FIX: Pinalitan ng useFocusEffect para laging mag-update kapag binuksan ang QR Tab
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      let timeoutId: NodeJS.Timeout;

      // Ito ang function na kukuha ng ticket at mag-che-check kung na-scan na
      const checkTicketStatus = async () => {
        try {
          const ticketData = await fetchActiveTicket();
          if (!isMounted) return;

          if (ticketData && ticketData.transaction_code) {
            const currentStatus = (ticketData as any).status;
            
            // KUNG HINDI NA PENDING (Ibig sabihin, na-scan na ng librarian)
            if (currentStatus && currentStatus !== 'pending') {
              setActiveTicket(null); // I-clear ang QR at Books
              showToast('Ticket successfully scanned and processed!', 'success'); // I-notify ang user
            } else {
              // KUNG PENDING PA RIN: I-display ang ticket at i-check ulit after 3 seconds
              setActiveTicket(ticketData);
              timeoutId = setTimeout(checkTicketStatus, 3000);
            }
          } else {
            // KUNG WALA NANG DATA GALING SA SERVER (Nai-delete na or finished)
            setActiveTicket((prevTicket) => {
              if (prevTicket !== null) {
                // Kung may ticket kanina tapos biglang nawala, ibig sabihin na-process na!
                showToast('Ticket successfully scanned and processed!', 'success');
              }
              return null;
            });
          }
        } catch (error) {
          // Kung mahina internet, wag sumuko, check ulit after 3 seconds
          if (isMounted) timeoutId = setTimeout(checkTicketStatus, 3000);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };

      // FAST DISPLAY: Kung may ipinasa galing Cart Checkout, i-display agad para mabilis
      if (route.params?.ticket && route.params.ticket.transaction_code) {
        setActiveTicket(route.params.ticket);
        setIsLoading(false);
      } else if (!activeTicket) {
        setIsLoading(true);
      }

      // Simulan agad ang pag-check
      checkTicketStatus();

      // CLEANUP: Patayin ang timer kapag lumipat ng ibang tab ang user para tipid sa battery
      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
      };
    }, [route.params?.ticket])
  );

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

  // Fallbacks para hindi mag-crash kung may nawawalang details
  const studentNum = activeTicket?.user_details?.student_number || activeTicket?.student_number || 'N/A';
  const fullName = activeTicket?.user_details?.name || activeTicket?.full_name || 'N/A';
  
  let yearSectionCourse = 'N/A';
  if (activeTicket?.user_details) {
    const { year_level, section, course } = activeTicket.user_details;
    yearSectionCourse = `${year_level} - ${section} | ${course}`;
  } else if (activeTicket?.year) {
    yearSectionCourse = `${activeTicket.year} - ${activeTicket.section || ''} | ${activeTicket.course || ''}`;
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

        {/* QR Ticket Card */}
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-slate-100 items-center">
          <Text className="text-[#3E2723] font-bold text-lg mb-1">Your QR Ticket</Text>
          <Text className="text-slate-500 text-sm mb-6 text-center">Present this to the librarian</Text>

          <View className="w-full aspect-square bg-white border border-slate-200 rounded-2xl items-center justify-center p-8 mb-6 overflow-hidden">
            {!activeTicket?.transaction_code ? (
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
            <Text className="text-orange-600 font-bold text-lg">
              {activeTicket?.transaction_code ? activeTicket.transaction_code : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Ticket Details Card - Hides when null */}
        {activeTicket?.transaction_code && (
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-100">
            <Text className="text-[#3E2723] font-bold text-xl mb-1">Ticket Details</Text>
            <Text className="text-orange-800 text-sm mb-6">Information encoded in your QR ticket</Text>

            <View>
              <DetailRow label="ID Number:" value={studentNum} />
              <DetailRow label="Name:" value={fullName} />
              <DetailRow label="Program/Sec:" value={yearSectionCourse} />
              <DetailRow label="Expires at:" value={activeTicket.expires_at || 'N/A'} />
            </View>
          </View>
        )}

        {/* Checked Out Items & Books List - Hides when null */}
        {activeTicket?.transaction_code && activeTicket.books && activeTicket.books.length > 0 && (
          <View className="mb-6">
            <View className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="bg-orange-100 p-2 rounded-lg mr-3">
                  <Ionicons name="grid-outline" size={20} color="#EA580C" />
                </View>
                <View>
                  <Text className="text-orange-900 font-bold text-base">Checked Out Items</Text>
                  <Text className="text-orange-700 text-xs">Included in this QR ticket</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-orange-900 font-bold text-2xl">{activeTicket.books.length}</Text>
                <Text className="text-orange-700 text-xs">Total</Text>
              </View>
            </View>

            <View className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl overflow-hidden">
              <View className="flex-row items-center px-5 py-4 border-b border-[#bbf7d0] bg-white/50">
                <Ionicons name="book-outline" size={18} color="#166534" />
                <Text className="text-[#166534] font-bold text-base ml-2">Books List</Text>
              </View>

              {activeTicket.books.map((book, index) => (
                <View 
                  key={book.book_id || index} 
                  className={`p-5 flex-row items-start ${index !== activeTicket.books!.length - 1 ? 'border-b border-[#bbf7d0]' : ''}`}
                >
                  <View className="mt-1">
                    <Ionicons name="book-outline" size={24} color="#22c55e" />
                  </View>
                  <View className="flex-1 ml-4 pr-2">
                    <Text className="text-slate-800 font-bold text-base leading-5 mb-1">
                      {book.title}
                    </Text>
                    <Text className="text-slate-500 text-xs mb-3">
                      by {book.author || 'Unknown Author'}
                    </Text>
                    
                    <View className="flex-row flex-wrap gap-2">
                      <View className="bg-slate-100 px-2 py-1 rounded">
                        <Text className="text-slate-600 text-[10px] font-bold uppercase">
                          ACC: {book.accession_number || 'N/A'}
                        </Text>
                      </View>
                      <View className="bg-blue-50 px-2 py-1 rounded border border-blue-100">
                        <Text className="text-blue-600 text-[10px] font-bold uppercase">
                          CALL: {book.call_number || 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View className="bg-[#22c55e] w-7 h-7 rounded-full items-center justify-center">
                    <Text className="text-white font-bold text-xs">{index + 1}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="bg-[#EBF5FF] rounded-2xl p-6 border border-[#D1E9FF] mb-10">
          <Text className="text-[#3E2723] font-bold text-xl mb-4">How to use:</Text>
          <View className="space-y-3">
            <Text className="text-orange-800 text-sm font-medium leading-5">1. Show this QR code to the librarian</Text>
            <Text className="text-orange-800 text-sm font-medium leading-5">2. They will scan it to verify your identity</Text>
            <Text className="text-orange-800 text-sm font-medium leading-5">3. Proceed with book borrowing or return</Text>
            <Text className="text-orange-800 text-sm font-medium leading-5">4. Use cart checkout for specific book borrowing</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

export default QRScreen;