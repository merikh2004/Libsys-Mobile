import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CartItem,
  checkout,
  clearCart,
  fetchCartItems,
  removeFromCart,
} from '../services/cart';

// Separate Checkbox component to ensure clean interaction
const Checkbox = ({ checked, onPress }: { checked: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    className={`w-6 h-6 rounded border ${checked ? 'bg-orange-500 border-orange-500' : 'bg-white border-slate-300'
      } items-center justify-center`}
  >
    {checked && <Ionicons name="checkmark" size={16} color="white" />}
  </TouchableOpacity>
);

const CartScreen = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [selectedItemDetails, setSelectedItemDetails] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const items = await fetchCartItems();
      setCartItems(items || []);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const toggleSelect = (uniqueKey: string) => {
    setSelectedItems((prev) =>
      prev.includes(uniqueKey) ? prev.filter((key) => key !== uniqueKey) : [...prev, uniqueKey]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length && cartItems.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item, index) => `${item.id}-${index}`));
    }
  };

  const handleDelete = async (id: number, uniqueKey: string) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const success = await removeFromCart(id);
          if (success) {
            setCartItems((prev) => prev.filter((item) => item.id !== id));
            setSelectedItems((prev) => prev.filter((key) => key !== uniqueKey));
          } else {
            Alert.alert('Error', 'Failed to remove item. Please try again.');
          }
        },
      },
    ]);
  };

  const handleClearCart = async () => {
    Alert.alert('Clear Cart', 'Are you sure you want to clear your entire cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          const success = await clearCart();
          if (success) {
            setCartItems([]);
            setSelectedItems([]);
          } else {
            Alert.alert('Error', 'Failed to clear cart.');
          }
        },
      },
    ]);
  };

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please select at least one item to check out.');
      return;
    }

    Alert.alert('Check Out', `Confirm check out for ${selectedItems.length} items?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          const realIdsToCheckout = selectedItems.map(key => {
            const idPart = key.split('-')[0];
            return idPart === 'undefined' ? 0 : Number(idPart);
          });

          const success = await checkout(realIdsToCheckout);
          if (success) {
            Alert.alert('Success', 'Check out successful!');
            loadCart();
            setSelectedItems([]);
          } else {
            Alert.alert('Error', 'Failed to checkout.');
          }
        },
      },
    ]);
  };

  const openDetailModal = (details: any) => {
    setSelectedItemDetails(details);
    setIsModalVisible(true);
  };

  const selectedBooksCount = cartItems.filter((item, index) => {
    const uniqueKey = `${item.id}-${index}`;
    const isSelected = selectedItems.includes(uniqueKey);
    const details = item.item_details || (item as any).book || item;
    const isBook = item.type === 'book' || !!(item as any).book || !!details.author;
    return isSelected && isBook;
  }).length;

  const selectedEquipmentCount = selectedItems.length - selectedBooksCount;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#FDFBF7]" edges={['bottom', 'left', 'right']}>
      {/* FIX: Tinanggal ang extra View na may height: '100%' na sumisira sa layout */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} // FIX: Padding bottom para hindi matakpan ng tabs
        showsVerticalScrollIndicator={false}
      >
        <View className="p-6">
          {/* Header */}
          <View className="mb-2">
            <Text className="text-3xl font-bold text-[#3E2723]">My Cart</Text>
            <Text className="text-slate-500 mt-2 text-base">Review and checkout your items.</Text>
          </View>

          {/* total items badge */}
          <View className="flex-row justify-end mb-6">
            <View className="bg-white px-4 py-2 rounded-xl border border-orange-100 flex-row items-center shadow-sm">
              <Ionicons name="cart-outline" size={18} color="#4B5563" />
              <Text className="text-[#4B5563] ml-2 font-medium">{cartItems.length} items</Text>
            </View>
          </View>

          {isLoading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#EA580C" />
            </View>
          ) : cartItems.length === 0 ? (
            <View className="bg-white rounded-[24px] p-10 items-center border border-orange-100 shadow-sm justify-center min-h-[300px]">
              <Ionicons name="cart-outline" size={80} color="#9A3412" />
              <Text className="text-xl font-bold text-[#374151] mt-4">Empty Cart</Text>
            </View>
          ) : (
            <>
              {/* Summary Section */}
              <View className="bg-white rounded-2xl p-5 mb-8 border border-orange-100 shadow-sm">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-xl font-bold text-[#3E2723]">Summary</Text>
                  <TouchableOpacity onPress={toggleSelectAll} className="flex-row items-center">
                    <Checkbox
                      checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                      onPress={toggleSelectAll}
                    />
                    <Text className="ml-2 text-orange-800 font-medium text-sm">Select All</Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-slate-600 mb-6 text-sm">
                  Selected: {selectedBooksCount} book(s) and {selectedEquipmentCount} equipment(s).
                </Text>
                <View className="flex-row space-x-3">
                  <TouchableOpacity onPress={handleCheckout} className="flex-1 bg-orange-600 py-3.5 rounded-xl items-center shadow-sm">
                    <Text className="text-white font-bold text-lg">Check Out</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleClearCart} className="flex-1 bg-white border border-orange-200 py-3.5 rounded-xl items-center shadow-sm">
                    <Text className="text-orange-600 font-bold text-lg">Clear Cart</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Items List */}
              <Text className="text-xl font-bold text-[#3E2723] mb-4">Items in Cart</Text>
              {cartItems.map((item, index) => {
                const details = item.item_details || (item as any).book || (item as any).equipment || item;
                const isBook = item.type === 'book' || !!(item as any).book || !!details.author;
                const itemUniqueKey = `${item.id}-${index}`;
                const isSelected = selectedItems.includes(itemUniqueKey);

                return (
                  <View
                    key={itemUniqueKey}
                    className={`bg-white rounded-2xl p-4 mb-4 border ${isSelected ? 'border-orange-500 bg-orange-50/20' : 'border-slate-100'
                      } shadow-sm flex-row items-center`}
                  >
                    <View className="mr-3 p-1">
                      <Checkbox
                        checked={isSelected}
                        onPress={() => toggleSelect(itemUniqueKey)}
                      />
                    </View>

                    <TouchableOpacity
                      className="flex-1 flex-row items-center"
                      onPress={() => openDetailModal(details)}
                      activeOpacity={0.7}
                    >
                      <View className="w-[60px] h-[80px] bg-orange-50 rounded-lg overflow-hidden mr-3 items-center justify-center border border-orange-100">
                        {details.image_url ? (
                          <Image source={{ uri: details.image_url }} className="w-full h-full" contentFit="cover" />
                        ) : (
                          <Ionicons name={isBook ? 'book' : 'construct'} size={32} color="#9A3412" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-[#3E2723] text-base" numberOfLines={1}>
                          {details.title || details.name || 'Item'}
                        </Text>
                        <Text className="text-slate-500 text-xs">Accession No. : {details.accession_number || 'N/A'}</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleDelete(item.id, itemUniqueKey)} className="ml-2 p-2">
                      <Ionicons name="trash-outline" size={22} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>

      {/* Detail Modal stays the same */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsModalVisible(false)}>
        <View className="flex-1 bg-black/50 justify-center p-6">
          <View className="bg-white rounded-3xl p-6 shadow-2xl max-h-[85%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-[#3E2723]">Item Details</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close-circle" size={32} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {selectedItemDetails && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="items-center mb-6">
                  <View className="w-32 h-44 bg-orange-50 rounded-2xl items-center justify-center border border-orange-100 overflow-hidden shadow-md">
                    {selectedItemDetails.image_url ? (
                      <Image source={{ uri: selectedItemDetails.image_url }} className="w-full h-full" contentFit="cover" />
                    ) : (
                      <Ionicons name={selectedItemDetails.author ? 'book-outline' : 'construct-outline'} size={64} color="#9A3412" />
                    )}
                  </View>
                </View>
                                <View className="space-y-4">
                                  <DetailRow label="Title" value={selectedItemDetails.title || selectedItemDetails.name} bold />
                                  <DetailRow label="Author" value={selectedItemDetails.author} />
                                  <DetailRow label="Accession #" value={selectedItemDetails.accession_number} />
                                  <DetailRow label="Call Number" value={selectedItemDetails.call_number} />
                                  <DetailRow label="Subject" value={selectedItemDetails.subject} />
                                </View>              </ScrollView>
            )}
            <TouchableOpacity onPress={() => setIsModalVisible(false)} className="mt-8 bg-orange-600 py-3.5 rounded-2xl items-center">
              <Text className="text-white font-bold text-lg">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const DetailRow = ({ label, value, bold = false }: { label: string; value?: string; bold?: boolean }) => {
  const displayValue = (!value || value.toLowerCase() === 'na' || value.trim() === '') ? 'N/A' : value;
  
  return (
    <View className="border-b border-slate-50 pb-2 mb-2">
      <Text className="text-slate-400 font-bold text-[10px] uppercase mb-0.5">{label}</Text>
      <Text className={`text-[#3E2723] text-base ${bold ? 'font-bold' : ''}`}>{displayValue}</Text>
    </View>
  );
};

export default CartScreen;