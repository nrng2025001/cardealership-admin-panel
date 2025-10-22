// Stocks Page Component
// This file contains the stocks management page with CRUD operations

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
  Inventory,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { stockAPI } from '@/api/stocks';
import { StockItem, PaginatedResponse } from '@/api/types';
import { DataTable, Column } from '@/components/tables/DataTable';
import { FormDialog } from '@/components/forms/FormDialog';
import { StockForm } from './StockForm';
import { formatCurrency, getStatusColor } from '@/utils/formatters';
import { STOCK_STATUSES } from '@/utils/constants';

export const StocksPage: React.FC = () => {
  const { canManageStocks } = useAuth();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<StockItem | null>(null);

  useEffect(() => {
    fetchStockItems();
  }, []);

  const fetchStockItems = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 [STOCKS] Fetching stock items...');
      const response = await stockAPI.getStockItems({ limit: 100 });
      
      // Handle both old array format and new paginated format
      if (Array.isArray(response.data)) {
        console.log('✅ [STOCKS] Loaded from API:', response.data.length, 'items');
        setStockItems(response.data);
      } else if (response.data && response.data.vehicles) {
        console.log('✅ [STOCKS] Loaded from API (vehicles):', response.data.vehicles.length, 'items');
        setStockItems(response.data.vehicles || []);
      } else if (response.success && response.data) {
        console.log('✅ [STOCKS] Loaded from API:', Array.isArray(response.data) ? response.data.length : 0, 'items');
        setStockItems(Array.isArray(response.data) ? response.data : []);
      } else {
        console.log('⚠️ [STOCKS] No data in response');
        setStockItems([]);
      }
    } catch (err) {
      console.error('❌ [STOCKS] API failed:', err);
      setError('Failed to load stock items. Please check your connection and try again.');
      setStockItems([]);
    } finally {
      setLoading(false);
      console.log('🏁 [STOCKS] Load complete');
    }
  };

  const handleAddStock = () => {
    setEditingStock(null);
    setDialogOpen(true);
  };

  const handleEditStock = (stock: StockItem) => {
    setEditingStock(stock);
    setDialogOpen(true);
  };

  const handleDeleteStock = async (stock: StockItem) => {
    try {
      await stockAPI.deleteStockItem(stock.id);
      await fetchStockItems();
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete stock item');
      console.error('Error deleting stock item:', err);
    }
  };

  const handleSaveStock = async (stockData: Partial<StockItem>) => {
    try {
      if (editingStock) {
        await stockAPI.updateStockItem(editingStock.id, stockData);
      } else {
        await stockAPI.createStockItem(stockData as Omit<StockItem, 'id' | 'addedDate'>);
      }
      await fetchStockItems();
      setDialogOpen(false);
      setEditingStock(null);
    } catch (err) {
      setError('Failed to save stock item');
      console.error('Error saving stock item:', err);
    }
  };

  // Calculate stock summary
  const stockSummary = React.useMemo(() => {
    const totalItems = stockItems.length;
    const availableItems = stockItems.filter(item => item.status === 'available').length;
    const reservedItems = stockItems.filter(item => item.status === 'reserved').length;
    const soldItems = stockItems.filter(item => item.status === 'sold').length;
    const totalValue = stockItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      totalItems,
      availableItems,
      reservedItems,
      soldItems,
      totalValue,
    };
  }, [stockItems]);

  const columns: Column[] = [
    {
      id: 'vehicleModel',
      label: 'Model',
      minWidth: 120,
      sortable: true,
    },
    {
      id: 'brand',
      label: 'Brand',
      minWidth: 100,
      sortable: true,
    },
    {
      id: 'year',
      label: 'Year',
      minWidth: 80,
      sortable: true,
    },
    {
      id: 'color',
      label: 'Color',
      minWidth: 100,
    },
    {
      id: 'quantity',
      label: 'Qty',
      minWidth: 80,
      align: 'center',
      sortable: true,
    },
    {
      id: 'price',
      label: 'Price',
      minWidth: 120,
      align: 'right',
      sortable: true,
      render: (value: number) => formatCurrency(value),
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
      id: 'vin',
      label: 'VIN',
      minWidth: 150,
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 120,
      align: 'center',
      render: (value: any, row: StockItem) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="Edit Stock Item">
            <IconButton
              size="small"
              onClick={() => handleEditStock(row)}
              disabled={!canManageStocks()}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Stock Item">
            <IconButton
              size="small"
              onClick={() => setDeleteConfirm(row)}
              disabled={!canManageStocks()}
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
            Stock Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your vehicle inventory and stock levels
          </Typography>
        </Box>
        {canManageStocks() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddStock}
          >
            Add Stock Item
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stock Summary Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(5, 1fr)' 
        }, 
        gap: 3, 
        mb: 3 
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Inventory sx={{ color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Total Items
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {stockSummary.totalItems}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Inventory sx={{ color: 'success.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Available
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {stockSummary.availableItems}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Inventory sx={{ color: 'warning.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Reserved
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {stockSummary.reservedItems}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Inventory sx={{ color: 'info.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Sold
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {stockSummary.soldItems}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Inventory sx={{ color: 'secondary.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Total Value
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(stockSummary.totalValue)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Stock Items Table */}
      <DataTable
        columns={columns}
        data={stockItems}
        loading={loading}
        searchable
        searchPlaceholder="Search stock items..."
        searchFields={['vehicleModel', 'brand', 'vin']}
      />

      {/* Add/Edit Stock Dialog */}
      <FormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingStock(null);
        }}
        onSubmit={() => {}} // Form submission handled by StockForm
        title={editingStock ? 'Edit Stock Item' : 'Add Stock Item'}
        maxWidth="md"
      >
        <StockForm
          stockItem={editingStock}
          onSave={handleSaveStock}
          onCancel={() => {
            setDialogOpen(false);
            setEditingStock(null);
          }}
        />
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <FormDialog
        open={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        onSubmit={() => deleteConfirm && handleDeleteStock(deleteConfirm)}
        title="Delete Stock Item"
        submitText="Delete"
        cancelText="Cancel"
        maxWidth="sm"
      >
        <Typography>
          Are you sure you want to delete "{deleteConfirm?.vehicleModel}" stock item? This action cannot be undone.
        </Typography>
      </FormDialog>
    </Box>
  );
};

