import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Header from '../components/Header';
import { useToast } from '../context/ToastContext';
import { Book, fetchBooks } from '../services/books';
import { addToCart } from '../services/cart';

const { width, height } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 64) / 2; // Adjusted for gap

// Helper components defined above to avoid hoisting issues with const
const InfoRow = ({ label, value, highlight = false }: { label: string; value: string | undefined; highlight?: boolean }) => (
  <View style={styles.infoRow}>
    <Text className="text-slate-500 text-xs flex-1">{label}</Text>
    <Text className={`text-xs flex-[1.5] text-right ${highlight ? 'text-orange-600 font-bold' : 'text-slate-800 font-medium'}`}>
      {value === 'na' || !value ? 'N/A' : value}
    </Text>
  </View>
);

const CustomDropdown = ({
  value,
  options,
  isVisible,
  onToggle,
  onSelect,
  icon
}: {
  value: string;
  options: string[];
  isVisible: boolean;
  onToggle: () => void;
  onSelect: (val: string) => void;
  icon: any;
}) => (
  <View className="mb-3 relative" style={{ zIndex: isVisible ? 1000 : 1 }}>
    <TouchableOpacity
      onPress={onToggle}
      className="flex-row items-center bg-orange-50 border border-orange-100 rounded-xl px-4 py-3"
    >
      <Ionicons name={icon} size={18} color="#94a3b8" />
      <Text className="flex-1 text-slate-700 ml-2">{value}</Text>
      <Ionicons name={isVisible ? "chevron-up" : "chevron-down"} size={18} color="#94a3b8" />
    </TouchableOpacity>

    {isVisible && (
      <View
        className="absolute top-[52px] left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-100 py-1 overflow-hidden"
        style={{ zIndex: 9999, elevation: 10 }}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            className={`px-4 py-3 ${value === option ? 'bg-orange-100' : 'active:bg-slate-50'}`}
            onPress={() => {
              onSelect(option);
              onToggle();
            }}
          >
            <Text className={`text-sm ${value === option ? 'text-orange-700 font-bold' : 'text-slate-600'}`}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>
);

const BooksScreen = () => {
  // State for data
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // State for filters
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState('Default Order');
  const [status, setStatus] = useState('All Status');
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  // State for modal
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  // State for dropdowns
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const { showToast } = useToast();

  // Simplified loadBooks - no more side effects inside
  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchBooks(page, LIMIT, search, orderBy, status);
      setBooks(result.books || []);
      setTotalBooks(result.total || 0);
      setTotalPages(result.lastPage || 0);
    } catch (err) {
      console.error('Error in loadBooks:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, orderBy, status]);

    const handleAddToCart = async () => {
      if (!selectedBook) return;
      
      setCartLoading(true);
      const result = await addToCart(selectedBook);
      setCartLoading(false);
  
              if (result.success) {
                const isWarning = result.message?.toLowerCase().includes('already') || 
                                  result.message?.toLowerCase().includes('exist') ||
                                  result.message?.toLowerCase().includes('limit');
                
                showToast(
                  result.message || `"${selectedBook.title}" added to cart!`, 
                  isWarning ? 'warning' : 'success'
                );
                toggleModal(false);
              } else {        showToast(result.message || 'Failed to add book to cart.', 'error');
      }
    };
  useEffect(() => {
    loadBooks();
  }, [page, search, orderBy, status]);

  const toggleModal = (show: boolean, book?: Book) => {
    if (show) {
      if (book) setSelectedBook(book);
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start(() => {
        setModalVisible(false);
        setSelectedBook(null);
      });
    }
  };

  const renderBookCard = (item: Book, index: number) => {
    if (!item) return null;

    const statusValue = (item.availability || '').trim().toLowerCase();
    const isAvailable = statusValue === 'available';

    return (
      <TouchableOpacity
        key={item.id || item.accession_number || index}
        className="bg-white rounded-2xl mb-4 shadow-sm border border-slate-100 overflow-hidden"
        style={{ width: COLUMN_WIDTH, zIndex: 1 }}
        onPress={() => toggleModal(true, item)}
      >
        <View className="h-40 bg-slate-50 items-center justify-center p-4">
          <Ionicons name="book-outline" size={60} color="#cbd5e1" />
          <View
            className={`absolute top-2 left-2 px-2 py-1 rounded-md ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}
          >
            <Text className="text-white text-[10px] font-bold">
              {(item.availability || 'Available').toUpperCase()}
            </Text>
          </View>
        </View>

        <View className="p-3">
          <Text className="text-slate-900 font-bold text-sm mb-1" numberOfLines={2}>
            {item.title}
          </Text>
          <Text className="text-slate-500 text-[10px] mb-2" numberOfLines={1}>
            by {item.author === 'na' ? 'N/A' : item.author}
          </Text>
          <Text className="text-orange-500 text-[10px] font-medium" numberOfLines={1}>
            {item.subject}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      let startPage = Math.max(1, page - 1);
      let endPage = Math.min(totalPages, startPage + 2);

      if (endPage - startPage < 2 && totalPages >= 3) {
        startPage = Math.max(1, endPage - 2);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
      <View className="flex-row justify-center items-center py-6 px-4 mb-10">
        <View className="bg-white rounded-full flex-row items-center px-6 py-3 shadow-sm border border-slate-100">
          <TouchableOpacity
            onPress={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex-row items-center mr-4"
          >
            <Ionicons name="chevron-back" size={18} color={page === 1 ? '#cbd5e1' : '#334155'} />
            <Text className={`ml-1 text-sm ${page === 1 ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>Previous</Text>
          </TouchableOpacity>

          <View className="flex-row items-center space-x-2">
            {pageNumbers.map((pageNum) => (
              <TouchableOpacity
                key={pageNum}
                onPress={() => setPage(pageNum)}
                style={[
                  styles.pageButton,
                  page === pageNum && styles.pageButtonActive
                ]}
              >
                <Text className={`text-sm ${page === pageNum ? 'text-white font-bold' : 'text-slate-600'}`}>
                  {pageNum}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex-row items-center ml-4"
          >
            <Text className={`mr-1 text-sm ${page === totalPages ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>Next</Text>
            <Ionicons name="chevron-forward" size={18} color={page === totalPages ? '#cbd5e1' : '#334155'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <ScrollView
        className="flex-1 bg-slate-50"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="px-6 pt-8">
          <Text className="text-3xl font-bold text-slate-900 mb-2">Book Catalog</Text>
          <Text className="text-slate-500 text-base mb-6">Search and browse available books in our library.</Text>

          {/* Search & Discover Box - Position Relative with high zIndex */}
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6" style={{ elevation: 10, zIndex: 1000 }}>
            <View className="flex-row items-center mb-6">
              <Ionicons name="search-outline" size={20} color="#f97316" />
              <Text className="text-slate-800 font-bold text-lg ml-3">Search & Discover</Text>
            </View>

            <Text className="text-slate-500 text-sm mb-4">Find exactly what you're looking for with our advanced search tools</Text>

            <View className="flex-row items-center bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-3">
              <Ionicons name="search-outline" size={18} color="#94a3b8" />
              <TextInput
                placeholder="Search"
                value={search}
                onChangeText={(text) => {
                  setSearch(text);
                  setPage(1);
                }}
                className="flex-1 ml-3 text-slate-700"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <CustomDropdown
              value={orderBy}
              options={['Default Order', 'Title (A-Z)', 'Title (Z-A)', 'Year (Oldest)', 'Year (Newest)']}
              isVisible={showOrderDropdown}
              onToggle={() => {
                setShowOrderDropdown(!showOrderDropdown);
                setShowStatusDropdown(false);
              }}
              onSelect={setOrderBy}
              icon="swap-vertical-outline"
            />

            <CustomDropdown
              value={status}
              options={['All Status', 'Available', 'Borrowed']}
              isVisible={showStatusDropdown}
              onToggle={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowOrderDropdown(false);
              }}
              onSelect={(val) => {
                setStatus(val);
                setPage(1);
              }}
              icon="checkmark-circle-outline"
            />
          </View>

          {/* Results Count */}
          {!loading && books.length > 0 && (
            <View className="flex-row justify-center items-center mb-6">
              <Text className="text-slate-400 font-medium">Results: </Text>
              <Text className="text-slate-900 font-bold">
                {(page - 1) * LIMIT + 1}-{Math.min(page * LIMIT, totalBooks)}
              </Text>
              <Text className="text-slate-400 font-medium"> of </Text>
              <Text className="text-slate-900 font-bold">{totalBooks}</Text>
            </View>
          )}

          {/* Book Cards Grid */}
          {loading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#f97316" />
              <Text className="text-slate-500 mt-4">Loading books...</Text>
            </View>
          ) : books.length > 0 ? (
            <View style={styles.gridContainer}>
              {books.map((book, index) => renderBookCard(book, index))}
            </View>
          ) : (
            <View className="py-20 items-center justify-center px-10">
              <Ionicons name="search-outline" size={64} color="#e2e8f0" />
              <Text className="text-slate-500 mt-4 text-center text-lg font-medium">No books found matching your criteria.</Text>
            </View>
          )}

          <Pagination />
        </View>
      </ScrollView>

      {/* Modal remains same */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => toggleModal(false)}
        animationType="none"
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
            <Pressable style={{ flex: 1 }} onPress={() => toggleModal(false)} />
          </Animated.View>

          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View className="bg-orange-500 p-8 pt-10 relative">
              <TouchableOpacity
                onPress={() => toggleModal(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>

              <Text className="text-white font-bold text-2xl mb-2 pr-10">
                {selectedBook?.title}
              </Text>
              <Text className="text-orange-50/80 text-base">
                by {selectedBook?.author === 'na' ? 'N/A' : selectedBook?.author}
              </Text>
            </View>

            <ScrollView className="flex-1 p-6 pb-24" showsVerticalScrollIndicator={false}>
              <View className="flex-row space-x-4 mb-8">
                <View className="flex-1 bg-orange-50/50 border border-orange-100 rounded-2xl p-5 mr-2">
                  <Text className="text-orange-500 text-[10px] font-bold mb-1 tracking-wider">STATUS</Text>
                  <Text className={`font-bold text-base ${(selectedBook?.availability || '').trim().toLowerCase() === 'available' ? 'text-green-600' : 'text-red-500'}`}>
                    {(selectedBook?.availability || 'UNKNOWN').toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1 bg-orange-50/50 border border-orange-100 rounded-2xl p-5">
                  <Text className="text-orange-500 text-[10px] font-bold mb-1 tracking-wider">CALL NUMBER</Text>
                  <Text className="text-slate-800 font-bold text-base">{selectedBook?.call_number || 'N/A'}</Text>
                </View>
              </View>

              <View className="bg-white border border-slate-100 rounded-3xl p-6 mb-8 shadow-sm">
                <Text className="text-slate-900 font-bold text-lg mb-5">Book Information</Text>

                <View className="space-y-3">
                  <InfoRow label="Accession Number" value={selectedBook?.accession_number} highlight />
                  <InfoRow label="ISBN" value={selectedBook?.book_isbn} />
                  <InfoRow label="Subject" value={selectedBook?.subject} />
                  <InfoRow label="Book Place" value={selectedBook?.book_place} />
                  <InfoRow label="Book Publisher" value={selectedBook?.book_publisher} />
                  <InfoRow label="Year" value={selectedBook?.year} />
                  <InfoRow label="Book Edition" value={selectedBook?.book_edition} />
                  <InfoRow label="Book Supplementary" value={selectedBook?.book_supplementary} />
                </View>
              </View>

              <View className="bg-orange-50/30 border border-orange-100/50 rounded-3xl p-6 mb-32">
                <Text className="text-orange-900 font-bold text-lg mb-3">Description</Text>
                <Text className="text-slate-600 text-sm leading-6">
                  {selectedBook?.description === 'NA' || !selectedBook?.description
                    ? 'No description available for this book.'
                    : selectedBook?.description}
                </Text>
              </View>
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 p-8 bg-white border-t border-slate-50">
              <TouchableOpacity
                onPress={handleAddToCart}
                disabled={cartLoading || (selectedBook?.availability || '').trim().toLowerCase() !== 'available'}
                className={`${(selectedBook?.availability || '').trim().toLowerCase() === 'available' ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-slate-300'} rounded-2xl py-5 flex-row items-center justify-center shadow-lg`}
              >
                {cartLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="cart-outline" size={24} color="white" />
                    <Text className="text-white font-bold text-lg ml-3">Add to Cart</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    zIndex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageButtonActive: {
    backgroundColor: '#ea580c',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    height: '85%',
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  }
});

export default BooksScreen;
