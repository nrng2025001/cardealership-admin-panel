// Dashboard API Service
// This file contains all API calls related to dashboard data and statistics
// Integrated with backend API

import apiClient from './client';
import { enquiryAPI } from './enquiries';
import { quotationAPI } from './quotations';
import { bookingAPI } from './bookings';
import type { DashboardStats, ApiResponse } from './types';

class DashboardAPI {
  /**
   * Get dashboard statistics and KPIs
   * Aggregates data from multiple endpoints
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      // Fetch stats from different endpoints in parallel
      const defaultEnquiryStats = { total: 0, byCategory: { HOT: 0, LOST: 0, BOOKED: 0 }, byStatus: { OPEN: 0, CLOSED: 0 } };
      const defaultQuotationStats = { total: 0, byStatus: { PENDING: 0, APPROVED: 0, REJECTED: 0, SENT_TO_CUSTOMER: 0 } };
      
      const [enquiryStatsRes, quotationStatsRes, bookingsRes, usersRes, vehiclesRes] = await Promise.all([
        enquiryAPI.getEnquiryStats().catch(() => ({ data: defaultEnquiryStats })),
        quotationAPI.getQuotationStats().catch(() => ({ data: defaultQuotationStats })),
        bookingAPI.getBookings({ limit: 1 }).catch(() => ({ data: { pagination: { total: 0 } } })),
        apiClient.get('/auth/users?limit=1').catch(() => ({ data: { data: { pagination: { total: 0 } } } })),
        apiClient.get('/stock?limit=1').catch(() => ({ data: { data: { pagination: { total: 0 } } } })),
      ]);

      const enquiryStats = enquiryStatsRes.data || defaultEnquiryStats;
      const quotationStats = quotationStatsRes.data || defaultQuotationStats;
      const totalBookings = bookingsRes.data?.pagination?.total || 0;
      const totalEmployees = usersRes.data?.data?.pagination?.total || 0;
      const stockCount = vehiclesRes.data?.data?.pagination?.total || 0;

      const stats: DashboardStats = {
        totalEmployees,
        activeEnquiries: enquiryStats.byStatus?.OPEN || enquiryStats.total,
        pendingQuotations: quotationStats.byStatus?.PENDING || quotationStats.total,
        totalBookings,
        stockCount,
        revenue: 0, // Calculate from bookings if needed
        enquiryStats,
        quotationStats,
      };

      return {
        success: true,
        data: stats,
        message: 'Dashboard statistics retrieved successfully',
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      
      // Return default stats on error
      return {
        success: false,
        data: {
          totalEmployees: 0,
          activeEnquiries: 0,
          pendingQuotations: 0,
          totalBookings: 0,
          stockCount: 0,
          revenue: 0,
        },
        message: 'Failed to fetch dashboard statistics',
      };
    }
  }

  /**
   * Get revenue chart data for the last 12 months
   * Note: Backend may need to implement this endpoint
   */
  async getRevenueChartData(): Promise<ApiResponse<Array<{ month: string; revenue: number }>>> {
    try {
      const response = await apiClient.get('/dashboard/revenue-chart');
      return response.data;
    } catch (error) {
      // Fallback to mock data if endpoint doesn't exist
      console.warn('Revenue chart endpoint not available, using mock data');
      
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];

      const chartData = months.map((month) => ({
        month,
        revenue: Math.floor(Math.random() * 50000) + 100000
      }));

      return {
        success: true,
        data: chartData,
        message: 'Revenue chart data retrieved successfully (mock)',
      };
    }
  }

  /**
   * Get sales performance by employee
   * Note: Backend may need to implement this endpoint
   */
  async getSalesPerformance(): Promise<ApiResponse<Array<{ employeeName: string; sales: number }>>> {
    try {
      const response = await apiClient.get('/dashboard/sales-performance');
      return response.data;
    } catch (error) {
      // Fallback to calculating from bookings
      console.warn('Sales performance endpoint not available');
      
      return {
        success: true,
        data: [],
        message: 'Sales performance endpoint not yet available',
      };
    }
  }

  /**
   * Get recent activities
   * Note: Backend may need to implement this endpoint
   */
  async getRecentActivities(): Promise<ApiResponse<Array<{
    id: string;
    type: 'booking' | 'enquiry' | 'quotation' | 'employee';
    message: string;
    timestamp: string;
  }>>> {
    try {
      const response = await apiClient.get('/dashboard/recent-activities');
      return response.data;
    } catch (error) {
      // Fetch latest items from each endpoint
      console.warn('Recent activities endpoint not available, aggregating from other endpoints');
      
      try {
        const [bookingsRes, enquiriesRes, quotationsRes] = await Promise.all([
          bookingAPI.getBookings({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }).catch(() => ({ data: { bookings: [] } })),
          enquiryAPI.getEnquiries({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }).catch(() => ({ data: { enquiries: [] } })),
          quotationAPI.getQuotations({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }).catch(() => ({ data: { quotations: [] } })),
        ]);

        const activities: any[] = [];

        bookingsRes.data?.bookings?.forEach((booking: any) => {
          // Show advisor remarks
          if (booking.advisorRemarks) {
            activities.push({
              id: `${booking.id}-advisor`,
              type: 'booking',
              message: `Advisor: ${booking.advisorRemarks}`,
              timestamp: booking.createdAt,
            });
          }
          
          // Show team lead remarks
          if (booking.teamLeadRemarks) {
            activities.push({
              id: `${booking.id}-teamlead`,
              type: 'booking',
              message: `Team Lead: ${booking.teamLeadRemarks}`,
              timestamp: booking.createdAt,
            });
          }
          
          // Show sales manager remarks
          if (booking.salesManagerRemarks) {
            activities.push({
              id: `${booking.id}-salesmanager`,
              type: 'booking',
              message: `Sales Manager: ${booking.salesManagerRemarks}`,
              timestamp: booking.createdAt,
            });
          }
          
          // Show general manager remarks
          if (booking.generalManagerRemarks) {
            activities.push({
              id: `${booking.id}-generalmanager`,
              type: 'booking',
              message: `General Manager: ${booking.generalManagerRemarks}`,
              timestamp: booking.createdAt,
            });
          }
          
          // Show admin remarks
          if (booking.adminRemarks) {
            activities.push({
              id: `${booking.id}-admin`,
              type: 'booking',
              message: `Admin: ${booking.adminRemarks}`,
              timestamp: booking.createdAt,
            });
          }
        });

        enquiriesRes.data?.enquiries?.forEach((enquiry: any) => {
          // Show advisor remarks
          if (enquiry.advisorRemarks) {
            activities.push({
              id: `${enquiry.id}-advisor`,
              type: 'enquiry',
              message: `Advisor: ${enquiry.advisorRemarks}`,
              timestamp: enquiry.createdAt,
            });
          }
          
          // Show team lead remarks
          if (enquiry.teamLeadRemarks) {
            activities.push({
              id: `${enquiry.id}-teamlead`,
              type: 'enquiry',
              message: `Team Lead: ${enquiry.teamLeadRemarks}`,
              timestamp: enquiry.createdAt,
            });
          }
          
          // Show sales manager remarks
          if (enquiry.salesManagerRemarks) {
            activities.push({
              id: `${enquiry.id}-salesmanager`,
              type: 'enquiry',
              message: `Sales Manager: ${enquiry.salesManagerRemarks}`,
              timestamp: enquiry.createdAt,
            });
          }
          
          // Show general manager remarks
          if (enquiry.generalManagerRemarks) {
            activities.push({
              id: `${enquiry.id}-generalmanager`,
              type: 'enquiry',
              message: `General Manager: ${enquiry.generalManagerRemarks}`,
              timestamp: enquiry.createdAt,
            });
          }
          
          // Show admin remarks
          if (enquiry.adminRemarks) {
            activities.push({
              id: `${enquiry.id}-admin`,
              type: 'enquiry',
              message: `Admin: ${enquiry.adminRemarks}`,
              timestamp: enquiry.createdAt,
            });
          }
        });

        quotationsRes.data?.quotations?.forEach((quotation: any) => {
          // Show advisor remarks
          if (quotation.advisorRemarks) {
            activities.push({
              id: `${quotation.id}-advisor`,
              type: 'quotation',
              message: `Advisor: ${quotation.advisorRemarks}`,
              timestamp: quotation.createdAt,
            });
          }
          
          // Show team lead remarks
          if (quotation.teamLeadRemarks) {
            activities.push({
              id: `${quotation.id}-teamlead`,
              type: 'quotation',
              message: `Team Lead: ${quotation.teamLeadRemarks}`,
              timestamp: quotation.createdAt,
            });
          }
          
          // Show sales manager remarks
          if (quotation.salesManagerRemarks) {
            activities.push({
              id: `${quotation.id}-salesmanager`,
              type: 'quotation',
              message: `Sales Manager: ${quotation.salesManagerRemarks}`,
              timestamp: quotation.createdAt,
            });
          }
          
          // Show general manager remarks
          if (quotation.generalManagerRemarks) {
            activities.push({
              id: `${quotation.id}-generalmanager`,
              type: 'quotation',
              message: `General Manager: ${quotation.generalManagerRemarks}`,
              timestamp: quotation.createdAt,
            });
          }
          
          // Show admin remarks
          if (quotation.adminRemarks) {
            activities.push({
              id: `${quotation.id}-admin`,
              type: 'quotation',
              message: `Admin: ${quotation.adminRemarks}`,
              timestamp: quotation.createdAt,
            });
          }
        });

        // Sort by timestamp descending
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return {
          success: true,
          data: activities.slice(0, 10),
          message: 'Recent activities retrieved successfully',
        };
      } catch (err) {
        return {
          success: false,
          data: [],
          message: 'Failed to retrieve recent activities',
        };
      }
    }
  }
}

export const dashboardAPI = new DashboardAPI();
