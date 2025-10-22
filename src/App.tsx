// Main App Component with Routing
// This file sets up the main application with routing and authentication

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { theme } from '@/theme/theme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { MainLayout } from '@/layouts/MainLayout';
import { LoginPage } from '@/pages/LoginPage';

// Import page components
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { EmployeesPage } from '@/pages/employees/EmployeesPage';
import { StocksPage } from '@/pages/stocks/StocksPage';
import { BookingsPage } from '@/pages/bookings/BookingsPage';
import { EnquiriesPage } from '@/pages/enquiries/EnquiriesPage';
import { QuotationsPage } from '@/pages/quotations/QuotationsPage';
import { HierarchyPage } from '@/pages/hierarchy/HierarchyPage';
import { BulkUploadPage } from '@/pages/admin/BulkUploadPage';
import { UserManagementPage } from '@/pages/admin/UserManagementPage';
import { DealershipOnboardingPage } from '@/pages/dealership/DealershipOnboardingPage';
import { DealershipManagementPage } from '@/pages/dealership/DealershipManagementPage';

/**
 * Protected Route Component Props Interface
 * Defines the props for the ProtectedRoute component
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Redirects unauthenticated users to the login page
 * Shows loading state while checking authentication
 * @param children - The child components to render if authenticated
 * @returns JSX element or redirect to login
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  console.log('🔐 [PROTECTED ROUTE] Check:', {
    isAuthenticated,
    loading,
    hasUser: !!user,
    userEmail: user?.email,
    path: window.location.pathname
  });
  
  // Show loading state while checking authentication
  if (loading) {
    console.log('⏳ [PROTECTED ROUTE] Still loading auth state...');
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Box sx={{ mt: 2, fontSize: '1.1rem', color: 'text.secondary' }}>
            Loading...
          </Box>
        </Box>
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    console.log('❌ [PROTECTED ROUTE] Not authenticated - redirecting to login');
  } else {
    console.log('✅ [PROTECTED ROUTE] Authenticated - rendering protected content');
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

/**
 * AppRoutes Component
 * Defines all the application routes with authentication protection
 * Includes both public routes (login) and protected routes (dashboard, employees, etc.)
 * @returns JSX element containing all route definitions
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes - No authentication required */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Dealership Onboarding - Semi-protected */}
      <Route
        path="/dealership/onboarding"
        element={
          <ProtectedRoute>
            <DealershipOnboardingPage />
          </ProtectedRoute>
        }
      />
      
      {/* Dealership Edit */}
      <Route
        path="/dealership/edit/:id"
        element={
          <ProtectedRoute>
            <DealershipOnboardingPage />
          </ProtectedRoute>
        }
      />
      
      {/* Protected Routes - Require authentication */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <MainLayout>
              <EmployeesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/stocks"
        element={
          <ProtectedRoute>
            <MainLayout>
              <StocksPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <BookingsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/enquiries"
        element={
          <ProtectedRoute>
            <MainLayout>
              <EnquiriesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quotations"
        element={
          <ProtectedRoute>
            <MainLayout>
              <QuotationsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hierarchy"
        element={
          <ProtectedRoute>
            <MainLayout>
              <HierarchyPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bulk-upload"
        element={
          <ProtectedRoute>
            <MainLayout>
              <BulkUploadPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dealerships"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DealershipManagementPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <MainLayout>
              <UserManagementPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Catch all route - Redirect any unknown routes to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * Main App Component
 * Root component that sets up the application with:
 * - Material UI theme provider
 * - CSS baseline for consistent styling
 * - Authentication context provider
 * - React Router for navigation
 * - Main application routes
 * @returns JSX element containing the complete application structure
 */
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ minHeight: '100vh' }}>
            <AppRoutes />
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;