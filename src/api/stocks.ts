// Stock/Vehicle API Service
// This file contains all API calls related to stock/vehicle management
// Integrated with backend API

import apiClient from './client';
import type { 
  Vehicle,
  CreateVehicleRequest,
  VehicleFilters,
  ApiResponse,
  StockItem 
} from './types';

class StockAPI {
  /**
   * Get all vehicles with pagination and filtering
   */
  async getVehicles(params?: VehicleFilters) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.dealerType) queryParams.append('dealerType', params.dealerType);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await apiClient.get(`/stock?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get vehicle by ID
   */
  async getVehicleById(id: string): Promise<ApiResponse<Vehicle>> {
    const response = await apiClient.get(`/stock/${id}`);
    return response.data;
  }

  /**
   * Create new vehicle (Admin/GM/SM only)
   */
  async createVehicle(vehicleData: CreateVehicleRequest): Promise<ApiResponse<Vehicle>> {
    const response = await apiClient.post('/stock', vehicleData);
    return response.data;
  }

  /**
   * Update vehicle (Admin/GM/SM only)
   */
  async updateVehicle(id: string, vehicleData: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> {
    const response = await apiClient.put(`/stock/${id}`, vehicleData);
    return response.data;
  }

  /**
   * Delete vehicle (Admin only)
   */
  async deleteVehicle(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/stock/${id}`);
    return response.data;
  }

  /**
   * Toggle vehicle active status
   */
  async toggleVehicleStatus(id: string, isActive: boolean): Promise<ApiResponse<Vehicle>> {
    const response = await apiClient.patch(`/stock/${id}`, { isActive });
    return response.data;
  }

  // Legacy methods for backward compatibility
  async getStockItems(params?: any) {
    return this.getVehicles(params);
  }

  async getStockItemById(id: string): Promise<ApiResponse<StockItem>> {
    const response = await this.getVehicleById(id);
    // Convert Vehicle to StockItem format for backward compatibility
    if (response.data) {
      const vehicle: any = response.data;
      const stockItem: StockItem = {
        id: vehicle.id,
        vehicleModel: vehicle.variant,
        brand: vehicle.dealerType === 'TATA' ? 'Tata Motors' : 'Universal',
        year: new Date().getFullYear(),
        color: vehicle.color,
        quantity: vehicle.isActive ? 1 : 0,
        price: vehicle.onRoadPrice,
        vin: vehicle.vcCode,
        status: vehicle.isActive ? 'available' : 'sold',
        addedDate: vehicle.createdAt,
      };
      return {
        ...response,
        data: stockItem,
      };
    }
    return response as any;
  }

  async createStockItem(itemData: Omit<StockItem, 'id' | 'addedDate'>): Promise<ApiResponse<StockItem>> {
    // Convert StockItem to Vehicle format
    const vehicleData: CreateVehicleRequest = {
      variant: itemData.vehicleModel,
      vcCode: itemData.vin,
      color: itemData.color,
      fuelType: 'Petrol', // Default
      transmission: 'Manual', // Default
      dealerType: itemData.brand.includes('Tata') ? 'TATA' : 'Universal',
      exShowroomPrice: itemData.price * 0.85,
      finalBillingPrice: itemData.price * 0.9,
      onRoadPrice: itemData.price,
    };
    const response = await this.createVehicle(vehicleData);
    return response as any;
  }

  async updateStockItem(id: string, itemData: Partial<StockItem>): Promise<ApiResponse<StockItem>> {
    const vehicleData: Partial<Vehicle> = {};
    if (itemData.vehicleModel) vehicleData.variant = itemData.vehicleModel;
    if (itemData.color) vehicleData.color = itemData.color;
    if (itemData.price) vehicleData.onRoadPrice = itemData.price;
    if (itemData.status) vehicleData.isActive = itemData.status === 'available';
    
    const response = await this.updateVehicle(id, vehicleData);
    return response as any;
  }

  async deleteStockItem(id: string): Promise<ApiResponse<void>> {
    return this.deleteVehicle(id);
  }

  async getBrands(): Promise<ApiResponse<string[]>> {
    return {
      success: true,
      data: ['Tata Motors', 'Universal Motors'],
      message: 'Brands retrieved successfully',
    };
  }
}

export const stockAPI = new StockAPI();
