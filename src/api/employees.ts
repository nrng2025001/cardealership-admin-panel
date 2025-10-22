// Employee/User API Service
// This file contains all API calls related to employee/user management
// Integrated with backend API

import apiClient from './client';
import type { 
  User,
  Employee,
  CreateUserRequest,
  UserFilters,
  RoleName,
  ApiResponse,
  PaginatedResponse 
} from './types';

class EmployeeAPI {
  /**
   * Get all users with pagination and filtering (Admin/GM only)
   */
  async getUsers(params?: UserFilters) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await apiClient.get(`/auth/users?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get user by Firebase UID
   */
  async getUserById(firebaseUid: string): Promise<ApiResponse<User>> {
    const response = await apiClient.get(`/auth/users/${firebaseUid}`);
    return response.data;
  }

  /**
   * Create new user with credentials (Admin only)
   */
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    const response = await apiClient.post('/auth/users/create-with-credentials', userData);
    return response.data;
  }

  /**
   * Update user role (Admin only)
   */
  async updateUserRole(firebaseUid: string, roleName: RoleName): Promise<ApiResponse<User>> {
    const response = await apiClient.put(`/auth/users/${firebaseUid}/role`, { roleName });
    return response.data;
  }

  /**
   * Reset user password (Admin only)
   */
  async resetUserPassword(firebaseUid: string, newPassword: string): Promise<ApiResponse<void>> {
    const response = await apiClient.put(`/auth/users/${firebaseUid}/password`, { newPassword });
    return response.data;
  }

  /**
   * Deactivate user (Admin only)
   */
  async deactivateUser(firebaseUid: string): Promise<ApiResponse<User>> {
    const response = await apiClient.put(`/auth/users/${firebaseUid}/deactivate`);
    return response.data;
  }

  /**
   * Activate user (Admin only)
   */
  async activateUser(firebaseUid: string): Promise<ApiResponse<User>> {
    const response = await apiClient.put(`/auth/users/${firebaseUid}/activate`);
    return response.data;
  }

  /**
   * Assign manager to user (Admin/GM only)
   */
  async assignManager(firebaseUid: string, managerId: string | null): Promise<ApiResponse<User>> {
    const response = await apiClient.put(`/auth/users/${firebaseUid}/manager`, { managerId });
    return response.data;
  }

  /**
   * Delete user (Admin only) - CAUTION: This is a destructive operation
   */
  async deleteUser(firebaseUid: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/auth/users/${firebaseUid}`);
    return response.data;
  }

  // Legacy methods for backward compatibility with Employee interface
  async getEmployees(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<PaginatedResponse<Employee>> {
    const response = await this.getUsers({
      ...params,
      role: params?.role as RoleName,
      isActive: params?.status === 'active' ? true : params?.status === 'inactive' ? false : undefined,
    });

    // Convert User[] to Employee[] format for backward compatibility
    if (response.data && response.data.users) {
      const employees: Employee[] = response.data.users.map((user: User) => ({
        id: user.firebaseUid,
        name: user.name,
        email: user.email,
        phone: '', // Not available in User type
        role: this.mapRoleToEmployeeRole(user.role.name),
        department: this.mapRoleToDepartment(user.role.name),
        hireDate: user.createdAt,
        status: user.isActive ? 'active' as const : 'inactive' as const,
        managerId: (user as any).managerId || undefined,
        managerName: undefined, // Would need to be populated from a separate call if needed
      }));

      return {
        success: true,
        data: {
          employees,
          pagination: response.data.pagination,
        },
      } as any;
    }

    return response as any;
  }

  async getEmployeeById(id: string): Promise<ApiResponse<Employee>> {
    const response = await this.getUserById(id);
    
    if (response.data) {
      const user = response.data;
      const employee: Employee = {
        id: user.firebaseUid,
        name: user.name,
        email: user.email,
        phone: '',
        role: this.mapRoleToEmployeeRole(user.role.name),
        department: this.mapRoleToDepartment(user.role.name),
        hireDate: user.createdAt,
        status: user.isActive ? 'active' : 'inactive',
        managerId: (user as any).managerId || undefined,
        managerName: undefined,
      };

      return {
        ...response,
        data: employee,
      };
    }

    return response as any;
  }

  async createEmployee(employeeData: Omit<Employee, 'id' | 'hireDate'> & { password?: string }): Promise<ApiResponse<Employee>> {
    const userRequest: CreateUserRequest = {
      name: employeeData.name,
      email: employeeData.email,
      password: employeeData.password || 'TempPassword123!', // Use provided password or default
      roleName: this.mapEmployeeRoleToRoleName(employeeData.role),
    };

    const response = await this.createUser(userRequest);
    
    if (response.data) {
      const user = response.data;
      
      // Assign manager if provided
      if (employeeData.managerId) {
        try {
          await this.assignManager(user.firebaseUid, employeeData.managerId);
        } catch (err) {
          console.error('Failed to assign manager during employee creation:', err);
        }
      }
      
      const employee: Employee = {
        id: user.firebaseUid,
        name: user.name,
        email: user.email,
        phone: employeeData.phone,
        role: employeeData.role,
        department: employeeData.department,
        hireDate: user.createdAt,
        status: user.isActive ? 'active' : 'inactive',
        managerId: employeeData.managerId,
        managerName: undefined,
      };

      return {
        ...response,
        data: employee,
      };
    }

    return response as any;
  }

  async updateEmployee(id: string, employeeData: Partial<Employee>): Promise<ApiResponse<Employee>> {
    // Handle manager assignment
    if (employeeData.managerId !== undefined) {
      try {
        await this.assignManager(id, employeeData.managerId || null);
      } catch (err) {
        console.error('Failed to assign manager:', err);
        // Continue with other updates even if manager assignment fails
      }
    }

    // Handle role update
    if (employeeData.role) {
      const roleName = this.mapEmployeeRoleToRoleName(employeeData.role);
      const response = await this.updateUserRole(id, roleName);
      return response as any;
    }

    // If only manager was updated, fetch the updated user
    if (employeeData.managerId !== undefined && !employeeData.role) {
      return this.getEmployeeById(id);
    }

    // For other updates, we would need additional endpoints
    throw new Error('Only role and manager updates are currently supported via this method');
  }

  async deleteEmployee(id: string): Promise<ApiResponse<void>> {
    return this.deleteUser(id);
  }

  async getEmployeesByRole(): Promise<ApiResponse<Record<string, Employee[]>>> {
    // Use optimized backend endpoint that groups users by role efficiently
    const response = await apiClient.get('/auth/users/hierarchy');
    return response.data;
  }

  // Helper methods for role mapping
  private mapRoleToEmployeeRole(roleName: RoleName): Employee['role'] {
    const roleMap: Record<RoleName, Employee['role']> = {
      'ADMIN': 'Admin',
      'GENERAL_MANAGER': 'General Manager',
      'SALES_MANAGER': 'Sales Manager',
      'TEAM_LEAD': 'Team Lead',
      'CUSTOMER_ADVISOR': 'Advisor',
    };
    return roleMap[roleName] || 'Advisor';
  }

  private mapEmployeeRoleToRoleName(employeeRole: Employee['role']): RoleName {
    const roleMap: Record<Employee['role'], RoleName> = {
      'Admin': 'ADMIN',
      'General Manager': 'GENERAL_MANAGER',
      'Sales Manager': 'SALES_MANAGER',
      'Team Lead': 'TEAM_LEAD',
      'Advisor': 'CUSTOMER_ADVISOR',
    };
    return roleMap[employeeRole] || 'CUSTOMER_ADVISOR';
  }

  private mapRoleToDepartment(roleName: RoleName): string {
    const departmentMap: Record<RoleName, string> = {
      'ADMIN': 'Administration',
      'GENERAL_MANAGER': 'Management',
      'SALES_MANAGER': 'Sales',
      'TEAM_LEAD': 'Sales',
      'CUSTOMER_ADVISOR': 'Sales',
    };
    return departmentMap[roleName] || 'General';
  }
}

export const employeeAPI = new EmployeeAPI();
