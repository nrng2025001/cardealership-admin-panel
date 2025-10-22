// Quotations Page Component
// This file contains the quotations management page with CRUD operations

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Description,
  Send,
  PictureAsPdf,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { quotationAPI } from '@/api/quotations';
import { Quotation, PaginatedResponse } from '@/api/types';
import { DataTable, Column } from '@/components/tables/DataTable';
import { FormDialog } from '@/components/forms/FormDialog';
import { QuotationForm } from './QuotationForm';
import { formatDate, getStatusColor, formatCurrency } from '@/utils/formatters';
import { QUOTATION_STATUSES } from '@/utils/constants';

export const QuotationsPage: React.FC = () => {
  const { canManageQuotations } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Quotation | null>(null);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 [QUOTATIONS] Fetching quotations...');
      const response = await quotationAPI.getQuotations({ limit: 100 });
      
      // Handle both old array format and new paginated format
      if (Array.isArray(response.data)) {
        console.log('✅ [QUOTATIONS] Loaded from API:', response.data.length, 'items');
        setQuotations(response.data);
      } else if (response.data && response.data.quotations) {
        console.log('✅ [QUOTATIONS] Loaded from API (paginated):', response.data.quotations.length, 'items');
        setQuotations(response.data.quotations || []);
      } else if (response.success && response.data) {
        console.log('✅ [QUOTATIONS] Loaded from API:', Array.isArray(response.data) ? response.data.length : 0, 'items');
        setQuotations(Array.isArray(response.data) ? response.data : []);
      } else {
        console.log('⚠️ [QUOTATIONS] No data in response');
        setQuotations([]);
      }
    } catch (err) {
      console.error('❌ [QUOTATIONS] API failed:', err);
      setError('Failed to load quotations. Please check your connection and try again.');
      setQuotations([]);
    } finally {
      setLoading(false);
      console.log('🏁 [QUOTATIONS] Load complete');
    }
  };

  const handleAddQuotation = () => {
    setEditingQuotation(null);
    setDialogOpen(true);
  };

  const handleEditQuotation = (quotation: Quotation) => {
    setEditingQuotation(quotation);
    setDialogOpen(true);
  };

  const handleDeleteQuotation = async (quotation: Quotation) => {
    try {
      await quotationAPI.deleteQuotation(quotation.id);
      await fetchQuotations();
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete quotation');
      console.error('Error deleting quotation:', err);
    }
  };

  const handleSaveQuotation = async (quotationData: Partial<Quotation>) => {
    try {
      if (editingQuotation) {
        await quotationAPI.updateQuotation(editingQuotation.id, quotationData);
      } else {
        await quotationAPI.createQuotation(quotationData as Omit<Quotation, 'id' | 'createdDate'>);
      }
      await fetchQuotations();
      setDialogOpen(false);
      setEditingQuotation(null);
    } catch (err) {
      setError('Failed to save quotation');
      console.error('Error saving quotation:', err);
    }
  };

  const handleSendQuotation = async (quotation: Quotation) => {
    try {
      await quotationAPI.sendQuotation(quotation.id);
      await fetchQuotations();
    } catch (err) {
      setError('Failed to send quotation');
      console.error('Error sending quotation:', err);
    }
  };

  const handleExportPDF = async (quotation: Quotation) => {
    try {
      const response = await quotationAPI.exportQuotationToPDF(quotation.id);
      // In a real app, this would download the PDF
      alert(`PDF exported successfully: ${response.data.pdfUrl}`);
    } catch (err) {
      setError('Failed to export PDF');
      console.error('Error exporting PDF:', err);
    }
  };

  // Calculate quotation summary
  const quotationSummary = React.useMemo(() => {
    const totalQuotations = quotations.length;
    const pendingQuotations = quotations.filter(quotation => quotation.status === 'PENDING').length;
    const approvedQuotations = quotations.filter(quotation => quotation.status === 'APPROVED').length;
    const rejectedQuotations = quotations.filter(quotation => quotation.status === 'REJECTED').length;

    return {
      totalQuotations,
      pendingQuotations,
      approvedQuotations,
      rejectedQuotations,
    };
  }, [quotations]);

  const columns: Column[] = [
    {
      id: 'id',
      label: 'Quotation ID',
      minWidth: 100,
      sortable: true,
    },
    {
      id: 'customerName',
      label: 'Customer',
      minWidth: 150,
      sortable: true,
    },
    {
      id: 'vehicleModel',
      label: 'Vehicle',
      minWidth: 150,
      sortable: true,
    },
    {
      id: 'price',
      label: 'Base Price',
      minWidth: 120,
      align: 'right',
      sortable: true,
      render: (value: number) => formatCurrency(value),
    },
    {
      id: 'discount',
      label: 'Discount',
      minWidth: 100,
      align: 'right',
      render: (value: number) => value ? formatCurrency(value) : '-',
    },
    {
      id: 'finalPrice',
      label: 'Final Price',
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
          label={value}
          color={getStatusColor(value)}
          size="small"
        />
      ),
    },
    {
      id: 'validUntil',
      label: 'Valid Until',
      minWidth: 120,
      sortable: true,
      render: (value: string) => formatDate(value),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 150,
      align: 'center',
      render: (value: any, row: Quotation) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="Edit Quotation">
            <IconButton
              size="small"
              onClick={() => handleEditQuotation(row)}
              disabled={!canManageQuotations()}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Send Quotation">
            <IconButton
              size="small"
              onClick={() => handleSendQuotation(row)}
              disabled={!canManageQuotations() || row.status === 'APPROVED' || row.status === 'REJECTED'}
            >
              <Send fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export PDF">
            <IconButton
              size="small"
              onClick={() => handleExportPDF(row)}
            >
              <PictureAsPdf fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Quotation">
            <IconButton
              size="small"
              onClick={() => setDeleteConfirm(row)}
              disabled={!canManageQuotations()}
              color="error"
            >
              <Delete fontSize="small" />
            </IconButton>
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
            Quotations
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage customer quotations and pricing
          </Typography>
        </Box>
        {canManageQuotations() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddQuotation}
          >
            Add Quotation
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Quotation Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Description sx={{ color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Quotations
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {quotationSummary.totalQuotations}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Description sx={{ color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Pending
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {quotationSummary.pendingQuotations}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Description sx={{ color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Approved
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {quotationSummary.approvedQuotations}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Description sx={{ color: 'error.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Rejected
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {quotationSummary.rejectedQuotations}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Quotations Table */}
      <DataTable
        columns={columns}
        data={quotations}
        loading={loading}
        searchable
        searchPlaceholder="Search quotations..."
        searchFields={['customerName', 'vehicleModel', 'id']}
      />

      {/* Add/Edit Quotation Dialog */}
      <FormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingQuotation(null);
        }}
        onSubmit={() => {}} // Form submission handled by QuotationForm
        title={editingQuotation ? 'Edit Quotation' : 'Add Quotation'}
        maxWidth="md"
      >
        <QuotationForm
          quotation={editingQuotation}
          onSave={handleSaveQuotation}
          onCancel={() => {
            setDialogOpen(false);
            setEditingQuotation(null);
          }}
        />
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <FormDialog
        open={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        onSubmit={() => deleteConfirm && handleDeleteQuotation(deleteConfirm)}
        title="Delete Quotation"
        submitText="Delete"
        cancelText="Cancel"
        maxWidth="sm"
      >
        <Typography>
          Are you sure you want to delete quotation "{deleteConfirm?.id}"? This action cannot be undone.
        </Typography>
      </FormDialog>
    </Box>
  );
};



