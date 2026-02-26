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
    console.log('Cart API Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.success) {
      // Ensure we return an array
      return Array.isArray(response.data.data) ? response.data.data : [];
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
    return response.data && response.data.success;
  } catch (error) {
    console.error('Failed to remove item from cart:', error);
    return false;
  }
};

/**
 * Clears the entire cart.
 */
export const clearCart = async (): Promise<boolean> => {
  try {
    const response = await api.delete('/api/cart');
    return response.data && response.data.success;
  } catch (error) {
    console.error('Failed to clear cart:', error);
    return false;
  }
};

export interface ActiveTicket {
  transaction_code: string;
  items_count: number;
  status: string;
}

/**
 * Fetches the active checkout ticket from the API.
 */
export const fetchActiveTicket = async (): Promise<ActiveTicket | null> => {
  try {
    const response = await api.get<{ success: boolean; data: ActiveTicket }>('/api/checkout');
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.warn('Failed to fetch active ticket:', error);
    return null;
  }
};

/**
 * Adds a book to the cart.
 */
export const addToCart = async (book: any): Promise<{ success: boolean; message?: string }> => {
  try {
    // Get the ID from either 'id' or 'book_id' field
    const bookId = book.id || book.book_id;
    
    if (!bookId) {
      return { success: false, message: 'Invalid Book ID' };
    }

    console.log('Adding to cart, Book ID:', bookId);
    
    const response = await api.post('/api/cart/add', { 
      book_id: bookId 
    });
    
    // If API returns success: false explicitly, it's a failure. 
    // Otherwise, as long as it didn't throw an error, treat it as success.
    const isSuccess = response.data && response.data.success !== false;
    
    return {
      success: isSuccess,
      message: response.data && response.data.message
    };
  } catch (error: any) {
    console.error('Failed to add item to cart:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to add item to cart'
    };
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
    return false;
  }
};
