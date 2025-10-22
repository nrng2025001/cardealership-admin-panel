// Employees Page Component
// This file contains the employees management page with CRUD operations

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  
  Grid,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Person,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { employeeAPI } from '@/api/employees';
import { Employee, PaginatedResponse } from '@/api/types';
import { DataTable, Column } from '@/components/tables/DataTable';
import { FormDialog } from '@/components/forms/FormDialog';
import { EmployeeForm } from './EmployeeForm';
import { formatDate, getInitials, getStatusColor } from '@/utils/formatters';
import { EMPLOYEE_ROLES, EMPLOYEE_STATUSES } from '@/utils/constants';

export const EmployeesPage: React.FC = () => {
  const { user, canManageEmployees } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 [EMPLOYEES] Fetching employees...');
      const response = await employeeAPI.getEmployees({ limit: 100 });
      
      // Handle both old array format and new paginated format
      if (Array.isArray(response.data)) {
        console.log('✅ [EMPLOYEES] Loaded from API:', response.data.length, 'items');
        setEmployees(response.data);
      } else if (response.data && response.data.employees) {
        console.log('✅ [EMPLOYEES] Loaded from API (paginated):', response.data.employees.length, 'items');
        setEmployees(response.data.employees);
      } else if (response.success && response.data) {
        console.log('✅ [EMPLOYEES] Loaded from API:', Array.isArray(response.data) ? response.data.length : 0, 'items');
        setEmployees(Array.isArray(response.data) ? response.data : []);
      } else {
        console.log('⚠️ [EMPLOYEES] No data in response');
        setEmployees([]);
      }
    } catch (err) {
      console.error('❌ [EMPLOYEES] API failed:', err);
      setError('Failed to load employees. Please check your connection and try again.');
      setEmployees([]);
    } finally {
      setLoading(false);
      console.log('🏁 [EMPLOYEES] Load complete');
    }
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setDialogOpen(true);
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    try {
      console.log('🗑️ [EMPLOYEES] Deleting employee:', employee.id, employee.name);
      await employeeAPI.deleteEmployee(employee.id);
      console.log('✅ [EMPLOYEES] Employee deleted successfully');
      setError(null);
      await fetchEmployees();
      setDeleteConfirm(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete employee';
      setError(errorMessage);
      console.error('❌ [EMPLOYEES] Error deleting employee:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data
      });
      setDeleteConfirm(null);
    }
  };

  const handleSaveEmployee = async (employeeData: Partial<Employee>) => {
    try {
      console.log('💾 [EMPLOYEES] Saving employee:', editingEmployee ? 'UPDATE' : 'CREATE');
      console.log('Employee data:', employeeData);
      
      if (editingEmployee) {
        console.log('Updating employee ID:', editingEmployee.id);
        await employeeAPI.updateEmployee(editingEmployee.id, employeeData);
        console.log('✅ [EMPLOYEES] Employee updated successfully');
      } else {
        console.log('Creating new employee...');
        const response = await employeeAPI.createEmployee(employeeData as any);
        console.log('✅ [EMPLOYEES] Employee created successfully:', response);
      }
      
      setError(null);
      await fetchEmployees();
      setDialogOpen(false);
      setEditingEmployee(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save employee';
      setError(errorMessage);
      console.error('❌ [EMPLOYEES] Error saving employee:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
    }
  };

  const columns: Column[] = [
    {
      id: 'avatar',
      label: '',
      minWidth: 60,
      align: 'center',
      render: (value: any, row: Employee) => (
        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.875rem' }}>
          {getInitials(row.name)}
        </Avatar>
      ),
    },
    {
      id: 'id',
      label: 'Employee ID',
      minWidth: 100,
      sortable: true,
    },
    {
      id: 'name',
      label: 'Name',
      minWidth: 150,
      sortable: true,
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 200,
      sortable: true,
    },
    {
      id: 'phone',
      label: 'Phone',
      minWidth: 120,
    },
    {
      id: 'role',
      label: 'Role',
      minWidth: 120,
      sortable: true,
      render: (value: string) => (
        <Chip
          label={value}
          color="primary"
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      id: 'department',
      label: 'Department',
      minWidth: 120,
      sortable: true,
    },
    {
      id: 'managerName',
      label: 'Reports To',
      minWidth: 150,
      sortable: true,
      render: (value: string, row: Employee) => {
        if (!row.managerId) {
          return <Chip label="No Manager" size="small" variant="outlined" />;
        }
        // Try to find the manager's name from the employees list
        const manager = employees.find(emp => emp.id === row.managerId);
        return (
          <Box>
            <Typography variant="body2">
              {manager ? manager.name : row.managerName || 'Unknown'}
            </Typography>
            {manager && (
              <Typography variant="caption" color="text.secondary">
                {manager.role}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      sortable: true,
      render: (value: string) => (
        <Chip
          label={value}
          color={getStatusColor(value)}
          size="small"
        />
      ),
    },
    {
      id: 'hireDate',
      label: 'Hire Date',
      minWidth: 120,
      sortable: true,
      render: (value: string) => formatDate(value),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 120,
      align: 'center',
      render: (value: any, row: Employee) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="Edit Employee">
            <IconButton
              size="small"
              onClick={() => handleEditEmployee(row)}
              disabled={!canManageEmployees()}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip 
            title={
              row.id === user?.id 
                ? "Cannot delete yourself" 
                : !canManageEmployees() 
                  ? "No permission to delete employees" 
                  : "Delete Employee"
            }
          >
            <span>
              <IconButton
                size="small"
                onClick={() => setDeleteConfirm(row)}
                disabled={!canManageEmployees() || row.id === user?.id}
                color="error"
              >
                <Delete fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Employees
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your team members and their roles
          </Typography>
        </Box>
        {canManageEmployees() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddEmployee}
          >
            Add Employee
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Employees Table */}
      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        searchable
        searchPlaceholder="Search employees..."
        searchFields={['name', 'email', 'id', 'department']}
      />

      {/* Add/Edit Employee Dialog */}
      <FormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingEmployee(null);
        }}
        onSubmit={() => {}} // Form submission handled by EmployeeForm
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
        maxWidth="md"
      >
        <EmployeeForm
          employee={editingEmployee}
          onSave={handleSaveEmployee}
          onCancel={() => {
            setDialogOpen(false);
            setEditingEmployee(null);
          }}
        />
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <FormDialog
        open={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        onSubmit={() => deleteConfirm && handleDeleteEmployee(deleteConfirm)}
        title="Delete Employee"
        submitText="Delete"
        cancelText="Cancel"
        maxWidth="sm"
      >
        <Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this employee?
          </Typography>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'error.50', 
            border: '1px solid',
            borderColor: 'error.main',
            borderRadius: 1,
            mb: 2 
          }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {deleteConfirm?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {deleteConfirm?.email} • {deleteConfirm?.role}
            </Typography>
          </Box>
          <Alert severity="warning">
            ⚠️ This action cannot be undone. The employee will be permanently removed from the system.
          </Alert>
        </Box>
      </FormDialog>
    </Box>
  );
};

