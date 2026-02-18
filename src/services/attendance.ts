// src/services/attendance.ts
import api from './api';

export interface AttendanceRecord {
  id: number;
  date: string; // e.g., "Wed, Feb 18, 2026"
  day: string;  // e.g., "Wed"
  time: string; // e.g., "3:11 PM"
  method: string; // e.g., "manual" or "qr"
}

export interface AttendanceResponse {
  success: boolean;
  data: AttendanceRecord[];
}

/**
 * Fetches attendance records based on date and method.
 * @param date The selected date in YYYY-MM-DD format.
 * @param method The selection method: 'All', 'QR', or 'Manual'.
 */
export const fetchAttendanceRecords = async (
  date: string,
  method: string
): Promise<AttendanceRecord[]> => {
  try {
    const params: any = { date };
    if (method !== 'All Methods') {
      params.method = method;
    }

    const response = await api.get<AttendanceResponse>('/api/attendance/history', { params });
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch attendance records:', error);
    return [];
  }
};
