import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CartItem,
  checkout,
  clearCart,
  fetchCartItems,
  removeFromCart,
} from '../services/cart';

const Checkbox = ({ checked, onPress }: { checked: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`w-6 h-6 rounded border ${
      checked ? 'bg-orange-500 border-orange-500' : 'bg-white border-slate-300'
    } items-center justify-center`}
  >
    {checked && <Ionicons name="checkmark" size={16} color="white" />}
  </TouchableOpacity>
);

const CartScreen = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCart = async () => {
    setIsLoading(true);
    try {
      const items = await fetchCartItems();
      setCartItems(items);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const toggleSelect = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const success = await removeFromCart(id);
          if (success) {
            setCartItems((prev) => prev.filter((item) => item.id !== id));
            setSelectedItems((prev) => prev.filter((i) => i !== id));
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
          const success = await checkout(selectedItems);
          if (success) {
            Alert.alert('Success', 'Check out successful! Please proceed to the library.');
            loadCart();
            setSelectedItems([]);
          }
        },
      },
    ]);
  };

  const selectedBooksCount = cartItems.filter(
    (item) => selectedItems.includes(item.id) && item.type === 'book'
  ).length;
  const selectedEquipmentCount = cartItems.filter(
    (item) => selectedItems.includes(item.id) && item.type === 'equipment'
  ).length;

  const MainContent = (
    <View className="p-6">
      <View className="flex-row justify-between items-end mb-2">
        <View className="flex-1">
          <Text className="text-3xl font-bold text-[#3E2723]">My Cart</Text>
          <Text className="text-slate-500 mt-2 text-base">
            Review and checkout your selected items.
          </Text>
        </View>
      </View>

      <View className="flex-row justify-end mb-4">
        <View className="bg-white px-3 py-2 rounded-xl border border-slate-100 flex-row items-center shadow-sm">
          <Ionicons name="cart-outline" size={16} color="#3E2723" />
          <Text className="text-[#3E2723] ml-2 font-medium">
            {cartItems.length} total item(s)
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View className="py-20">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : cartItems.length === 0 ? (
        <View className="bg-white rounded-3xl p-8 items-center border border-slate-100 shadow-sm mt-4">
          <View className="w-20 h-20 bg-orange-50 rounded-full items-center justify-center mb-4">
            <Ionicons name="cart-outline" size={48} color="#f97316" />
          </View>
          <Text className="text-xl font-bold text-[#3E2723] mb-2">Your cart is empty</Text>
          <Text className="text-[#f97316] text-center text-base">
            Add books or equipment from the catalog to get started.
          </Text>
        </View>
      ) : (
        <>
          <View className="bg-white rounded-2xl p-5 mb-8 border border-orange-100 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-[#3E2723]">Checkout Summary</Text>
              <TouchableOpacity
                onPress={toggleSelectAll}
                className="flex-row items-center"
              >
                <Checkbox
                  checked={selectedItems.length === cartItems.length}
                  onPress={toggleSelectAll}
                />
                <Text className="ml-2 text-orange-800 font-medium">Select All</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-slate-600 mb-6 text-base">
              {selectedBooksCount} book(s) and {selectedEquipmentCount} equipment item(s) selected for borrowing
            </Text>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={handleCheckout}
                className="flex-1 bg-orange-600 py-3.5 rounded-xl items-center"
              >
                <Text className="text-white font-bold text-lg">Check Out</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClearCart}
                className="flex-1 bg-white border border-orange-200 py-3.5 rounded-xl items-center"
              >
                <Text className="text-orange-600 font-bold text-lg">Clear Cart</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text className="text-xl font-bold text-[#3E2723] mb-4">Selected Items</Text>

          {cartItems.map((item) => (
            <View
              key={item.id}
              className="bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm flex-row"
            >
              <View className="mr-4 justify-center">
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onPress={() => toggleSelect(item.id)}
                />
              </View>

              <View className="mr-4 justify-center bg-orange-50 p-3 rounded-xl">
                <Ionicons
                  name={item.type === 'book' ? 'book-outline' : 'construct-outline'}
                  size={32}
                  color="#f97316"
                />
              </View>

              <View className="flex-1">
                <View className="flex-row justify-between items-start">
                  <Text className="text-lg font-bold text-[#3E2723] flex-1 mr-2" numberOfLines={2}>
                    {item.item_details.title}
                  </Text>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="#64748b" />
                  </TouchableOpacity>
                </View>
                <Text className="text-slate-500 mb-1">by {item.item_details.author}</Text>
                
                <View className="mt-2 space-y-0.5">
                  <View className="flex-row">
                    <Text className="text-slate-400 text-xs font-bold">Accession Number: </Text>
                    <Text className="text-slate-500 text-xs">{item.item_details.accession_number}</Text>
                  </View>
                  {item.item_details.call_number && item.item_details.call_number !== 'N/A' && (
                    <View className="flex-row">
                      <Text className="text-slate-400 text-xs font-bold">Call Number: </Text>
                      <Text className="text-slate-500 text-xs">{item.item_details.call_number}</Text>
                    </View>
                  )}
                  {item.item_details.subject && (
                    <View className="flex-row">
                      <Text className="text-slate-400 text-xs font-bold">Subject: </Text>
                      <Text className="text-slate-500 text-xs">{item.item_details.subject}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
          <View className="h-10" />
        </>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1 }} className="bg-[#FDFBF7]">
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
      >
        {MainContent}
      </ScrollView>
    </View>
  );
};

export default CartScreen;
