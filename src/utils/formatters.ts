// Utility functions for formatting data
// This file contains helper functions for date, currency, and other formatting

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '-';
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date and time to readable string
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '-';
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '-';
  if (isNaN(amount)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '-';
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  return phone; // Return original if not standard format
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (text: string | null | undefined): string => {
  if (!text) return '-';
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string | null | undefined, maxLength: number): string => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Get status color for Material UI components
 */
export const getStatusColor = (status: string | null | undefined): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  if (!status) return 'default';
  switch (status.toLowerCase()) {
    // Success states
    case 'active':
    case 'confirmed':
    case 'delivered':
    case 'available':
    case 'approved':
    case 'completed':
    case 'booked':
    case 'vehicle_available':
      return 'success';
    
    // Pending/Warning states
    case 'pending':
    case 'new':
    case 'draft':
    case 'open':
    case 'waitlisted':
    case 'hot':
      return 'warning';
    
    // Error/Cancelled states
    case 'inactive':
    case 'cancelled':
    case 'rejected':
    case 'expired':
    case 'closed':
    case 'no_show':
    case 'lost':
    case 'vna':
      return 'error';
    
    // Info/In Progress states  
    case 'assigned':
    case 'in_progress':
    case 'reserved':
    case 'sent':
    case 'rescheduled':
    case 'back_order':
      return 'info';
    
    default:
      return 'default';
  }
};

/**
 * Generate initials from name
 */
export const getInitials = (name: string | null | undefined): string => {
  if (!name) return '??';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

