// Application constants
// This file contains all constants used throughout the application

import type { EmployeeRole } from '@/api/types';

/**
 * Employee roles in hierarchy order (highest to lowest)
 */
export const EMPLOYEE_ROLES: EmployeeRole[] = [
  'Admin',
  'General Manager',
  'Sales Manager', 
  'Team Lead',
  'Advisor'
];

/**
 * Employee role hierarchy mapping
 */
export const ROLE_HIERARCHY: Record<EmployeeRole, EmployeeRole[]> = {
  'Admin': ['General Manager', 'Sales Manager', 'Team Lead', 'Advisor'],
  'General Manager': ['Sales Manager', 'Team Lead', 'Advisor'],
  'Sales Manager': ['Team Lead', 'Advisor'],
  'Team Lead': ['Advisor'],
  'Advisor': []
};

/**
 * Navigation menu items
 * Updated to use backend RoleName types
 */
export const NAVIGATION_ITEMS = [
  {
    label: 'Dashboard',
    path: '/',
    icon: 'Dashboard',
    roles: ['ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER', 'TEAM_LEAD', 'CUSTOMER_ADVISOR']
  },
  {
    label: 'User Management',
    path: '/admin/users',
    icon: 'ManageAccounts',
    roles: ['ADMIN']
  },
  {
    label: 'Dealerships',
    path: '/admin/dealerships',
    icon: 'Business',
    roles: ['ADMIN']
  },
  {
    label: 'Bulk Upload',
    path: '/admin/bulk-upload',
    icon: 'CloudUpload',
    roles: ['ADMIN', 'GENERAL_MANAGER']
  },
  {
    label: 'Employees',
    path: '/employees',
    icon: 'People',
    roles: ['ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER']
  },
  {
    label: 'Stocks',
    path: '/stocks',
    icon: 'Inventory',
    roles: ['ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER', 'TEAM_LEAD']
  },
  {
    label: 'Bookings',
    path: '/bookings',
    icon: 'Event',
    roles: ['ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER', 'TEAM_LEAD', 'CUSTOMER_ADVISOR']
  },
  {
    label: 'Enquiries',
    path: '/enquiries',
    icon: 'QuestionAnswer',
    roles: ['ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER', 'TEAM_LEAD', 'CUSTOMER_ADVISOR']
  },
  {
    label: 'Quotations',
    path: '/quotations',
    icon: 'Description',
    roles: ['ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER', 'TEAM_LEAD', 'CUSTOMER_ADVISOR']
  },
  {
    label: 'Hierarchy',
    path: '/hierarchy',
    icon: 'AccountTree',
    roles: ['ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER']
  }
];

/**
 * Status options for different entities
 * IMPORTANT: These match the backend Prisma enums exactly
 */
export const BOOKING_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' },
  { value: 'WAITLISTED', label: 'Waitlisted' },
  { value: 'RESCHEDULED', label: 'Rescheduled' },
  { value: 'BACK_ORDER', label: 'Back Order' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' }
];

export const ENQUIRY_STATUSES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'CLOSED', label: 'Closed' }
];

export const ENQUIRY_CATEGORIES = [
  { value: 'HOT', label: 'Hot (High Priority)' },
  { value: 'LOST', label: 'Lost' },
  { value: 'BOOKED', label: 'Booked (Converted)' }
];

export const QUOTATION_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' }
];

export const STOCK_STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'sold', label: 'Sold' }
];

export const EMPLOYEE_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

/**
 * Table pagination options
 */
export const PAGINATION_OPTIONS = [5, 10, 25, 50, 100];

/**
 * Default page size
 */
export const DEFAULT_PAGE_SIZE = 10;

/**
 * Chart colors
 */
export const CHART_COLORS = [
  '#1976d2', // Primary blue
  '#388e3c', // Success green
  '#f57c00', // Warning orange
  '#d32f2f', // Error red
  '#7b1fa2', // Purple
  '#0097a7', // Cyan
  '#ff5722', // Deep orange
  '#795548', // Brown
];

/**
 * Application theme colors
 */
export const THEME_COLORS = {
  primary: '#1976d2',
  secondary: '#dc004e',
  success: '#388e3c',
  warning: '#f57c00',
  error: '#d32f2f',
  info: '#0288d1',
};

/**
 * API endpoints (placeholder)
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh'
  },
  EMPLOYEES: {
    BASE: '/employees',
    BY_ID: (id: string) => `/employees/${id}`,
    BY_ROLE: '/employees/by-role'
  },
  STOCKS: {
    BASE: '/stocks',
    BY_ID: (id: string) => `/stocks/${id}`,
    BRANDS: '/stocks/brands'
  },
  BOOKINGS: {
    BASE: '/bookings',
    BY_ID: (id: string) => `/bookings/${id}`,
    UPDATE_STATUS: (id: string) => `/bookings/${id}/status`
  },
  ENQUIRIES: {
    BASE: '/enquiries',
    BY_ID: (id: string) => `/enquiries/${id}`,
    ASSIGN: (id: string) => `/enquiries/${id}/assign`,
    UPDATE_STATUS: (id: string) => `/enquiries/${id}/status`
  },
  QUOTATIONS: {
    BASE: '/quotations',
    BY_ID: (id: string) => `/quotations/${id}`,
    UPDATE_STATUS: (id: string) => `/quotations/${id}/status`,
    SEND: (id: string) => `/quotations/${id}/send`,
    EXPORT: (id: string) => `/quotations/${id}/export`
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    REVENUE_CHART: '/dashboard/revenue-chart',
    SALES_PERFORMANCE: '/dashboard/sales-performance',
    RECENT_ACTIVITIES: '/dashboard/recent-activities'
  }
};
