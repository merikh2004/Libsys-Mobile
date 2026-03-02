import api from './api';

export interface BorrowingRecord {
  title: string;
  author: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string;
  librarian: string;
  status: string;
}

export interface HistorySummary {
  total_borrowed: number;
  currently_borrowed: number;
  overdue: number;
  returned: number;
}

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  total: number;
  has_more: boolean;
}

export interface BorrowingHistoryResponse {
  success: boolean;
  statistics: HistorySummary;
  data: BorrowingRecord[];
  pagination: PaginationInfo;
}

/**
 * Fetch the user's borrowing history and summary statistics.
 */
export const fetchBorrowingHistoryData = async (page: number = 1): Promise<BorrowingHistoryResponse> => {
  try {
    const response = await api.get<BorrowingHistoryResponse>(`/api/borrowingHistory?page=${page}`);
    if (response.data && response.data.success) {
      return response.data;
    }
    throw new Error('Failed to fetch borrowing history');
  } catch (error) {
    console.warn('Using mock borrowing history due to error:', error);
    return {
      success: false,
      statistics: {
        total_borrowed: 0,
        currently_borrowed: 0,
        overdue: 0,
        returned: 0,
      },
      data: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
        has_more: false,
      }
    };
  }
};
