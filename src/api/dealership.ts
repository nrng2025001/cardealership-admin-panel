// Dealership API
// Production-ready API calls for multi-dealership management

import apiClient from './client';
import type { Dealership, VehicleCatalog, CreateDealershipRequest, ApiResponse } from './types';

/**
 * Dealership API endpoints
 */
export const dealershipAPI = {
  /**
   * Get all dealerships
   */
  getDealerships: async (params?: {
    page?: number;
    limit?: number;
    type?: 'TATA' | 'UNIVERSAL';
    isActive?: boolean;
  }) => {
    return apiClient.get<ApiResponse<{ dealerships: Dealership[]; pagination: any }>>('/dealerships', { params });
  },

  /**
   * Get dealership by ID
   */
  getDealershipById: async (id: string) => {
    return apiClient.get<ApiResponse<{ dealership: Dealership }>>(`/dealerships/${id}`);
  },

  /**
   * Create new dealership
   */
  createDealership: async (data: CreateDealershipRequest) => {
    return apiClient.post<ApiResponse<{ dealership: Dealership }>>('/dealerships', data);
  },

  /**
   * Update dealership
   */
  updateDealership: async (id: string, data: Partial<Dealership>) => {
    return apiClient.patch<ApiResponse<{ dealership: Dealership }>>(`/dealerships/${id}`, data);
  },

  /**
   * Delete dealership
   */
  deleteDealership: async (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/dealerships/${id}`);
  },

  /**
   * Complete dealership onboarding
   */
  completeOnboarding: async (id: string) => {
    return apiClient.post<ApiResponse<{ dealership: Dealership }>>(`/dealerships/${id}/complete-onboarding`);
  },

  /**
   * Get vehicle catalog for dealership
   */
  getDealershipCatalog: async (dealershipId: string) => {
    return apiClient.get<ApiResponse<{ catalog: VehicleCatalog[] }>>(`/dealerships/${dealershipId}/catalog`);
  },

  /**
   * Add vehicle to catalog
   */
  addVehicleToCatalog: async (dealershipId: string, data: any) => {
    return apiClient.post<ApiResponse<{ catalogEntry: VehicleCatalog }>>(`/dealerships/${dealershipId}/catalog`, data);
  },

  /**
   * Update catalog entry
   */
  updateCatalogEntry: async (dealershipId: string, catalogId: string, data: any) => {
    return apiClient.patch<ApiResponse<{ catalogEntry: VehicleCatalog }>>(`/dealerships/${dealershipId}/catalog/${catalogId}`, data);
  },

  /**
   * Delete catalog entry
   */
  deleteCatalogEntry: async (dealershipId: string, catalogId: string) => {
    return apiClient.delete<ApiResponse<void>>(`/dealerships/${dealershipId}/catalog/${catalogId}`);
  },

  /**
   * Get brands for dealership
   */
  getDealershipBrands: async (dealershipId: string) => {
    return apiClient.get<ApiResponse<{ brands: string[] }>>(`/dealerships/${dealershipId}/catalog/brands`);
  },

  /**
   * Get models for brand
   */
  getDealershipModels: async (dealershipId: string, brand: string) => {
    return apiClient.get<ApiResponse<{ models: string[] }>>(`/dealerships/${dealershipId}/catalog/models`, {
      params: { brand },
    });
  },

  /**
   * Get variants for model
   */
  getModelVariants: async (dealershipId: string, modelId: string) => {
    return apiClient.get<ApiResponse<{ variants: any[] }>>(`/dealerships/${dealershipId}/catalog/${modelId}/variants`);
  },
};

