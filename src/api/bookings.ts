// Booking API Service
// This file contains all API calls related to booking management
// Integrated with backend API

import apiClient from './client';
import type { 
  Booking, 
  CreateBookingRequest,
  BookingFilters,
  BookingAuditLog,
  BulkImportResponse,
  ApiResponse 
} from './types';

class BookingAPI {
  /**
   * Get all bookings with pagination and filtering
   */
  async getBookings(params?: BookingFilters) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.dealerCode) queryParams.append('dealerCode', params.dealerCode);
    if (params?.advisorId) queryParams.append('advisorId', params.advisorId);
    if (params?.timeline) queryParams.append('timeline', params.timeline);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await apiClient.get(`/bookings?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get booking by ID
   */
  async getBookingById(id: string): Promise<ApiResponse<Booking>> {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  }

  /**
   * Create new booking
   */
  async createBooking(bookingData: CreateBookingRequest): Promise<ApiResponse<Booking>> {
    const response = await apiClient.post('/bookings', bookingData);
    return response.data;
  }

  /**
   * Update booking
   */
  async updateBooking(id: string, bookingData: Partial<Booking>): Promise<ApiResponse<Booking>> {
    const response = await apiClient.put(`/bookings/${id}`, bookingData);
    return response.data;
  }

  /**
   * Delete booking
   */
  async deleteBooking(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/bookings/${id}`);
    return response.data;
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(id: string, status: string): Promise<ApiResponse<Booking>> {
    const response = await apiClient.patch(`/bookings/${id}/status`, { status });
    return response.data;
  }

  /**
   * Assign advisor to booking
   */
  async assignAdvisor(id: string, advisorId: string): Promise<ApiResponse<Booking>> {
    const response = await apiClient.patch(`/bookings/${id}/assign`, { advisorId });
    return response.data;
  }

  /**
   * Get booking audit log
   */
  async getBookingAuditLog(id: string): Promise<ApiResponse<{ auditLogs: BookingAuditLog[] }>> {
    const response = await apiClient.get(`/bookings/${id}/audit`);
    return response.data;
  }

  /**
   * Upload bulk bookings from Excel/CSV file
   */
  async uploadBulkBookings(file: File, dealerCode: string, onProgress?: (progress: number) => void): Promise<ApiResponse<BulkImportResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dealerCode', dealerCode);

    const response = await apiClient.post('/bookings/import/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress?.(percentCompleted);
        }
      },
    });
    return response.data;
  }

  /**
   * Preview bulk import before uploading
   */
  async previewBulkImport(file: File, dealerCode: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dealerCode', dealerCode);

    const response = await apiClient.post('/bookings/import/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Get import history
   */
  async getImportHistory(page = 1, limit = 10) {
    const response = await apiClient.get(`/bookings/imports?page=${page}&limit=${limit}`);
    return response.data;
  }

  /**
   * Download import errors as CSV
   */
  async downloadImportErrors(importId: string): Promise<Blob> {
    const response = await apiClient.get(`/bookings/imports/${importId}/errors`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Get bookings by timeline filter
   */
  async getBookingsByTimeline(timeline: 'today' | 'delivery_today' | 'pending_update' | 'overdue', page = 1, limit = 20) {
    const response = await apiClient.get(`/bookings?timeline=${timeline}&page=${page}&limit=${limit}`);
    return response.data;
  }

  /**
   * Bulk assign bookings to an advisor
   */
  async bulkAssignBookings(bookingIds: string[], advisorId: string, reason?: string): Promise<ApiResponse<any>> {
    console.log('📦 [BOOKING API] Bulk assigning bookings:', { bookingIds, advisorId, reason });
    const response = await apiClient.post('/bookings/bulk-assign', {
      bookingIds,
      advisorId,
      reason
    });
    console.log('✅ [BOOKING API] Bulk assign response:', response.data);
    return response.data;
  }

  /**
   * Unassign advisor from booking
   */
  async unassignBooking(bookingId: string, reason?: string): Promise<ApiResponse<any>> {
    console.log('🔓 [BOOKING API] Unassigning booking:', { bookingId, reason });
    const response = await apiClient.patch(`/bookings/${bookingId}/unassign`, { reason });
    console.log('✅ [BOOKING API] Unassign response:', response.data);
    return response.data;
  }

  /**
   * Auto-assign bookings using a strategy
   */
  async autoAssignBookings(bookingIds: string[], strategy: 'ROUND_ROBIN' | 'LEAST_LOAD' | 'RANDOM', dealershipId?: string): Promise<ApiResponse<any>> {
    console.log('🤖 [BOOKING API] Auto-assigning bookings:', { bookingIds, strategy, dealershipId });
    const response = await apiClient.post('/bookings/auto-assign', {
      bookingIds,
      strategy,
      dealershipId
    });
    console.log('✅ [BOOKING API] Auto-assign response:', response.data);
    return response.data;
  }

  /**
   * Download bookings as Excel file
   */
  async downloadBookings(filters: {
    format?: 'excel' | 'json';
    startDate?: string;
    endDate?: string;
    status?: string;
    advisorId?: string;
  } = {}): Promise<Blob> {
    console.log('📥 [BOOKING API] Downloading bookings:', filters);
    const response = await apiClient.get('/bookings/download', {
      params: filters,
      responseType: 'blob',
      headers: {
        'Accept': filters.format === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/json'
      }
    });
    console.log('✅ [BOOKING API] Download response received');
    return response.data;
  }

  /**
   * Get booking status summary
   */
  async getBookingStatusSummary(): Promise<ApiResponse<any>> {
    console.log('📊 [BOOKING API] Fetching status summary');
    const response = await apiClient.get('/bookings/status-summary');
    console.log('✅ [BOOKING API] Status summary response:', response.data);
    return response.data;
  }

}

export const bookingAPI = new BookingAPI();
