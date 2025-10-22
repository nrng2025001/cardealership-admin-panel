// Enquiries Page Component
// This file contains the main enquiries management page

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Add,
  FilterList,
  Search,
  MoreVert,
  Assignment,
  Person,
  Phone,
  Email,
  Schedule,
} from '@mui/icons-material';
import { DataTable, Column } from '@/components/tables/DataTable';
import { EnquiryForm } from './EnquiryForm';
import { FormDialog } from '@/components/forms/FormDialog';
import { DownloadButton } from '@/components/common/DownloadButton';
import { useAuth } from '@/context/AuthContext';
import { enquiryAPI } from '@/api/enquiries';
import type { Enquiry } from '@/api/types';
import { ENQUIRY_STATUSES } from '@/utils/constants';
import { formatDate, formatCurrency, getStatusColor } from '@/utils/formatters';

export const EnquiriesPage: React.FC = () => {
  const { user, canManageEnquiries } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadEnquiries();
  }, []);

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      console.log('📊 [ENQUIRIES] Fetching enquiries...');
      const response = await enquiryAPI.getEnquiries({ limit: 100 });
      
      // Handle paginated response
      if (response.data && response.data.enquiries) {
        console.log('✅ [ENQUIRIES] Loaded from API:', response.data.enquiries.length, 'items');
        setEnquiries(response.data.enquiries || []);
      } else if (Array.isArray(response.data)) {
        console.log('✅ [ENQUIRIES] Loaded from API:', response.data.length, 'items');
        setEnquiries(response.data);
      } else {
        console.log('⚠️ [ENQUIRIES] No data in response');
        setEnquiries([]);
      }
    } catch (error) {
      console.error('❌ [ENQUIRIES] API failed:', error);
      setEnquiries([]);
    } finally {
      setLoading(false);
      console.log('🏁 [ENQUIRIES] Load complete');
    }
  };

  const handleAddEnquiry = () => {
    setSelectedEnquiry(null);
    setFormOpen(true);
  };

  const handleEditEnquiry = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setFormOpen(true);
  };

  const handleFormSubmit = async (enquiryData: Partial<Enquiry>) => {
    try {
      if (selectedEnquiry) {
        // Update existing enquiry
        await enquiryAPI.updateEnquiry(selectedEnquiry.id, enquiryData);
      } else {
        // Add new enquiry
        await enquiryAPI.createEnquiry(enquiryData as Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt'>);
      }
      await loadEnquiries();
      setFormOpen(false);
    } catch (error) {
      console.error('Error saving enquiry:', error);
    }
  };

  const handleStatusChange = async (enquiry: Enquiry, newStatus: string) => {
    try {
      await enquiryAPI.updateEnquiry(enquiry.id, { status: newStatus });
      await loadEnquiries();
    } catch (error) {
      console.error('Error updating enquiry status:', error);
    }
  };

  const filteredEnquiries = statusFilter === 'all' 
    ? enquiries 
    : enquiries.filter(env => env.status === statusFilter);

  const columns: Column[] = [
    {
      id: 'customerName',
      label: 'Customer',
      minWidth: 150,
      sortable: true,
    },
    {
      id: 'customerEmail',
      label: 'Email',
      minWidth: 180,
      sortable: true,
    },
    {
      id: 'customerPhone',
      label: 'Phone',
      minWidth: 130,
    },
    {
      id: 'requirement',
      label: 'Requirement',
      minWidth: 200,
      render: (value: string) => (
        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || '-'}
        </Typography>
      ),
    },
    {
      id: 'budget',
      label: 'Budget',
      minWidth: 120,
      align: 'right',
      sortable: true,
      render: (value: number) => formatCurrency(value),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      sortable: true,
      render: (value: string) => (
        <Chip
          label={value ? value.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
          color={getStatusColor(value)}
          size="small"
        />
      ),
    },
    {
      id: 'createdAt',
      label: 'Created',
      minWidth: 120,
      sortable: true,
      render: (value: string) => formatDate(value),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assignment color="primary" />
            Enquiries Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage customer enquiries and track their progress
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <DownloadButton
            type="enquiries"
            onDownload={enquiryAPI.downloadEnquiries}
            availableCategories={['HOT', 'WARM', 'COLD']}
            availableStatuses={ENQUIRY_STATUSES.map(s => s.value)}
          />
          {canManageEnquiries() && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddEnquiry}
              size="large"
            >
              Add Enquiry
            </Button>
          )}
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="primary">
              {enquiries.filter(e => e.status === 'OPEN').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Open Enquiries
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Typography variant="h6" color="warning.main">
              {enquiries.filter(e => e.status === 'IN_PROGRESS').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              In Progress
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Typography variant="h6" color="success.main">
              {enquiries.filter(e => e.status === 'CLOSED').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Closed
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Typography variant="h6">
              {enquiries.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Enquiries
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filters and Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={(e) => setFilterAnchor(e.currentTarget)}
          >
            Filter by Status
          </Button>
          
          <Menu
            anchorEl={filterAnchor}
            open={Boolean(filterAnchor)}
            onClose={() => setFilterAnchor(null)}
          >
            <MenuItem onClick={() => { setStatusFilter('all'); setFilterAnchor(null); }}>
              All Statuses
            </MenuItem>
            {ENQUIRY_STATUSES.map(status => (
              <MenuItem 
                key={status.value} 
                onClick={() => { setStatusFilter(status.value); setFilterAnchor(null); }}
              >
                {status.label}
              </MenuItem>
            ))}
          </Menu>
          
          {statusFilter !== 'all' && (
            <Chip
              label={`Status: ${ENQUIRY_STATUSES.find(s => s.value === statusFilter)?.label}`}
              onDelete={() => setStatusFilter('all')}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {/* Data Table */}
      <DataTable
        data={filteredEnquiries}
        columns={columns}
        loading={loading}
        searchable
        searchPlaceholder="Search enquiries..."
        searchFields={['customerName', 'customerEmail', 'customerPhone', 'requirement']}
        onRowClick={(enquiry) => canManageEnquiries() && handleEditEnquiry(enquiry)}
      />

      {/* Form Dialog */}
      <FormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={selectedEnquiry ? 'Edit Enquiry' : 'Add New Enquiry'}
        maxWidth="md"
      >
        <EnquiryForm
          enquiry={selectedEnquiry}
          onSave={handleFormSubmit}
          onCancel={() => setFormOpen(false)}
        />
      </FormDialog>
    </Box>
  );
};

