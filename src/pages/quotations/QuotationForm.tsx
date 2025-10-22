// Quotation Form Component
// This file contains the form for adding/editing quotations

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Grid,
} from '@mui/material';
import { Quotation } from '@/api/types';
import { QUOTATION_STATUSES } from '@/utils/constants';
import { formatCurrency } from '@/utils/formatters';

interface QuotationFormProps {
  quotation?: Quotation | null;
  onSave: (data: Partial<Quotation>) => void;
  onCancel: () => void;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({
  quotation,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    enquiryId: '',
    vehicleId: '',
    customerName: '',
    vehicleModel: '',
    price: 0,
    discount: 0,
    finalPrice: 0,
    validUntil: '',
    status: 'draft' as Quotation['status'],
    createdBy: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (quotation) {
      setFormData({
        enquiryId: quotation.enquiryId,
        vehicleId: quotation.vehicleId,
        customerName: quotation.customerName,
        vehicleModel: quotation.vehicleModel,
        price: quotation.price,
        discount: quotation.discount || 0,
        finalPrice: quotation.finalPrice,
        validUntil: quotation.validUntil,
        status: quotation.status,
        createdBy: quotation.createdBy,
        notes: quotation.notes || '',
      });
    } else {
      // Set default valid until date (30 days from now)
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      setFormData(prev => ({
        ...prev,
        validUntil: defaultDate.toISOString().split('T')[0],
      }));
    }
  }, [quotation]);

  // Calculate final price when price or discount changes
  useEffect(() => {
    const finalPrice = Math.max(0, formData.price - formData.discount);
    setFormData(prev => ({ ...prev, finalPrice }));
  }, [formData.price, formData.discount]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.enquiryId.trim()) {
      newErrors.enquiryId = 'Enquiry ID is required';
    }

    if (!formData.vehicleId.trim()) {
      newErrors.vehicleId = 'Vehicle ID is required';
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.vehicleModel.trim()) {
      newErrors.vehicleModel = 'Vehicle model is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.discount < 0) {
      newErrors.discount = 'Discount cannot be negative';
    }

    if (formData.discount >= formData.price) {
      newErrors.discount = 'Discount cannot be greater than or equal to price';
    }

    if (!formData.validUntil) {
      newErrors.validUntil = 'Valid until date is required';
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
            label="Enquiry ID"
            value={formData.enquiryId}
            onChange={(e) => handleChange('enquiryId', e.target.value)}
            error={!!errors.enquiryId}
            helperText={errors.enquiryId}
            required
            placeholder="e.g., ENQ001"
          />
        </Box>
        
        <Box>
          <TextField
            fullWidth
            label="Vehicle ID"
            value={formData.vehicleId}
            onChange={(e) => handleChange('vehicleId', e.target.value)}
            error={!!errors.vehicleId}
            helperText={errors.vehicleId}
            required
            placeholder="e.g., STK001"
          />
        </Box>

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
            label="Vehicle Model"
            value={formData.vehicleModel}
            onChange={(e) => handleChange('vehicleModel', e.target.value)}
            error={!!errors.vehicleModel}
            helperText={errors.vehicleModel}
            required
          />
        </Box>

        <Box sx={{ gridColumn: '1 / -1' }}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Pricing Details
          </Typography>
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Base Price"
            type="number"
            value={formData.price}
            onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
            error={!!errors.price}
            helperText={errors.price}
            required
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Discount"
            type="number"
            value={formData.discount}
            onChange={(e) => handleChange('discount', parseFloat(e.target.value) || 0)}
            error={!!errors.discount}
            helperText={errors.discount}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Box>

        <Box sx={{ gridColumn: '1 / -1' }}>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'grey.50', 
            borderRadius: 1, 
            border: '1px solid', 
            borderColor: 'grey.200' 
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Final Price: {formatCurrency(formData.finalPrice)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Base Price: {formatCurrency(formData.price)} - Discount: {formatCurrency(formData.discount)}
            </Typography>
          </Box>
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Valid Until"
            type="date"
            value={formData.validUntil}
            onChange={(e) => handleChange('validUntil', e.target.value)}
            error={!!errors.validUntil}
            helperText={errors.validUntil}
            required
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Box>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              label="Status"
            >
              {QUOTATION_STATUSES.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ gridColumn: '1 / -1' }}>
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Additional notes about the quotation..."
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
              {quotation ? 'Update Quotation' : 'Create Quotation'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};



