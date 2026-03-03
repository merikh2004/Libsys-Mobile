import api from './api';
import { Book } from './books';

export type ItemType = 'book' | 'equipment';

// FIX: In-update ang CartItem para tumugma sa flat response ng Laravel
export interface CartItem {
  cart_id: number;
  book_id: number;
  title: string;
  author: string | null;
  cover: string | null;
  accession_number: string;
  call_number: string | null;
  subject: string | null;
  added_at: string;
  
  // Fallbacks in case ng lumang format
  id?: number;
  type?: ItemType;
  item_id?: number;
  item_details?: Book | any;
  created_at?: string;
}

export interface CartResponse {
  success: boolean;
  data: CartItem[];
}

export interface BookData {
  book_id: number;
  title: string;
  author: string | null;
  accession_number: string | null;
  call_number: string | null;
}

export interface CheckoutData {
  transaction_code: string;
  expires_at: string;
  qrcode_url?: string;
  user_details?: {
    name: string;
    role: string;
    student_number: string;
    year_level: number;
    section: string;
    course: string;
  };
  books?: BookData[]; 
  
  // Fallbacks
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

const MOCK_CART: CartItem[] = [];

export const fetchCartItems = async (): Promise<CartItem[]> => {
  try {
    const response = await api.get<CartResponse>('/api/cart');
    if (response.data && response.data.success) {
      return Array.isArray(response.data.data) ? response.data.data : [];
    }
    throw new Error('API response unsuccessful');
  } catch (error) {
    return MOCK_CART;
  }
};

export const removeFromCart = async (cartItemId: number): Promise<{ success: boolean; message?: string }> => {
  try {
    if (!cartItemId) return { success: false, message: 'Invalid item ID' };
    const response = await api.delete(`/api/cart/${cartItemId}`);
    const isSuccess = response.data?.success === true || response.status === 200 || response.status === 204;
    return { success: isSuccess, message: response.data?.message || 'Item successfully removed' };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const clearCart = async (): Promise<boolean> => {
  try {
    const response = await api.delete('/api/cart');
    return response.data && response.data.success;
  } catch (error) {
    return false;
  }
};

export const fetchActiveTicket = async (): Promise<CheckoutData | null> => {
  try {
    const response = await api.get<CheckoutData & { success: boolean }>('/api/cart/status');

    if (response.data && response.data.success && response.data.transaction_code) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to fetch active ticket (cart/status):', error);
    return null;
  }
};

export const addToCart = async (book: any): Promise<{ success: boolean; message?: string }> => {
  try {
    const bookId = book.id || book.book_id;
    if (!bookId) return { success: false, message: 'Invalid Book ID' };

    const response = await api.post('/api/cart/add', { book_id: bookId });
    const isSuccess = response.data && response.data.success !== false;
    return { success: isSuccess, message: response.data && response.data.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || 'Failed to add item' };
  }
};

export const checkout = async (cartItemIds: number[]): Promise<CheckoutResponse | null> => {
  try {
    const response = await api.post<CheckoutResponse>('/api/cart/checkout', { cart_item_ids: cartItemIds });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) return error.response.data;
    return null;
  }
};

// FIX: Mas matalinong validation para maiwasang mag-error kapag kulang o mali ang ipinasa
export const validateCheckoutRules = (selectedItems: any[]): { isValid: boolean; message?: string } => {
  if (selectedItems.length === 0) {
    return { isValid: false, message: 'Please select at least one item to check out.' };
  }

  const MAX_ITEMS = 5;
  if (selectedItems.length > MAX_ITEMS) {
    return { isValid: false, message: `You can only check out up to ${MAX_ITEMS} items at a time.` };
  }

  const invalidItems = selectedItems.filter(item => {
    // Kung puro IDs (numbers/strings) lang ang pinasa imbes na mismong Book object
    if (typeof item === 'number' || typeof item === 'string') {
      console.error("MALI ANG PINASA SA VALIDATION: IDs ang pinasa imbes na buong object ng cart.");
      return true; 
    }

    // Suportado ang new flat response (item) at ang old nested format (item.item_details)
    const details = item.item_details || item;
    return !details.accession_number;
  });

  if (invalidItems.length > 0) {
    return { isValid: false, message: 'Some items missing identifiers.' };
  }

  return { isValid: true };
};