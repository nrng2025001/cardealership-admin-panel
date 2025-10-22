// Dealership Management Page
// Admin page to view and manage all dealerships

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Business,
  Add,
  Edit,
  Visibility,
  PowerSettingsNew,
  CheckCircle,
  Cancel,
  LocationOn,
  Email,
  Phone,
  DirectionsCar,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { dealershipAPI } from '@/api/dealership';
import type { Dealership } from '@/api/types';
import { DataTable, Column } from '@/components/tables/DataTable';

export const DealershipManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Check if current admin already has a dealership
  const hasExistingDealership = dealerships.length > 0;

  useEffect(() => {
    fetchDealerships();
  }, []);

  const fetchDealerships = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 [DEALERSHIPS] Fetching dealerships...');
      
      const response = await dealershipAPI.getDealerships({ limit: 100 });
      
      if (response.data?.success && response.data.data?.dealerships) {
        console.log('✅ [DEALERSHIPS] Loaded:', response.data.data.dealerships.length, 'dealerships');
        setDealerships(response.data.data.dealerships);
      } else {
        console.log('⚠️ [DEALERSHIPS] No data in response');
        setDealerships([]);
      }
    } catch (err) {
      console.error('❌ [DEALERSHIPS] API failed:', err);
      setError('Failed to load dealerships. Please check your connection and try again.');
      setDealerships([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (dealership: Dealership) => {
    try {
      console.log(`🔄 [DEALERSHIPS] Toggling active status for ${dealership.name}...`);
      
      if (dealership.isActive) {
        await dealershipAPI.updateDealership(dealership.id, { isActive: false });
      } else {
        await dealershipAPI.updateDealership(dealership.id, { isActive: true });
      }
      
      console.log('✅ [DEALERSHIPS] Status updated');
      fetchDealerships(); // Refresh list
    } catch (err: any) {
      console.error('❌ [DEALERSHIPS] Failed to update status:', err);
      setError(err.response?.data?.message || 'Failed to update dealership status');
    }
  };

  const handleViewDetails = (dealership: Dealership) => {
    setSelectedDealership(dealership);
    setDetailsOpen(true);
  };

  const columns: Column[] = [
    {
      id: 'name',
      label: 'Dealership Name',
      sortable: true,
      render: (value: string, row: Dealership) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Business color="primary" />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.code}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'type',
      label: 'Type',
      sortable: true,
      render: (value: string) => (
        <Chip
          label={value}
          size="small"
          color={value === 'TATA' ? 'primary' : 'default'}
        />
      ),
    },
    {
      id: 'brands',
      label: 'Brands',
      render: (value: string[]) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {value && value.map((brand) => (
            <Chip key={brand} label={brand} size="small" variant="outlined" />
          ))}
        </Box>
      ),
    },
    {
      id: 'city',
      label: 'Location',
      sortable: true,
      render: (value: string, row: Dealership) => (
        <Box>
          <Typography variant="body2">{value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.state}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'email',
      label: 'Contact',
      render: (value: string, row: Dealership) => (
        <Box>
          <Typography variant="caption" display="block">
            <Email sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
            {value}
          </Typography>
          <Typography variant="caption" display="block">
            <Phone sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
            {row.phone}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'onboardingCompleted',
      label: 'Status',
      sortable: true,
      render: (value: boolean, row: Dealership) => (
        <Box>
          <Chip
            icon={value ? <CheckCircle /> : <Cancel />}
            label={value ? 'Complete' : 'Pending'}
            size="small"
            color={value ? 'success' : 'warning'}
            sx={{ mb: 0.5 }}
          />
          <Chip
            label={row.isActive ? 'Active' : 'Inactive'}
            size="small"
            color={row.isActive ? 'success' : 'default'}
          />
        </Box>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (value: any, row: Dealership) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => handleViewDetails(row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          {isAdmin() && (
            <>
              <Tooltip title="Edit">
                <IconButton 
                  size="small" 
                  onClick={() => navigate(`/dealership/edit/${row.id}`)}
                  color="primary"
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={row.isActive ? 'Deactivate' : 'Activate'}>
                <IconButton
                  size="small"
                  onClick={() => handleToggleActive(row)}
                  color={row.isActive ? 'error' : 'success'}
                >
                  <PowerSettingsNew fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ];

  if (!isAdmin()) {
    return (
      <Box>
        <Alert severity="error">
          You don't have permission to manage dealerships. Admin access required.
        </Alert>
      </Box>
    );
  }

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
            <Business sx={{ verticalAlign: 'middle', mr: 1 }} />
            Dealership Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all dealerships in the system
          </Typography>
        </Box>
        {/* Only show Add Dealership button if admin hasn't created one yet */}
        {!hasExistingDealership ? (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/dealership/onboarding')}
          >
            Add Dealership
          </Button>
        ) : (
          <Alert severity="info" sx={{ py: 1 }}>
            You have already created a dealership. Each admin can create only one dealership.
          </Alert>
        )}
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Total Dealerships
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {dealerships.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Active
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {dealerships.filter((d) => d.isActive).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                TATA Exclusive
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {dealerships.filter((d) => d.type === 'TATA').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Multi-Brand
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {dealerships.filter((d) => d.type === 'UNIVERSAL').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dealerships Table */}
      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={dealerships}
            emptyMessage="No dealerships found. Click 'Add Dealership' to create one."
          />
        </CardContent>
      </Card>

      {/* Dealership Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        {selectedDealership && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Business color="primary" />
                <Box>
                  <Typography variant="h6">{selectedDealership.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedDealership.code}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Basic Information
                  </Typography>
                  <Box sx={{ '& > *': { mb: 1 } }}>
                    <Typography variant="body2">
                      <strong>Type:</strong> {selectedDealership.type}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Brands:</strong> {selectedDealership.brands.join(', ')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Status:</strong>{' '}
                      <Chip
                        label={selectedDealership.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={selectedDealership.isActive ? 'success' : 'default'}
                      />
                      {' '}
                      <Chip
                        label={selectedDealership.onboardingCompleted ? 'Onboarded' : 'Pending'}
                        size="small"
                        color={selectedDealership.onboardingCompleted ? 'success' : 'warning'}
                      />
                    </Typography>
                  </Box>
                </Grid>

                {/* Contact Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Contact Information
                  </Typography>
                  <Box sx={{ '& > *': { mb: 1 } }}>
                    <Typography variant="body2">
                      <Email sx={{ fontSize: 14, verticalAlign: 'middle', mr: 1 }} />
                      {selectedDealership.email}
                    </Typography>
                    <Typography variant="body2">
                      <Phone sx={{ fontSize: 14, verticalAlign: 'middle', mr: 1 }} />
                      {selectedDealership.phone}
                    </Typography>
                    <Typography variant="body2">
                      <LocationOn sx={{ fontSize: 14, verticalAlign: 'middle', mr: 1 }} />
                      {selectedDealership.address}, {selectedDealership.city}, {selectedDealership.state} - {selectedDealership.pincode}
                    </Typography>
                  </Box>
                </Grid>

                {/* Business Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Business Information
                  </Typography>
                  <Box sx={{ '& > *': { mb: 1 } }}>
                    <Typography variant="body2">
                      <strong>GST:</strong> {selectedDealership.gstNumber}
                    </Typography>
                    <Typography variant="body2">
                      <strong>PAN:</strong> {selectedDealership.panNumber}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              {isAdmin() && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => {
                      setDetailsOpen(false);
                      navigate(`/dealership/edit/${selectedDealership.id}`);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setDetailsOpen(false);
                      navigate(`/dealership/${selectedDealership.id}/catalog`);
                    }}
                  >
                    View Catalog
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

