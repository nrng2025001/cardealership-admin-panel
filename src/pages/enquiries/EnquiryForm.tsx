// Enquiry Form Component
// This file contains the form for adding/editing enquiries

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
import { Enquiry } from '@/api/types';
import { ENQUIRY_STATUSES } from '@/utils/constants';
import { isValidEmail, isValidPhone } from '@/utils/formatters';

interface EnquiryFormProps {
  enquiry?: Enquiry | null;
  onSave: (data: Partial<Enquiry>) => void;
  onCancel: () => void;
}

export const EnquiryForm: React.FC<EnquiryFormProps> = ({
  enquiry,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerContact: '',
    requirement: '',
    budget: 0,
    preferredModel: '',
    status: 'OPEN' as Enquiry['status'],
    assignedEmployeeId: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (enquiry) {
      setFormData({
        customerName: enquiry.customerName,
        customerEmail: enquiry.customerEmail,
        customerContact: enquiry.customerContact,
        requirement: enquiry.requirement || '',
        budget: enquiry.budget || 0,
        preferredModel: enquiry.preferredModel || '',
        status: enquiry.status,
        assignedEmployeeId: enquiry.assignedEmployeeId || '',
        notes: enquiry.notes || '',
      });
    }
  }, [enquiry]);

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

    if (!formData.customerContact.trim()) {
      newErrors.customerContact = 'Customer contact is required';
    } else if (!isValidPhone(formData.customerContact)) {
      newErrors.customerContact = 'Please enter a valid phone number';
    }

    if (!formData.requirement.trim()) {
      newErrors.requirement = 'Requirement is required';
    }

    if (formData.budget < 0) {
      newErrors.budget = 'Budget must be 0 or greater';
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
            value={formData.customerContact}
            onChange={(e) => handleChange('customerContact', e.target.value)}
            error={!!errors.customerContact}
            helperText={errors.customerContact}
            required
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Budget"
            type="number"
            value={formData.budget}
            onChange={(e) => handleChange('budget', parseFloat(e.target.value) || 0)}
            error={!!errors.budget}
            helperText={errors.budget}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Box>

        <Box sx={{ gridColumn: '1 / -1' }}>
          <TextField
            fullWidth
            label="Customer Requirement"
            multiline
            rows={3}
            value={formData.requirement}
            onChange={(e) => handleChange('requirement', e.target.value)}
            error={!!errors.requirement}
            helperText={errors.requirement}
            required
            placeholder="Describe what the customer is looking for..."
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Preferred Model"
            value={formData.preferredModel}
            onChange={(e) => handleChange('preferredModel', e.target.value)}
            placeholder="e.g., Honda Civic, Toyota Camry"
          />
        </Box>

        <Box>
          <FormControl fullWidth>
            <InputLabel>Assigned Employee</InputLabel>
            <Select
              value={formData.assignedEmployeeId}
              onChange={(e) => handleChange('assignedEmployeeId', e.target.value)}
              label="Assigned Employee"
            >
              <MenuItem value="">Not assigned</MenuItem>
              <MenuItem value="EMP001">John Smith (General Manager)</MenuItem>
              <MenuItem value="EMP002">Sarah Johnson (Sales Manager)</MenuItem>
              <MenuItem value="EMP003">Mike Davis (Team Lead)</MenuItem>
              <MenuItem value="EMP004">Emily Wilson (Advisor)</MenuItem>
              <MenuItem value="EMP005">David Brown (Advisor)</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              label="Status"
            >
              {ENQUIRY_STATUSES.map((status) => (
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
            rows={2}
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Additional notes about the enquiry..."
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
              {enquiry ? 'Update Enquiry' : 'Create Enquiry'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};



