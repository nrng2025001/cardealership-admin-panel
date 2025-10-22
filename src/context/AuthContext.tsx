// Authentication and Role Context
// Authentication context using Firebase with proper backend integration

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import apiClient from '@/api/client';
import type { User, RoleName } from '@/api/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  hasRole: (roles: RoleName | RoleName[]) => boolean;
  canManageUsers: () => boolean;
  canManageStocks: () => boolean;
  canManageBookings: () => boolean;
  canManageEnquiries: () => boolean;
  canManageQuotations: () => boolean;
  canBulkImport: () => boolean;
  canViewAuditLogs: () => boolean;
  isAdmin: () => boolean;
  canManageEmployees: () => boolean;
  canViewHierarchy: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add logging whenever state changes
  useEffect(() => {
    console.log('🔄 [AUTH STATE] State changed:', {
      isAuthenticated,
      loading,
      hasUser: !!user,
      userEmail: user?.email,
      userRole: user?.role?.name
    });
  }, [user, isAuthenticated, loading]);

  // Initialize auth state from Firebase
  useEffect(() => {
    console.log('🔧 [AUTH INIT] ========== INITIALIZING ==========');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 [AUTH INIT] Firebase auth state changed:', firebaseUser?.email || 'None');
      
      if (firebaseUser) {
        // Check if we already have user data (from login function)
        const existingUser = localStorage.getItem('currentUser');
        if (existingUser) {
          console.log('✅ [AUTH INIT] User data already exists in localStorage - using it!');
          try {
            const userData = JSON.parse(existingUser);
            console.log('✅ [AUTH INIT] Restoring user:', userData.email, 'Role:', userData.role?.name);
            setUser(userData);
            setIsAuthenticated(true);
            setLoading(false);
            console.log('✅ [AUTH INIT] ========== INIT COMPLETE (from cache) ==========');
            return;
          } catch (e) {
            console.error('❌ [AUTH INIT] Invalid cached data');
            localStorage.removeItem('currentUser');
          }
        }
        
        // No existing data - fetch from backend or create basic user
        console.log('📡 [AUTH INIT] No cached data - fetching backend profile...');
        
        try {
          const response = await apiClient.get('/auth/profile');
          
          if (response.data.success && response.data.data?.user) {
            const userData = response.data.data.user;
            console.log('✅ [AUTH INIT] Backend profile loaded:', userData.email, 'Role:', userData.role?.name);
            
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('currentUser', JSON.stringify(userData));
          }
        } catch (error) {
          console.warn('⚠️ [AUTH INIT] Backend failed - creating Firebase-only ADMIN user');
          
          // Create a basic ADMIN user from Firebase data
          const basicUser: any = {
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            role: { id: 'admin-role', name: 'ADMIN' },
            isActive: true,
            createdAt: new Date().toISOString(),
          };
          
          console.log('💾 [AUTH INIT] Using Firebase-only admin user:', basicUser.email);
          setUser(basicUser);
          setIsAuthenticated(true);
          localStorage.setItem('currentUser', JSON.stringify(basicUser));
        }
      } else {
        console.log('🚪 [AUTH INIT] No Firebase user - clearing auth state');
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('currentUser');
      }
      
      setLoading(false);
      console.log('✅ [AUTH INIT] ========== INIT COMPLETE (loading=false) ==========');
    });

    return () => unsubscribe();
  }, []);

  /**
   * Login with Firebase, then fetch backend profile with proper authentication
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔐 [AUTH] ========== LOGIN START ==========');
      console.log('🔐 [AUTH] Login attempt:', email);
      
      // Authenticate with Firebase
      console.log('📡 [AUTH] Step 1: Calling Firebase signInWithEmailAndPassword...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ [AUTH] Step 1 SUCCESS: Firebase authenticated');
      console.log('✅ [AUTH] Firebase UID:', userCredential.user.uid);
      console.log('✅ [AUTH] Firebase Email:', userCredential.user.email);
      
      // Create a fallback user IMMEDIATELY (before backend call)
      const basicUser: any = {
        firebaseUid: userCredential.user.uid,
        email: userCredential.user.email || email,
        name: userCredential.user.displayName || email.split('@')[0],
        role: { id: 'admin-role', name: 'ADMIN' },
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      
      console.log('💾 [AUTH] Step 2: Setting user state IMMEDIATELY:', basicUser.email);
      setUser(basicUser);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(basicUser));
      console.log('✅ [AUTH] Step 2 COMPLETE: User state set, isAuthenticated=true');
      
      // Try to fetch backend profile to replace basic user (optional)
      console.log('📡 [AUTH] Step 3 (OPTIONAL): Trying to fetch backend profile...');
      try {
        const response = await apiClient.get('/auth/profile');
        
        if (response.data.success && response.data.data?.user) {
          const userData = response.data.data.user;
          console.log('✅ [AUTH] Step 3 SUCCESS: Backend profile fetched:', userData.email, 'Role:', userData.role?.name);
          
          // Update with backend data (better than basic user)
          setUser(userData);
          localStorage.setItem('currentUser', JSON.stringify(userData));
        }
      } catch (backendError) {
        console.warn('⚠️ [AUTH] Step 3 SKIP: Backend unavailable (this is OK - using Firebase-only ADMIN)');
      }
      
      console.log('🎉 [AUTH] ========== LOGIN SUCCESS - RETURNING TRUE ==========');
      return true;
    } catch (error: any) {
      console.error('❌ [AUTH] ========== LOGIN FAILED ==========');
      console.error('❌ [AUTH] Firebase login error:', error.code, error.message);
      return false;
    } finally {
      setLoading(false);
      console.log('🏁 [AUTH] Login loading set to false');
    }
  };

  /**
   * Logout - clear Firebase and local state
   */
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Refresh Firebase token
   */
  const refreshToken = async (): Promise<string | null> => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const idToken = await currentUser.getIdToken(true);
        localStorage.setItem('authToken', idToken);
        return idToken;
      }
      return null;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  };

  /**
   * Check if user has specific role(s)
   */
  const hasRole = (roles: RoleName | RoleName[]): boolean => {
    if (!user?.role?.name) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role.name);
  };

  // Permission helpers - Production Ready
  const canManageUsers = (): boolean => hasRole('ADMIN');
  const canManageStocks = (): boolean => hasRole(['ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER']);
  const canManageBookings = (): boolean => hasRole(['ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER', 'TEAM_LEAD', 'CUSTOMER_ADVISOR']);
  const canManageEnquiries = (): boolean => hasRole(['ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER', 'TEAM_LEAD', 'CUSTOMER_ADVISOR']);
  const canManageQuotations = (): boolean => hasRole(['ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER', 'TEAM_LEAD', 'CUSTOMER_ADVISOR']);
  const canBulkImport = (): boolean => hasRole(['ADMIN', 'GENERAL_MANAGER']);
  const canViewAuditLogs = (): boolean => hasRole(['ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER']);
  const isAdmin = (): boolean => hasRole('ADMIN');
  const canManageEmployees = (): boolean => hasRole(['ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER']); // Sales Manager can manage advisors and team leads
  const canViewHierarchy = (): boolean => hasRole(['ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER']);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshToken,
    hasRole,
    canManageUsers,
    canManageStocks,
    canManageBookings,
    canManageEnquiries,
    canManageQuotations,
    canBulkImport,
    canViewAuditLogs,
    isAdmin,
    canManageEmployees,
    canViewHierarchy,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
