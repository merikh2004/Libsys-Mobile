import api from './api';
import { Book } from './books';

export type ItemType = 'book' | 'equipment';

export interface CartItem {
  id: number;
  cart_id?: number; // Added to match actual API response
  type: ItemType;
  item_id: number;
  item_details: Book | any;
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
export const removeFromCart = async (cartItemId: number): Promise<{ success: boolean; message?: string }> => {
  try {
    // 1. Double check kung invalid ang ID
    if (!cartItemId) {
      console.error('BUMAGSAK: Walang valid na ID na naipasa sa removeFromCart');
      return { success: false, message: 'Invalid item ID' };
    }

    console.log('Tinatawag na ang backend para burahin ang ID:', cartItemId);

    // 2. I-call ang API (Eto ang eksaktong format sa Postman URL bar mo: /api/cart/85)
    const response = await api.delete(`/api/cart/${cartItemId}`);

    // 3. I-log ang result para makita mo agad kung successful
    console.log(`Backend nag-reply! Status: ${response.status}`);
    console.log('Data mula sa server:', response.data);

    // I-check kung tagumpay (200 o kaya true yung success flag)
    const isSuccess = response.data?.success === true || response.status === 200 || response.status === 204;

    return {
      success: isSuccess,
      message: response.data?.message || 'Item successfully removed'
    };
  } catch (error: any) {
    // Kung may error, ito ang lalabas sa console.
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
    console.error('SABLAY sa pagtanggal:', error.response?.status, errorMessage);

    return {
      success: false,
      message: errorMessage
    };
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

export interface CheckoutData {
  transaction_code: string;
  expires_at: string;
  qrcode_url: string;
  student_number?: string;
  full_name?: string;
  year?: string | number;
  section?: string;
  course?: string;
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  data: CheckoutData;
}

/**
 * Fetches the active checkout ticket from the API.
 */
export const fetchActiveTicket = async (): Promise<CheckoutData | null> => {
  try {
    // FIX: Binago natin ang endpoint. Hindi pwedeng 'GET /api/cart/checkout'.
    // Palitan mo ang '/api/active-ticket' kung ano ang totoong GET route mo sa Laravel.
    const response = await api.get<{ success: boolean; data: CheckoutData }>('/api/active-ticket');

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
export const checkout = async (cartItemIds: number[]): Promise<CheckoutResponse | null> => {
  try {
    const response = await api.post<CheckoutResponse>('/api/cart/checkout', { cart_item_ids: cartItemIds });
    return response.data;
  } catch (error: any) {
    console.error('Failed to checkout:', error);
    // DITO ANG FIX: I-return ang error message mula sa Laravel para mabasa ng CartScreen
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return null;
  }
};

/**
 * Validates selected items against library rules before checkout.
 */
export const validateCheckoutRules = (selectedItems: CartItem[]): { isValid: boolean; message?: string } => {
  if (selectedItems.length === 0) {
    return { isValid: false, message: 'Please select at least one item to check out.' };
  }

  // Example library rule: Maximum of 5 items per checkout
  const MAX_ITEMS = 5;
  if (selectedItems.length > MAX_ITEMS) {
    return { isValid: false, message: `You can only check out up to ${MAX_ITEMS} items at a time.` };
  }

  // Example library rule: Ensure all items have accession numbers (valid library items)
  const invalidItems = selectedItems.filter(item => {
    const details = item.item_details || (item as any).book || (item as any).equipment || item;
    return !details.accession_number;
  });

  if (invalidItems.length > 0) {
    return { isValid: false, message: 'Some selected items are missing library identifiers.' };
  }

  return { isValid: true };
};