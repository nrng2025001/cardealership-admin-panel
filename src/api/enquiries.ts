// Enquiry API Service
// This file contains all API calls related to enquiry management
// Integrated with backend API

import apiClient from './client';
import type { 
  Enquiry, 
  CreateEnquiryRequest,
  EnquiryFilters,
  EnquiryStats,
  ApiResponse 
} from './types';

class EnquiryAPI {
  /**
   * Get all enquiries with pagination and filtering
   */
  async getEnquiries(params?: EnquiryFilters) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await apiClient.get(`/enquiries?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get enquiry by ID
   */
  async getEnquiryById(id: string): Promise<ApiResponse<Enquiry>> {
    const response = await apiClient.get(`/enquiries/${id}`);
    return response.data;
  }

  /**
   * Create new enquiry
   */
  async createEnquiry(enquiryData: CreateEnquiryRequest): Promise<ApiResponse<Enquiry>> {
    const response = await apiClient.post('/enquiries', enquiryData);
    return response.data;
  }

  /**
   * Update enquiry
   */
  async updateEnquiry(id: string, enquiryData: Partial<Enquiry>): Promise<ApiResponse<Enquiry>> {
    const response = await apiClient.put(`/enquiries/${id}`, enquiryData);
    return response.data;
  }

  /**
   * Delete enquiry
   */
  async deleteEnquiry(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/enquiries/${id}`);
    return response.data;
  }

  /**
   * Update enquiry category (auto-converts to booking if category is BOOKED and stock available)
   */
  async updateEnquiryCategory(id: string, category: 'HOT' | 'LOST' | 'BOOKED'): Promise<ApiResponse<Enquiry>> {
    const response = await apiClient.patch(`/enquiries/${id}`, { category });
    return response.data;
  }

  /**
   * Update enquiry status
   */
  async updateEnquiryStatus(id: string, status: 'OPEN' | 'CLOSED'): Promise<ApiResponse<Enquiry>> {
    const response = await apiClient.patch(`/enquiries/${id}`, { status });
    return response.data;
  }

  /**
   * Get enquiry statistics (admin only)
   */
  async getEnquiryStats(): Promise<ApiResponse<EnquiryStats>> {
    const response = await apiClient.get('/enquiries/stats');
    return response.data;
  }

  /**
   * Convert enquiry to booking manually
   */
  async convertToBooking(id: string, bookingData?: Partial<any>): Promise<ApiResponse<any>> {
    const response = await apiClient.post(`/enquiries/${id}/convert-to-booking`, bookingData);
    return response.data;
  }

  /**
   * Download enquiries as Excel file
   */
  async downloadEnquiries(filters: {
    format?: 'excel' | 'json';
    startDate?: string;
    endDate?: string;
    category?: string;
    status?: string;
  } = {}): Promise<Blob> {
    console.log('📥 [ENQUIRY API] Downloading enquiries:', filters);
    const response = await apiClient.get('/enquiries/download', {
      params: filters,
      responseType: 'blob',
      headers: {
        'Accept': filters.format === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/json'
      }
    });
    console.log('✅ [ENQUIRY API] Download response received');
    return response.data;
  }

  /**
   * Get enquiry status summary
   */
  async getEnquiryStatusSummary(): Promise<ApiResponse<any>> {
    console.log('📊 [ENQUIRY API] Fetching status summary');
    const response = await apiClient.get('/enquiries/status-summary');
    console.log('✅ [ENQUIRY API] Status summary response:', response.data);
    return response.data;
  }
}

export const enquiryAPI = new EnquiryAPI();
