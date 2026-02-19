import api from './api';
import { Book } from './books';

export type ItemType = 'book' | 'equipment';

export interface CartItem {
  id: number;
  type: ItemType;
  item_id: number;
  item_details: Book | any; // Using Book type for now, can be extended for equipment
  created_at: string;
}

export interface CartResponse {
  success: boolean;
  data: CartItem[];
}

// Mock data based on the images provided
const MOCK_CART: CartItem[] = [
  {
    id: 1,
    type: 'book',
    item_id: 101,
    item_details: {
      id: 101,
      accession_number: '00008094',
      title: 'Nutrition for Food Service and Culinary Professionals',
      author: 'Drummond, Karen Eich',
      call_number: 'TX 353 D7941 2019',
      subject: 'Nutrition Food Service',
      availability: 'Available',
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    type: 'book',
    item_id: 102,
    item_details: {
      id: 102,
      accession_number: '00007593',
      title: 'Primer on Investment Policies in the Philippines',
      author: 'na',
      call_number: 'N/A',
      subject: 'Economics',
      availability: 'Available',
    },
    created_at: new Date().toISOString(),
  },
];

/**
 * Fetches cart items from the API.
 */
export const fetchCartItems = async (): Promise<CartItem[]> => {
  try {
    const response = await api.get<CartResponse>('/api/cart');
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error('API response unsuccessful');
  } catch (error) {
    console.warn('Failed to fetch cart from API, falling back to mock data:', error);
    return MOCK_CART;
  }
};

/**
 * Removes an item from the cart.
 */
export const removeFromCart = async (cartItemId: number): Promise<boolean> => {
  try {
    const response = await api.delete(`/api/cart/${cartItemId}`);
    return response.data.success;
  } catch (error) {
    console.error('Failed to remove item from cart:', error);
    return true; // Return true for mock functionality
  }
};

/**
 * Clears the entire cart.
 */
export const clearCart = async (): Promise<boolean> => {
  try {
    const response = await api.delete('/api/cart');
    return response.data.success;
  } catch (error) {
    console.error('Failed to clear cart:', error);
    return true; // Return true for mock functionality
  }
};

/**
 * Checks out selected items.
 */
export const checkout = async (cartItemIds: number[]): Promise<boolean> => {
  try {
    const response = await api.post('/api/checkout', { cart_item_ids: cartItemIds });
    return response.data.success;
  } catch (error) {
    console.error('Failed to checkout:', error);
    return true; // Return true for mock functionality
  }
};
