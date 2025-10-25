// Bookings Page Component
// This file contains the bookings management page with CRUD operations

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Paper,
  Switch,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Event,
  Visibility,
  Close,
  Assignment as AssignmentIcon,
  AutoMode as AutoModeIcon,
  PersonOff as PersonOffIcon,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { bookingAPI } from '@/api/bookings';
import { Booking, PaginatedResponse } from '@/api/types';
import { DataTable, Column } from '@/components/tables/DataTable';
import { FormDialog } from '@/components/forms/FormDialog';
import { BookingForm } from './BookingForm';
import { BulkAssignDialog } from '@/components/bookings/BulkAssignDialog';
import { AutoAssignDialog } from '@/components/bookings/AutoAssignDialog';
import { DownloadButton } from '@/components/common/DownloadButton';
import { formatDate, getStatusColor } from '@/utils/formatters';
import { BOOKING_STATUSES } from '@/utils/constants';

export const BookingsPage: React.FC = () => {
  const { canManageBookings } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Booking | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  
  // Multi-select and bulk actions
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const [autoAssignDialogOpen, setAutoAssignDialogOpen] = useState(false);
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);

  // Debug dialog states
  useEffect(() => {
    console.log('🔄 [BOOKINGS] Dialog states:', { 
      bulkAssignDialogOpen, 
      autoAssignDialogOpen,
      selectedCount: selectedBookings.length 
    });
  }, [bulkAssignDialogOpen, autoAssignDialogOpen, selectedBookings]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 [BOOKINGS] Fetching bookings...');
      
      const response = await bookingAPI.getBookings({ 
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      // Handle both old array format and new paginated format
      if (Array.isArray(response.data)) {
        console.log('✅ [BOOKINGS] Loaded from API:', response.data.length, 'items');
        setBookings(response.data);
      } else if (response.data && response.data.bookings) {
        console.log('✅ [BOOKINGS] Loaded from API (paginated):', response.data.bookings.length, 'items');
        setBookings(response.data.bookings || []);
      } else if (response.success && response.data) {
        const bookingsArray = Array.isArray(response.data) ? response.data : [];
        console.log('✅ [BOOKINGS] Loaded from API:', bookingsArray.length, 'items');
        setBookings(bookingsArray);
      } else {
        console.log('⚠️ [BOOKINGS] No data in response');
        setBookings([]);
      }
    } catch (err) {
      console.error('❌ [BOOKINGS] API failed:', err);
      setError('Failed to load bookings. Please check your connection and try again.');
      setBookings([])
    } finally {
      setLoading(false);
      console.log('🏁 [BOOKINGS] Load complete');
    }
  };

  const handleAddBooking = () => {
    setEditingBooking(null);
    setDialogOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setDialogOpen(true);
  };

  const handleDeleteBooking = async (booking: Booking) => {
    try {
      await bookingAPI.deleteBooking(booking.id);
      await fetchBookings();
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete booking');
      console.error('Error deleting booking:', err);
    }
  };

  const handleSaveBooking = async (bookingData: Partial<Booking>) => {
    try {
      setError(null);
      setSuccess(null);
      console.log('💾 Saving booking:', bookingData);
      
      if (editingBooking) {
        console.log('📝 Updating existing booking:', editingBooking.id);
        const result = await bookingAPI.updateBooking(editingBooking.id, bookingData);
        console.log('✅ Update result:', result);
        setSuccess('Booking updated successfully!');
      } else {
        console.log('➕ Creating new booking');
        const result = await bookingAPI.createBooking(bookingData as Omit<Booking, 'id'>);
        console.log('✅ Create result:', result);
        setSuccess('Booking created successfully!');
      }
      
      // Close dialog first
      setDialogOpen(false);
      setEditingBooking(null);
      
      // Then refresh the list
      console.log('🔄 Refreshing bookings list...');
      await fetchBookings();
      console.log('✅ Bookings refreshed successfully');
    } catch (err) {
      setError('Failed to save booking');
      console.error('❌ Error saving booking:', err);
    }
  };

  const handleStatusChange = async (booking: Booking, newStatus: Booking['status']) => {
    try {
      await bookingAPI.updateBookingStatus(booking.id, newStatus);
      await fetchBookings();
    } catch (err) {
      setError('Failed to update booking status');
      console.error('Error updating booking status:', err);
    }
  };

  // Bulk unassign handler
  const handleBulkUnassign = async () => {
    if (!confirm(`Are you sure you want to unassign ${selectedBookings.length} booking(s)?`)) {
      return;
    }

    try {
      console.log('🔓 [BOOKINGS] Bulk unassigning:', selectedBookings);
      setError(null);
      
      for (const bookingId of selectedBookings) {
        await bookingAPI.unassignBooking(bookingId, 'Bulk unassign from bookings page');
      }
      
      setSuccess(`Successfully unassigned ${selectedBookings.length} booking(s)`);
      setSelectedBookings([]);
      await fetchBookings();
    } catch (err: any) {
      console.error('❌ [BOOKINGS] Bulk unassign failed:', err);
      setError('Failed to unassign some bookings');
    }
  };

  // Handler for bulk assign success
  const handleBulkAssignSuccess = () => {
    setSuccess('Bookings assigned successfully!');
    setSelectedBookings([]);
    fetchBookings();
  };

  // Handler for auto-assign success
  const handleAutoAssignSuccess = () => {
    setSuccess('Bookings auto-assigned successfully!');
    setSelectedBookings([]);
    fetchBookings();
  };

  // Filter bookings for display
  const displayedBookings = React.useMemo(() => {
    if (showUnassignedOnly) {
      return bookings.filter(b => !b.advisorId);
    }
    return bookings;
  }, [bookings, showUnassignedOnly]);

  // Calculate booking summary
  const bookingSummary = React.useMemo(() => {
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(booking => booking.status === 'PENDING').length;
    const confirmedBookings = bookings.filter(booking => booking.status === 'CONFIRMED').length;
    const deliveredBookings = bookings.filter(booking => booking.status === 'DELIVERED').length;
    const cancelledBookings = bookings.filter(booking => booking.status === 'CANCELLED').length;
    const unassignedBookings = bookings.filter(booking => !booking.advisorId).length;

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      deliveredBookings,
      cancelledBookings,
      unassignedBookings,
    };
  }, [bookings]);

  const columns: Column[] = [
    // Checkbox column for multi-select
    {
      id: 'select',
      label: '',
      minWidth: 50,
      align: 'center',
      render: (value: any, row: Booking) => (
        <Checkbox
          checked={selectedBookings.includes(row.id)}
          onChange={(e) => {
            e.stopPropagation();
            if (e.target.checked) {
              setSelectedBookings([...selectedBookings, row.id]);
            } else {
              setSelectedBookings(selectedBookings.filter(id => id !== row.id));
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      id: 'id',
      label: 'Booking ID',
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
      id: 'customerEmail',
      label: 'Email',
      minWidth: 200,
      sortable: true,
    },
    {
      id: 'variant',
      
      label: 'Vehicle',
      minWidth: 150,
      sortable: true,
    },
    {
      id: 'bookingDate',
      label: 'Booking Date',
      minWidth: 120,
      sortable: true,
      render: (value: string) => formatDate(value),
    },
    {
      id: 'expectedDeliveryDate',
      label: 'Delivery Date',
      minWidth: 120,
      render: (value: string) => value ? formatDate(value) : 'Not set',
    },
    {
      id: 'advisorId',
      label: 'Assigned To',
      minWidth: 180,
      sortable: true,
      render: (value: string, row: Booking) => {
        const advisor = row.advisor;
        
        if (!value || !advisor) {
          return (
            <Chip 
              label="Unassigned" 
              size="small" 
              variant="outlined"
              color="warning"
            />
          );
        }
        
        // Show advisor with name and email
        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {advisor.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {advisor.email}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      sortable: true,
      render: (value: string, row: Booking) => (
        <Chip
          label={value}
          color={getStatusColor(value)}
          size="small"
          onClick={() => canManageBookings() && handleStatusChange(row, value as Booking['status'])}
          style={{ cursor: canManageBookings() ? 'pointer' : 'default' }}
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 120,
      align: 'center',
      render: (value: any, row: Booking) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => setViewingBooking(row)}
              color="info"
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Booking">
            <IconButton
              size="small"
              onClick={() => handleEditBooking(row)}
              disabled={!canManageBookings()}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Booking">
            <IconButton
              size="small"
              onClick={() => setDeleteConfirm(row)}
              disabled={!canManageBookings()}
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Bookings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage customer bookings and deliveries
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <DownloadButton
            type="bookings"
            onDownload={bookingAPI.downloadBookings}
            availableStatuses={BOOKING_STATUSES.map(s => s.value)}
            availableAdvisors={[]} // TODO: Add advisors when available
          />
          {canManageBookings() && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddBooking}
            >
              Add Booking
            </Button>
          )}
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Filter and Selection Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedBookings.length === displayedBookings.length && displayedBookings.length > 0}
              indeterminate={selectedBookings.length > 0 && selectedBookings.length < displayedBookings.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedBookings(displayedBookings.map(b => b.id));
                } else {
                  setSelectedBookings([]);
                }
              }}
            />
          }
          label={selectedBookings.length > 0 ? `${selectedBookings.length} selected` : 'Select All'}
        />

        <FormControlLabel
          control={
            <Switch
              checked={showUnassignedOnly}
              onChange={(e) => {
                setShowUnassignedOnly(e.target.checked);
                setSelectedBookings([]); // Clear selection when filter changes
              }}
            />
          }
          label="Show Unassigned Only"
        />
      </Box>

      {/* Bulk Actions Toolbar */}
      {selectedBookings.length > 0 && canManageBookings() && (
        <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {selectedBookings.length} booking{selectedBookings.length > 1 ? 's' : ''} selected
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<AssignmentIcon />}
            onClick={() => {
              console.log('🔘 [BOOKINGS] Opening Bulk Assign Dialog...');
              console.log('Selected booking IDs:', selectedBookings);
              setBulkAssignDialogOpen(true);
            }}
            size="small"
          >
            Assign to Advisor
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AutoModeIcon />}
            onClick={() => {
              console.log('🔘 [BOOKINGS] Opening Auto-Assign Dialog...');
              console.log('Selected booking IDs:', selectedBookings);
              setAutoAssignDialogOpen(true);
            }}
            size="small"
          >
            Auto-Assign
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<PersonOffIcon />}
            onClick={handleBulkUnassign}
            size="small"
          >
            Unassign All
          </Button>
          
          <Button
            variant="text"
            onClick={() => setSelectedBookings([])}
            size="small"
          >
            Clear Selection
          </Button>
        </Paper>
      )}

      {/* Booking Summary Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(3, 1fr)',
          lg: 'repeat(6, 1fr)' 
        }, 
        gap: 2, 
        mb: 3 
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Event sx={{ color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Total Bookings
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {bookingSummary.totalBookings}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card 
          sx={{ 
            cursor: 'pointer',
            '&:hover': { bgcolor: 'warning.50' }
          }}
          onClick={() => {
            setShowUnassignedOnly(true);
            setSelectedBookings([]);
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonOffIcon sx={{ color: 'warning.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Unassigned
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  {bookingSummary.unassignedBookings}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Event sx={{ color: 'warning.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Pending
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {bookingSummary.pendingBookings}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Event sx={{ color: 'info.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Confirmed
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {bookingSummary.confirmedBookings}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Event sx={{ color: 'success.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Delivered
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {bookingSummary.deliveredBookings}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Event sx={{ color: 'error.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Cancelled
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {bookingSummary.cancelledBookings}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Bookings Table */}
      <DataTable
        columns={columns}
        data={displayedBookings}
        loading={loading}
        searchable
        searchPlaceholder="Search bookings..."
        searchFields={['customerName', 'customerEmail', 'vehicleModel', 'id']}
      />

      {/* Add/Edit Booking Dialog */}
      <FormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingBooking(null);
        }}
        title={editingBooking ? 'Edit Booking' : 'Add Booking'}
        maxWidth="md"
        hideActions={true}
      >
        <BookingForm
          booking={editingBooking}
          onSave={handleSaveBooking}
          onCancel={() => {
            setDialogOpen(false);
            setEditingBooking(null);
          }}
        />
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <FormDialog
        open={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        onSubmit={() => deleteConfirm && handleDeleteBooking(deleteConfirm)}
        title="Delete Booking"
        submitText="Delete"
        cancelText="Cancel"
        maxWidth="sm"
      >
        <Typography>
          Are you sure you want to delete booking "{deleteConfirm?.id}"? This action cannot be undone.
        </Typography>
      </FormDialog>

      {/* View Booking Details Dialog */}
      <Dialog
        open={Boolean(viewingBooking)}
        onClose={() => setViewingBooking(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Booking Details</Typography>
            <IconButton onClick={() => setViewingBooking(null)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewingBooking && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Booking ID</Typography>
                <Typography variant="body1" fontWeight="bold">{viewingBooking.id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip label={viewingBooking.status} color={getStatusColor(viewingBooking.status)} size="small" />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Customer Name</Typography>
                <Typography variant="body1">{viewingBooking.customerName}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Customer Email</Typography>
                <Typography variant="body1">{viewingBooking.customerEmail || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Customer Phone</Typography>
                <Typography variant="body1">{viewingBooking.customerPhone || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Vehicle Variant</Typography>
                <Typography variant="body1">{viewingBooking.variant || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Color</Typography>
                <Typography variant="body1">{viewingBooking.color || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Dealer Code</Typography>
                <Typography variant="body1">{viewingBooking.dealerCode}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Expected Delivery</Typography>
                <Typography variant="body1">{viewingBooking.expectedDeliveryDate ? formatDate(viewingBooking.expectedDeliveryDate) : 'Not set'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Finance Required</Typography>
                <Typography variant="body1">{viewingBooking.financeRequired ? 'Yes' : 'No'}</Typography>
              </Box>
              {viewingBooking.financeRequired && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Financer</Typography>
                  <Typography variant="body1">{viewingBooking.financerName || '-'}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary">Zone</Typography>
                <Typography variant="body1">{viewingBooking.zone || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Region</Typography>
                <Typography variant="body1">{viewingBooking.region || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Created At</Typography>
                <Typography variant="body1">{formatDate(viewingBooking.createdAt)}</Typography>
              </Box>
              <Box sx={{ gridColumn: '1 / -1', mt: 2, p: 2, bgcolor: viewingBooking.advisor ? 'success.50' : 'warning.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Assigned Advisor
                </Typography>
                {viewingBooking.advisor ? (
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {viewingBooking.advisor.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {viewingBooking.advisor.email}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      ID: {viewingBooking.advisorId}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 'bold' }}>
                    ⚠️ Not Assigned - Please assign an advisor to this booking
                  </Typography>
                )}
              </Box>
              {/* Remarks Section */}
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Remarks
                </Typography>
                
                {/* Advisor Remarks */}
                {viewingBooking.advisorRemarks && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                      Advisor Remarks
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {viewingBooking.advisorRemarks}
                    </Typography>
                  </Box>
                )}
                
                {/* Team Lead Remarks */}
                {viewingBooking.teamLeadRemarks && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="warning.main" sx={{ fontWeight: 'bold' }}>
                      Team Lead Remarks
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {viewingBooking.teamLeadRemarks}
                    </Typography>
                  </Box>
                )}
                
                {/* Sales Manager Remarks */}
                {viewingBooking.salesManagerRemarks && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="info.main" sx={{ fontWeight: 'bold' }}>
                      Sales Manager Remarks
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {viewingBooking.salesManagerRemarks}
                    </Typography>
                  </Box>
                )}
                
                {/* General Manager Remarks */}
                {viewingBooking.generalManagerRemarks && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 'bold' }}>
                      General Manager Remarks
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {viewingBooking.generalManagerRemarks}
                    </Typography>
                  </Box>
                )}
                
                {/* Admin Remarks */}
                {viewingBooking.adminRemarks && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'error.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 'bold' }}>
                      Admin Remarks
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {viewingBooking.adminRemarks}
                    </Typography>
                  </Box>
                )}
                
                {/* Show message if no remarks */}
                {!viewingBooking.advisorRemarks && !viewingBooking.teamLeadRemarks && 
                 !viewingBooking.salesManagerRemarks && !viewingBooking.generalManagerRemarks && 
                 !viewingBooking.adminRemarks && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No remarks added yet
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingBooking(null)}>Close</Button>
          {canManageBookings() && (
            <Button onClick={() => {
              setEditingBooking(viewingBooking);
              setViewingBooking(null);
              setDialogOpen(true);
            }} variant="contained">
              Edit Booking
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Bulk Assign Dialog */}
      <BulkAssignDialog
        open={bulkAssignDialogOpen}
        bookingIds={selectedBookings}
        onClose={() => {
          console.log('🔵 [BOOKINGS] Closing Bulk Assign Dialog');
          setBulkAssignDialogOpen(false);
        }}
        onSuccess={handleBulkAssignSuccess}
      />

      {/* Auto-Assign Dialog */}
      <AutoAssignDialog
        open={autoAssignDialogOpen}
        bookingIds={selectedBookings}
        onClose={() => {
          console.log('🟣 [BOOKINGS] Closing Auto-Assign Dialog');
          setAutoAssignDialogOpen(false);
        }}
        onSuccess={handleAutoAssignSuccess}
      />
    </Box>
  );
};

