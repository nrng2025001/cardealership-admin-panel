// Booking Form Component
// This file contains the form for adding/editing bookings

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Typography,
  Avatar,
  ListItemText,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { Booking, Vehicle } from '@/api/types';
import { isValidEmail, isValidPhone } from '@/utils/formatters';
import { stockAPI } from '@/api/stocks';
import { employeeAPI } from '@/api/employees';

interface BookingFormProps {
  booking?: Booking | null;
  onSave: (data: Partial<Booking>) => void;
  onCancel: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  booking,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    variant: '',
    color: '',
    dealerCode: 'TATA001', // Default dealer code
    expectedDeliveryDate: '',
    financeRequired: false,
    financerName: '',
    advisorId: '',
    zone: '',
    region: '',
    advisorRemarks: '',
    teamLeadRemarks: '',
    salesManagerRemarks: '',
    generalManagerRemarks: '',
    adminRemarks: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [loadingAdvisors, setLoadingAdvisors] = useState(false);

  // Fetch available vehicles on mount
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoadingVehicles(true);
      try {
        const response = await stockAPI.getVehicles({ limit: 200 });
        // Extract vehicles from paginated response
        if (response.data && response.data.vehicles) {
          setVehicles(response.data.vehicles || []);
        } else if (Array.isArray(response.data)) {
          setVehicles(response.data);
        }
      } catch (error) {
        console.error('Failed to load vehicles:', error);
        // Set some default TATA variants if API fails
        setVehicles([]);
      } finally {
        setLoadingVehicles(false);
      }
    };
    fetchVehicles();
  }, []);

  // Fetch available advisors on mount
  useEffect(() => {
    const fetchAdvisors = async () => {
      setLoadingAdvisors(true);
      try {
        console.log('📊 [BOOKING FORM] Fetching advisors...');
        const response = await employeeAPI.getUsers({ 
          role: 'CUSTOMER_ADVISOR',
          isActive: true,
          limit: 100 
        });
        
        const advisorList = response.data?.users || [];
        console.log('✅ [BOOKING FORM] Loaded advisors:', advisorList.length);
        setAdvisors(advisorList);
      } catch (error) {
        console.error('❌ [BOOKING FORM] Failed to load advisors:', error);
        setAdvisors([]);
      } finally {
        setLoadingAdvisors(false);
      }
    };
    fetchAdvisors();
  }, []);

  // Load booking data if editing
  useEffect(() => {
    if (booking) {
      setFormData({
        customerName: booking.customerName,
        customerEmail: booking.customerEmail || '',
        customerPhone: booking.customerPhone,
        variant: booking.variant || '',
        color: booking.color || '',
        dealerCode: booking.dealerCode || 'TATA001',
        expectedDeliveryDate: booking.expectedDeliveryDate || '',
        financeRequired: booking.financeRequired || false,
        financerName: booking.financerName || '',
        advisorId: booking.advisorId || '',
        zone: booking.zone || '',
        region: booking.region || '',
        advisorRemarks: booking.advisorRemarks || '',
        teamLeadRemarks: booking.teamLeadRemarks || '',
        salesManagerRemarks: booking.salesManagerRemarks || '',
        generalManagerRemarks: booking.generalManagerRemarks || '',
        adminRemarks: booking.adminRemarks || '',
      });
    }
  }, [booking]);

  // Update available colors when variant changes
  useEffect(() => {
    if (formData.variant) {
      const selectedVehicles = vehicles.filter(v => v.variant === formData.variant);
      const colors = [...new Set(selectedVehicles.map(v => v.color).filter(Boolean))];
      
      // When editing, ensure the current color is in the list even if vehicle is out of stock
      if (formData.color && !colors.includes(formData.color)) {
        colors.unshift(formData.color); // Add existing color at the beginning
      }
      
      setAvailableColors(colors);
    } else {
      setAvailableColors([]);
    }
  }, [formData.variant, vehicles, formData.color]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Customer email is required';
    } else if (!isValidEmail(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Customer phone is required';
    } else if (!isValidPhone(formData.customerPhone)) {
      newErrors.customerPhone = 'Please enter a valid phone number';
    }

    if (!formData.variant.trim()) {
      newErrors.variant = 'Vehicle variant is required';
    }

    if (!formData.dealerCode.trim()) {
      newErrors.dealerCode = 'Dealer code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
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
            label="Customer Name"
            value={formData.customerName}
            onChange={(e) => handleChange('customerName', e.target.value)}
            error={!!errors.customerName}
            helperText={errors.customerName}
            required
          />
        </Box>
        
        <Box>
          <TextField
            fullWidth
            label="Customer Email"
            type="email"
            value={formData.customerEmail}
            onChange={(e) => handleChange('customerEmail', e.target.value)}
            error={!!errors.customerEmail}
            helperText={errors.customerEmail}
            required
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Customer Phone"
            value={formData.customerPhone}
            onChange={(e) => handleChange('customerPhone', e.target.value)}
            error={!!errors.customerPhone}
            helperText={errors.customerPhone}
            required
          />
        </Box>

        <Box>
          <FormControl fullWidth required error={!!errors.variant}>
            <InputLabel>Vehicle Variant</InputLabel>
            <Select
              value={formData.variant}
              onChange={(e) => {
                handleChange('variant', e.target.value);
                // Reset color when variant changes
                handleChange('color', '');
              }}
              label="Vehicle Variant"
              disabled={loadingVehicles}
            >
              {loadingVehicles ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading variants...
                </MenuItem>
              ) : (
                [
                  ...[...new Set(vehicles.map(v => v.variant))].map((variant) => (
                    <MenuItem key={variant} value={variant}>
                      {variant}
                    </MenuItem>
                  )),
                  ...(vehicles.length === 0 ? [
                    <MenuItem key="no-vehicles" disabled>No vehicles available</MenuItem>
                  ] : [])
                ]
              )}
            </Select>
            {errors.variant && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 2 }}>
                {errors.variant}
              </Box>
            )}
          </FormControl>
        </Box>

        <Box>
          <FormControl fullWidth disabled={!formData.variant}>
            <InputLabel>Color (Optional)</InputLabel>
            <Select
              value={formData.color}
              onChange={(e) => handleChange('color', e.target.value)}
              label="Color (Optional)"
            >
              {[
                <MenuItem key="none" value="">
                  <em>None</em>
                </MenuItem>,
                ...availableColors.map((color) => (
                  <MenuItem key={color} value={color}>
                    {color}
                  </MenuItem>
                )),
                ...(!formData.variant ? [
                  <MenuItem key="select-variant" disabled>Select a variant first</MenuItem>
                ] : []),
                ...(formData.variant && availableColors.length === 0 ? [
                  <MenuItem key="no-colors" disabled>No colors available</MenuItem>
                ] : [])
              ]}
            </Select>
          </FormControl>
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Dealer Code"
            value={formData.dealerCode}
            onChange={(e) => handleChange('dealerCode', e.target.value)}
            error={!!errors.dealerCode}
            helperText={errors.dealerCode}
            required
            placeholder="e.g., TATA001"
          />
        </Box>

        <Box>
          <FormControl fullWidth>
            <InputLabel>Assign to Advisor (Optional)</InputLabel>
            <Select
              value={formData.advisorId}
              onChange={(e) => handleChange('advisorId', e.target.value)}
              label="Assign to Advisor (Optional)"
              disabled={loadingAdvisors}
            >
              <MenuItem value="">
                <em>Not Assigned</em>
              </MenuItem>
              {loadingAdvisors ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading advisors...
                </MenuItem>
              ) : (
                advisors.map((advisor) => (
                  <MenuItem key={advisor.firebaseUid} value={advisor.firebaseUid}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        {advisor.name?.[0] || <PersonIcon />}
                      </Avatar>
                      <ListItemText
                        primary={advisor.name}
                        secondary={advisor.email}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </Box>
                  </MenuItem>
                ))
              )}
              {!loadingAdvisors && advisors.length === 0 && (
                <MenuItem disabled>No advisors available</MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Expected Delivery Date"
            type="date"
            value={formData.expectedDeliveryDate}
            onChange={(e) => handleChange('expectedDeliveryDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Box>
          <FormControl fullWidth>
            <InputLabel>Finance Required</InputLabel>
            <Select
              value={formData.financeRequired ? 'yes' : 'no'}
              onChange={(e) => handleChange('financeRequired', e.target.value === 'yes')}
              label="Finance Required"
            >
              <MenuItem value="no">No</MenuItem>
              <MenuItem value="yes">Yes</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {formData.financeRequired && (
          <Box>
            <TextField
              fullWidth
              label="Financer Name"
              value={formData.financerName}
              onChange={(e) => handleChange('financerName', e.target.value)}
              placeholder="e.g., HDFC Bank"
            />
          </Box>
        )}

        <Box>
          <TextField
            fullWidth
            label="Zone (Optional)"
            value={formData.zone}
            onChange={(e) => handleChange('zone', e.target.value)}
            placeholder="e.g., North"
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Region (Optional)"
            value={formData.region}
            onChange={(e) => handleChange('region', e.target.value)}
            placeholder="e.g., Delhi NCR"
          />
        </Box>

        {/* Remarks Section */}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'primary.main' }}>
            Remarks (Optional)
          </Typography>
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Advisor Remarks"
            value={formData.advisorRemarks}
            onChange={(e) => handleChange('advisorRemarks', e.target.value)}
            multiline
            rows={3}
            placeholder="Add advisor remarks..."
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Team Lead Remarks"
            value={formData.teamLeadRemarks}
            onChange={(e) => handleChange('teamLeadRemarks', e.target.value)}
            multiline
            rows={3}
            placeholder="Add team lead remarks..."
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Sales Manager Remarks"
            value={formData.salesManagerRemarks}
            onChange={(e) => handleChange('salesManagerRemarks', e.target.value)}
            multiline
            rows={3}
            placeholder="Add sales manager remarks..."
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="General Manager Remarks"
            value={formData.generalManagerRemarks}
            onChange={(e) => handleChange('generalManagerRemarks', e.target.value)}
            multiline
            rows={3}
            placeholder="Add general manager remarks..."
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Admin Remarks"
            value={formData.adminRemarks}
            onChange={(e) => handleChange('adminRemarks', e.target.value)}
            multiline
            rows={3}
            placeholder="Add admin remarks..."
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
              {booking ? 'Update Booking' : 'Create Booking'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

