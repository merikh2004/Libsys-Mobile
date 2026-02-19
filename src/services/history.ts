import api from './api';

export interface BorrowingRecord {
  id: number;
  book_title: string;
  book_author: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: 'Borrowed' | 'Returned' | 'Overdue';
}

export interface HistorySummary {
  total_borrowed: number;
  currently_borrowed: number;
  overdue: number;
  returned: number;
}

/**
 * Fetch the user's borrowing history summary (stats).
 */
export const fetchHistorySummary = async (): Promise<HistorySummary> => {
  try {
    const response = await api.get<{ success: boolean; data: HistorySummary }>('/api/history/summary');
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch history summary');
  } catch (error) {
    console.warn('Using mock history summary');
    return {
      total_borrowed: 0,
      currently_borrowed: 0,
      overdue: 0,
      returned: 0,
    };
  }
};

/**
 * Fetch the user's detailed borrowing history records.
 */
export const fetchBorrowingHistory = async (): Promise<BorrowingRecord[]> => {
  try {
    const response = await api.get<{ success: boolean; data: BorrowingRecord[] }>('/api/history');
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch borrowing history');
  } catch (error) {
    console.warn('Using empty mock borrowing history');
    return [];
  }
};
