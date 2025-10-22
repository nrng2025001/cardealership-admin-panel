// API Types and Interfaces for Automotive Admin
// This file defines all the data structures used throughout the application
// Updated to match backend API structure

// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export interface User {
  firebaseUid: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserRole {
  id: string;
  name: RoleName;
}

export type RoleName =
  | 'ADMIN'
  | 'GENERAL_MANAGER'
  | 'SALES_MANAGER'
  | 'TEAM_LEAD'
  | 'CUSTOMER_ADVISOR';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  tokenType: 'custom' | 'firebase';
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roleName: RoleName;
}

// Legacy Employee type for backward compatibility
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  department: string;
  managerId?: string;
  managerName?: string;
  subordinateCount?: number;
  hireDate: string;
  status: 'active' | 'inactive';
}

export type EmployeeRole = 
  | 'Admin'
  | 'General Manager'
  | 'Sales Manager' 
  | 'Team Lead'
  | 'Advisor';

// ============================================
// STOCK/VEHICLE TYPES
// ============================================

export interface Vehicle {
  id: string;
  variant: string;
  vcCode: string;
  color: string;
  fuelType: string;
  transmission: string;
  dealerType: 'TATA' | 'Universal';
  exShowroomPrice: number;
  finalBillingPrice: number;
  onRoadPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateVehicleRequest {
  variant: string;
  vcCode: string;
  color: string;
  fuelType: string;
  transmission: string;
  dealerType: 'TATA' | 'Universal';
  exShowroomPrice: number;
  finalBillingPrice: number;
  onRoadPrice: number;
}

// Legacy StockItem for backward compatibility
export interface StockItem {
  id: string;
  vehicleModel: string;
  brand: string;
  year: number;
  color: string;
  quantity: number;
  price: number;
  vin: string;
  status: 'available' | 'reserved' | 'sold';
  addedDate: string;
}

// ============================================
// BOOKING TYPES
// ============================================

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  variant: string;
  color?: string;
  status: BookingStatus;
  stockAvailability?: StockAvailability;
  expectedDeliveryDate?: string;
  financeRequired?: boolean;
  financerName?: string;
  dealerCode: string;
  zone?: string;
  region?: string;
  advisorId?: string;
  advisor?: {
    firebaseUid: string;
    name: string;
    email: string;
    role?: {
      name: string;
    };
  };
  bookingDate?: string;
  fileLoginDate?: string;
  approvalDate?: string;
  rtoDate?: string;
  advisorRemarks?: string;
  teamLeadRemarks?: string;
  salesManagerRemarks?: string;
  generalManagerRemarks?: string;
  adminRemarks?: string;
  enquiry?: {
    id: string;
    customerName: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export type BookingStatus = 
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'CONFIRMED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'WAITLISTED'
  | 'RESCHEDULED'
  | 'BACK_ORDER'
  | 'APPROVED'
  | 'REJECTED';

export type StockAvailability = 
  | 'VNA'                 // Vehicle Not Available
  | 'VEHICLE_AVAILABLE';  // Vehicle Available

export interface CreateBookingRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  variant: string;
  color?: string;
  dealerCode: string;
  zone?: string;
  region?: string;
  expectedDeliveryDate?: string;
  financeRequired?: boolean;
  financerName?: string;
  stockAvailability?: StockAvailability;
  advisorId?: string;
}

export interface BookingAuditLog {
  id: string;
  action: string;
  changedBy: {
    name: string;
    email: string;
    role: UserRole;
  };
  oldValue?: any;
  newValue?: any;
  changeReason?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface BulkImportRequest {
  file: File;
  dealerCode: string;
}

export interface BulkImportResponse {
  id: string;
  fileName: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  createdAt: string;
  completedAt?: string;
}

// ============================================
// ENQUIRY TYPES
// ============================================

export interface Enquiry {
  id: string;
  customerName: string;
  customerContact: string;
  customerEmail?: string;
  model?: string;
  variant?: string;
  category: EnquiryCategory;
  status: EnquiryStatus;
  source?: string;
  createdBy?: {
    firebaseUid: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt?: string;
  _count?: {
    bookings: number;
    quotations: number;
  };
  // Legacy fields for backward compatibility
  requirement?: string;
  budget?: number;
  preferredModel?: string;
  assignedEmployeeId?: string;
  createdDate?: string;
  updatedDate?: string;
  notes?: string;
}

export type EnquiryCategory = 'HOT' | 'LOST' | 'BOOKED';
export type EnquiryStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

export interface CreateEnquiryRequest {
  customerName: string;
  customerContact: string;
  customerEmail?: string;
  model?: string;
  variant?: string;
  category?: EnquiryCategory;
  source?: string;
}

export interface EnquiryStats {
  total: number;
  byCategory: {
    HOT: number;
    LOST: number;
    BOOKED: number;
  };
  byStatus: {
    OPEN: number;
    CLOSED: number;
  };
}

// ============================================
// QUOTATION TYPES
// ============================================

export interface Quotation {
  id: string;
  enquiryId: string;
  amount: number;
  status: QuotationStatus;
  pdfUrl?: string;
  createdAt: string;
  updatedAt?: string;
  enquiry?: {
    id: string;
    customerName: string;
    customerContact: string;
    variant?: string;
  };
  // Legacy fields for backward compatibility
  vehicleId?: string;
  customerName?: string;
  vehicleModel?: string;
  price?: number;
  discount?: number;
  finalPrice?: number;
  validUntil?: string;
  createdDate?: string;
  createdBy?: string;
  notes?: string;
}

export type QuotationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SENT_TO_CUSTOMER';

export interface CreateQuotationRequest {
  enquiryId: string;
  amount: number;
  status?: QuotationStatus;
}

export interface QuotationStats {
  total: number;
  byStatus: {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    SENT_TO_CUSTOMER: number;
  };
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStats {
  totalEmployees: number;
  activeEnquiries: number;
  pendingQuotations: number;
  totalBookings: number;
  stockCount: number;
  revenue: number;
  // Additional stats from backend
  enquiryStats?: EnquiryStats;
  quotationStats?: QuotationStats;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// ============================================
// DEALERSHIP & MULTI-TENANT TYPES
// ============================================

export interface Dealership {
  id: string;
  name: string;
  code: string;
  type: 'TATA' | 'UNIVERSAL';
  
  // Contact Information
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  
  // Business Details
  gstNumber: string;
  panNumber: string;
  
  // Car Brands Sold
  brands: string[];
  
  // Status
  isActive: boolean;
  onboardingCompleted: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateDealershipRequest {
  name: string;
  code: string;
  type: 'TATA' | 'UNIVERSAL';
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber: string;
  panNumber: string;
  brands: string[];
}

export interface VehicleCatalog {
  id: string;
  dealershipId: string;
  brand: string;
  model: string;
  variants: VehicleVariant[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleVariant {
  id: string;
  name: string;
  vcCode: string;
  fuelTypes: string[];
  transmissions: string[];
  colors: VehicleColor[];
  exShowroomPrice: number;
  rtoCharges: number;
  insurance: number;
  accessories: number;
  onRoadPrice: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleColor {
  name: string;
  code: string;
  additionalCost: number;
  isAvailable: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: any; // Flexible to handle both T[] and pagination object
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Helper type for paginated data
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// FILTER & SEARCH TYPES
// ============================================

export interface BookingFilters extends PaginationParams {
  status?: BookingStatus;
  dealerCode?: string;
  advisorId?: string;
  timeline?: 'today' | 'delivery_today' | 'pending_update' | 'overdue';
}

export interface EnquiryFilters extends PaginationParams {
  category?: EnquiryCategory;
  status?: EnquiryStatus;
}

export interface QuotationFilters extends PaginationParams {
  status?: QuotationStatus;
}

export interface VehicleFilters extends PaginationParams {
  dealerType?: 'TATA' | 'Universal';
}

export interface UserFilters extends PaginationParams {
  role?: RoleName;
  isActive?: boolean;
}

