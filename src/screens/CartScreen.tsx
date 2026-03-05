import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// 1. ITO ANG TAMA AT SAFE NA IMPORT PARA SA SAFEAREAVIEW
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CartItem,
  checkout,
  clearCart,
  fetchCartItems,
  removeFromCart,
  validateCheckoutRules,
} from '../services/cart';

const Checkbox = ({ checked, onPress }: { checked: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    className={`w-6 h-6 rounded border ${checked ? 'bg-orange-500 border-orange-500' : 'bg-white border-slate-300'} items-center justify-center`}
  >
    {checked && <Ionicons name="checkmark" size={16} color="white" />}
  </TouchableOpacity>
);

const DetailRow = ({ label, value, bold = false }: { label: string; value?: string; bold?: boolean }) => {
  const displayValue = (!value || value.toLowerCase() === 'na' || value.trim() === '') ? 'N/A' : value;
  return (
    <View className="border-b border-slate-50 pb-2 mb-2">
      <Text className="text-slate-400 font-bold text-[10px] uppercase mb-0.5">{label}</Text>
      <Text className={`text-[#3E2723] text-base ${bold ? 'font-bold' : ''}`}>{displayValue}</Text>
    </View>
  );
};

// 2. WALA NANG useNavigation HOOK. REKTA PROPS NA.
const CartScreen = ({ navigation }: any) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedItemDetails, setSelectedItemDetails] = useState<any | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    visible: false, title: '', message: '', onConfirm: undefined as any, showCancel: false, confirmText: 'OK'
  });

  const showAlert = (title: string, message: string, onConfirm?: () => void, showCancel = false, confirmText = 'OK') => {
    setAlertConfig({ visible: true, title, message, onConfirm, showCancel, confirmText });
  };

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

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
      setSelectedItems(cartItems.map((item, index) => `${item.cart_id || item.id}-${index}`));
    }
  };

  const handleDelete = (idToUse: number | undefined, uniqueKey: string) => {
    if (!idToUse) {
      showAlert('Error', 'Invalid item ID.');
      return;
    }
    showAlert('Remove Item', 'Are you sure you want to remove this item?', async () => {
      closeAlert();
      setIsLoading(true);
      const result = await removeFromCart(idToUse);
      if (result.success) {
        setCartItems((prev) => prev.filter((item) => (item.cart_id || item.id) !== idToUse));
        setSelectedItems((prev) => prev.filter((key) => key !== uniqueKey));
      } else {
        showAlert('Error', result.message || 'Failed to remove item.');
      }
      setIsLoading(false);
    }, true, 'Remove');
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    showAlert('Clear Cart', 'Are you sure you want to clear your entire cart?', async () => {
      closeAlert();
      setIsLoading(true);
      const allCartIds = cartItems.map(item => item.cart_id || item.id || 0).filter(id => id !== 0);
      const success = await clearCart(allCartIds);
      if (success) {
        setCartItems([]);
        setSelectedItems([]);
        showAlert('Success', 'Cart has been cleared.');
      } else {
        showAlert('Error', 'Failed to clear cart.');
      }
      setIsLoading(false);
    }, true, 'Clear All');
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      showAlert('Error', 'Please select at least one item.');
      return;
    }

    const itemsToValidate = cartItems.filter((item, index) => selectedItems.includes(`${item.cart_id || item.id}-${index}`));
    const validation = validateCheckoutRules(itemsToValidate);
    
    if (!validation.isValid) {
      showAlert('Checkout Restricted', validation.message || 'Error');
      return;
    }

    showAlert('Check Out', `Confirm check out for ${selectedItems.length} items?`, async () => {
      closeAlert();
      setIsLoading(true);
      try {
        const realIdsToCheckout = itemsToValidate.map(item => item.cart_id || item.id || 0);
        const response = await checkout(realIdsToCheckout);
        if (response && response.success) {
          loadCart();
          setSelectedItems([]);
          showAlert('Success', 'Check out successful!', () => {
            closeAlert();
            if (navigation && navigation.navigate) navigation.navigate('Main', { screen: 'QR', params: { ticket: response.data } });
          });
        } else {
          const errorMsg = response?.message || 'Failed to checkout.';
          if (errorMsg.toLowerCase().includes('incomplete profile')) {
            showAlert('Profile Setup Required', errorMsg, () => {
              closeAlert();
              if (navigation && navigation.navigate) navigation.navigate('Settings');
            }, true, 'Go to Settings');
          } else {
            showAlert('Error', errorMsg);
          }
        }
      } catch (error) {
        showAlert('Error', 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    }, true, 'Confirm');
  };

  const openDetailModal = (details: any) => {
    setSelectedItemDetails(details);
    setIsDetailModalVisible(true);
  };

  const selectedBooksCount = cartItems.filter((item, index) => {
    const isSelected = selectedItems.includes(`${item.cart_id || item.id}-${index}`);
    const details = item.item_details || (item as any).book || item;
    const isBook = item.type === 'book' || !!(item as any).book || !!details.author;
    return isSelected && isBook;
  }).length;

  const selectedEquipmentCount = selectedItems.length - selectedBooksCount;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FDFBF7' }} edges={['bottom', 'left', 'right']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <View className="mb-2">
            <Text className="text-3xl font-bold text-[#3E2723]">My Cart</Text>
            <Text className="text-slate-500 mt-2 text-base">Review and checkout your items.</Text>
          </View>

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
              <Text className="text-slate-500 mt-2">Your cart is currently empty.</Text>
            </View>
          ) : (
            <>
              <View className="bg-white rounded-2xl p-5 mb-8 border border-orange-100 shadow-sm">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-xl font-bold text-[#3E2723]">Summary</Text>
                  <TouchableOpacity onPress={toggleSelectAll} className="flex-row items-center">
                    <Checkbox checked={selectedItems.length === cartItems.length && cartItems.length > 0} onPress={toggleSelectAll} />
                    <Text className="ml-2 text-orange-800 font-medium text-sm">Select All</Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-slate-600 mb-6 text-sm">
                  Selected: {selectedBooksCount} book(s) and {selectedEquipmentCount} equipment(s).
                </Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity onPress={handleCheckout} className="flex-1 bg-orange-600 py-3.5 rounded-xl items-center shadow-sm">
                    <Text className="text-white font-bold text-lg">Check Out</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleClearCart} className="flex-1 bg-white border border-orange-200 py-3.5 rounded-xl items-center shadow-sm">
                    <Text className="text-orange-600 font-bold text-lg">Clear Cart</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text className="text-xl font-bold text-[#3E2723] mb-4">Items in Cart</Text>
              {cartItems.map((item, index) => {
                const details = item.item_details || (item as any).book || (item as any).equipment || item;
                const isBook = item.type === 'book' || !!(item as any).book || !!details.author;
                const itemUniqueKey = `${item.cart_id || item.id}-${index}`;
                const isSelected = selectedItems.includes(itemUniqueKey);

                return (
                  <View key={itemUniqueKey} className={`bg-white rounded-2xl p-4 mb-4 border ${isSelected ? 'border-orange-500 bg-orange-50/20' : 'border-slate-100'} shadow-sm flex-row items-center`}>
                    <View className="mr-3 p-1">
                      <Checkbox checked={isSelected} onPress={() => toggleSelect(itemUniqueKey)} />
                    </View>
                    <TouchableOpacity className="flex-1 flex-row items-center" onPress={() => openDetailModal(details)} activeOpacity={0.7}>
                      <View className="w-[60px] h-[80px] bg-orange-50 rounded-lg overflow-hidden mr-3 items-center justify-center border border-orange-100">
                        {details.image_url ? (
                          <Image source={{ uri: details.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        ) : (
                          <Ionicons name={isBook ? 'book' : 'construct'} size={32} color="#9A3412" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-[#3E2723] text-base" numberOfLines={1}>{details.title || details.name || 'Item'}</Text>
                        <Text className="text-slate-500 text-xs">Accession No. : {details.accession_number || 'N/A'}</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.cart_id || item.id, itemUniqueKey)} className="ml-2 p-2">
                      <Ionicons name="trash-outline" size={22} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>

      {/* 3. CONDITIONALLY RENDERED MODALS PARA HINDI BUMANGGA SA NAVIGATION PAG EMPTY */}
      {isDetailModalVisible && (
        <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setIsDetailModalVisible(false)}>
          <View className="flex-1 bg-black/50 justify-center p-6">
            <View className="bg-white rounded-3xl p-6 shadow-2xl max-h-[85%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-[#3E2723]">Item Details</Text>
                <TouchableOpacity onPress={() => setIsDetailModalVisible(false)}>
                  <Ionicons name="close-circle" size={32} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {selectedItemDetails && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View className="items-center mb-6">
                    <View className="w-32 h-44 bg-orange-50 rounded-2xl items-center justify-center border border-orange-100 overflow-hidden shadow-md">
                      {selectedItemDetails.image_url ? (
                        <Image source={{ uri: selectedItemDetails.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
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
                  </View>
                </ScrollView>
              )}
              <TouchableOpacity onPress={() => setIsDetailModalVisible(false)} className="mt-8 bg-orange-600 py-3.5 rounded-2xl items-center">
                <Text className="text-white font-bold text-lg">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {alertConfig.visible && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View className="flex-1 bg-black/50 justify-center items-center p-6">
            <View className="bg-white rounded-2xl p-6 w-full max-w-[340px] shadow-xl">
              <Text className="text-xl font-bold text-slate-900 mb-2">{alertConfig.title}</Text>
              <Text className="text-slate-600 text-base mb-6 leading-6">{alertConfig.message}</Text>
              
              <View className="flex-row justify-end space-x-3">
                {alertConfig.showCancel && (
                  <TouchableOpacity onPress={closeAlert} className="px-5 py-2.5 rounded-xl">
                    <Text className="text-slate-500 font-bold text-base">Cancel</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  onPress={() => { alertConfig.onConfirm ? alertConfig.onConfirm() : closeAlert(); }} 
                  className="bg-orange-600 px-6 py-2.5 rounded-xl shadow-sm"
                >
                  <Text className="text-white font-bold text-base">{alertConfig.confirmText || 'OK'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;