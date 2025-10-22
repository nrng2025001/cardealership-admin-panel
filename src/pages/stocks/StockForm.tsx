// Stock Form Component
// This file contains the form for adding/editing stock items

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { StockItem } from '@/api/types';
import { STOCK_STATUSES } from '@/utils/constants';

interface StockFormProps {
  stockItem?: StockItem | null;
  onSave: (data: Partial<StockItem>) => void;
  onCancel: () => void;
}

export const StockForm: React.FC<StockFormProps> = ({
  stockItem,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    vehicleModel: '',
    brand: '',
    year: new Date().getFullYear(),
    color: '',
    quantity: 1,
    price: 0,
    vin: '',
    status: 'available' as 'available' | 'reserved' | 'sold',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (stockItem) {
      setFormData({
        vehicleModel: stockItem.vehicleModel,
        brand: stockItem.brand,
        year: stockItem.year,
        color: stockItem.color,
        quantity: stockItem.quantity,
        price: stockItem.price,
        vin: stockItem.vin,
        status: stockItem.status,
      });
    }
  }, [stockItem]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicleModel.trim()) {
      newErrors.vehicleModel = 'Vehicle model is required';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }

    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Please enter a valid year';
    }

    if (!formData.color.trim()) {
      newErrors.color = 'Color is required';
    }

    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity must be 0 or greater';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.vin.trim()) {
      newErrors.vin = 'VIN is required';
    } else if (formData.vin.length !== 17) {
      newErrors.vin = 'VIN must be exactly 17 characters';
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
            label="Vehicle Model"
            value={formData.vehicleModel}
            onChange={(e) => handleChange('vehicleModel', e.target.value)}
            error={!!errors.vehicleModel}
            helperText={errors.vehicleModel}
            required
          />
        </Box>
        
        <Box>
          <TextField
            fullWidth
            label="Brand"
            value={formData.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            error={!!errors.brand}
            helperText={errors.brand}
            required
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Year"
            type="number"
            value={formData.year}
            onChange={(e) => handleChange('year', parseInt(e.target.value) || 0)}
            error={!!errors.year}
            helperText={errors.year}
            required
            inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Color"
            value={formData.color}
            onChange={(e) => handleChange('color', e.target.value)}
            error={!!errors.color}
            helperText={errors.color}
            required
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
            error={!!errors.quantity}
            helperText={errors.quantity}
            required
            inputProps={{ min: 0 }}
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Price"
            type="number"
            value={formData.price}
            onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
            error={!!errors.price}
            helperText={errors.price}
            required
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Box>

        <Box sx={{ gridColumn: '1 / -1' }}>
          <TextField
            fullWidth
            label="VIN (Vehicle Identification Number)"
            value={formData.vin}
            onChange={(e) => handleChange('vin', e.target.value.toUpperCase())}
            error={!!errors.vin}
            helperText={errors.vin}
            required
            inputProps={{ maxLength: 17 }}
          />
        </Box>

        <Box sx={{ gridColumn: '1 / -1' }}>
          <FormControl fullWidth required error={!!errors.status}>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              label="Status"
            >
              {STOCK_STATUSES.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
            {errors.status && <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 2 }}>{errors.status}</Box>}
          </FormControl>
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
              {stockItem ? 'Update Stock Item' : 'Create Stock Item'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

