// Employee Form Component
// This file contains the form for adding/editing employees

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Autocomplete,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Person, SupervisedUserCircle } from '@mui/icons-material';
import { Employee } from '@/api/types';
import { employeeAPI } from '@/api/employees';
import { EMPLOYEE_ROLES, EMPLOYEE_STATUSES } from '@/utils/constants';
import { isValidEmail, isValidPhone } from '@/utils/formatters';

interface EmployeeFormProps {
  employee?: Employee | null;
  onSave: (data: Partial<Employee>) => void;
  onCancel: () => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    managerId: '',
    status: 'active' as 'active' | 'inactive',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Employee | null>(null);

  // Fetch all employees for manager selection
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        console.log('📊 [EMPLOYEE FORM] Fetching employees for manager selection...');
        const response = await employeeAPI.getEmployees({ limit: 1000 });
        
        let employeeList: Employee[] = [];
        if (Array.isArray(response.data)) {
          employeeList = response.data;
        } else if (response.data && response.data.employees) {
          employeeList = response.data.employees;
        }
        
        console.log('✅ [EMPLOYEE FORM] Loaded employees:', employeeList.length);
        setAllEmployees(employeeList);
      } catch (err) {
        console.error('❌ [EMPLOYEE FORM] Failed to load employees:', err);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        department: employee.department,
        managerId: employee.managerId || '',
        status: employee.status,
      });
      
      // Find and set the selected manager
      if (employee.managerId) {
        const manager = allEmployees.find(emp => emp.id === employee.managerId);
        if (manager) {
          setSelectedManager(manager);
        }
      }
    }
  }, [employee, allEmployees]);

  const validateForm = () => {
    console.log('🔍 [EMPLOYEE FORM] Validating form...');
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    // Password validation only for new employees
    if (!employee) {
      console.log('🔐 [EMPLOYEE FORM] Validating password for new employee...');
      console.log('Password value:', formData.password ? '***' : '(empty)');
      console.log('Password length:', formData.password?.length || 0);
      
      if (!formData.password) {
        newErrors.password = 'Password is required for new employees';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }
    }

    console.log('Validation errors:', newErrors);
    console.log('Validation result:', Object.keys(newErrors).length === 0 ? 'PASS' : 'FAIL');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 [EMPLOYEE FORM] Form submitted');
    console.log('Form data:', formData);
    
    const isValid = validateForm();
    console.log('Form validation result:', isValid);
    
    if (isValid) {
      console.log('✅ [EMPLOYEE FORM] Validation passed, calling onSave...');
      onSave(formData);
    } else {
      console.log('❌ [EMPLOYEE FORM] Validation failed with errors:', errors);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
        <Box>
          <TextField
            fullWidth
            label="Full Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
        </Box>
        
        <Box>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            required
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={!!errors.phone}
            helperText={errors.phone}
            required
          />
        </Box>

        <Box>
          <FormControl fullWidth required error={!!errors.role}>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              label="Role"
            >
              {EMPLOYEE_ROLES.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
            {errors.role && <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 2 }}>{errors.role}</Box>}
          </FormControl>
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Department"
            value={formData.department}
            onChange={(e) => handleChange('department', e.target.value)}
            error={!!errors.department}
            helperText={errors.department}
            required
          />
        </Box>

        {/* Password field - only shown when creating new employee */}
        {!employee && (
          <Box>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={!!errors.password}
              helperText={errors.password || 'Min 8 characters, must include uppercase, lowercase, and number'}
              required
              placeholder="Enter employee password"
            />
          </Box>
        )}

        <Box>
          <FormControl fullWidth>
            <Autocomplete
              options={allEmployees.filter(emp => emp.id !== employee?.id)} // Don't allow self-reporting
              getOptionLabel={(option) => `${option.name} (${option.role})`}
              value={selectedManager}
              onChange={(event, newValue) => {
                setSelectedManager(newValue);
                handleChange('managerId', newValue?.id || '');
              }}
              loading={loadingEmployees}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Reports To (Manager/Superior)"
                  placeholder="Select a manager..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingEmployees ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                  <SupervisedUserCircle color="primary" />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {option.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.role} • {option.department} • ID: {option.id}
                    </Typography>
                  </Box>
                </Box>
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="No employees found"
            />
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {selectedManager 
              ? `Selected: ${selectedManager.name} (${selectedManager.role})`
              : 'Leave empty if this employee has no manager'}
          </Typography>
        </Box>

        <Box sx={{ gridColumn: '1 / -1' }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.status === 'active'}
                onChange={(e) => handleChange('status', e.target.checked ? 'active' : 'inactive')}
              />
            }
            label="Active Employee"
          />
        </Box>

        <Box sx={{ gridColumn: '1 / -1' }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
            >
              {employee ? 'Update Employee' : 'Create Employee'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

