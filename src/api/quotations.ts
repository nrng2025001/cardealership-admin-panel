// Quotation API Service
// This file contains all API calls related to quotation management
// Integrated with backend API

import apiClient from './client';
import type { 
  Quotation, 
  CreateQuotationRequest,
  QuotationFilters,
  QuotationStats,
  ApiResponse 
} from './types';

class QuotationAPI {
  /**
   * Get all quotations with pagination and filtering
   */
  async getQuotations(params?: QuotationFilters) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await apiClient.get(`/quotations?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get quotation by ID
   */
  async getQuotationById(id: string): Promise<ApiResponse<Quotation>> {
    const response = await apiClient.get(`/quotations/${id}`);
    return response.data;
  }

  /**
   * Create new quotation
   */
  async createQuotation(quotationData: CreateQuotationRequest): Promise<ApiResponse<Quotation>> {
    const response = await apiClient.post('/quotations', quotationData);
    return response.data;
  }

  /**
   * Update quotation
   */
  async updateQuotation(id: string, quotationData: Partial<Quotation>): Promise<ApiResponse<Quotation>> {
    const response = await apiClient.put(`/quotations/${id}`, quotationData);
    return response.data;
  }

  /**
   * Delete quotation
   */
  async deleteQuotation(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/quotations/${id}`);
    return response.data;
  }

  /**
   * Update quotation status
   */
  async updateQuotationStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SENT_TO_CUSTOMER'): Promise<ApiResponse<Quotation>> {
    const response = await apiClient.patch(`/quotations/${id}`, { status });
    return response.data;
  }

  /**
   * Get quotation statistics (admin only)
   */
  async getQuotationStats(): Promise<ApiResponse<QuotationStats>> {
    const response = await apiClient.get('/quotations/stats');
    return response.data;
  }

  /**
   * Generate and upload PDF for quotation
   */
  async generatePDF(id: string, pdfUrl: string): Promise<ApiResponse<Quotation>> {
    const response = await apiClient.patch(`/quotations/${id}`, { pdfUrl });
    return response.data;
  }

  /**
   * Send quotation to customer
   */
  async sendToCustomer(id: string): Promise<ApiResponse<Quotation>> {
    const response = await apiClient.patch(`/quotations/${id}`, { 
      status: 'SENT_TO_CUSTOMER' 
    });
    return response.data;
  }

  /**
   * Export quotation to PDF
   */
  async exportQuotationToPDF(id: string): Promise<ApiResponse<{ pdfUrl: string }>> {
    const response = await apiClient.get(`/quotations/${id}/export-pdf`);
    return response.data;
  }
}

export const quotationAPI = new QuotationAPI();
