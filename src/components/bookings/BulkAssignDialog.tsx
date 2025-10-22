// Bulk Assign Dialog Component
// Allows assigning multiple bookings to a single advisor

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
  Avatar,
  ListItemText,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { employeeAPI } from '@/api/employees';
import { bookingAPI } from '@/api/bookings';

interface BulkAssignDialogProps {
  open: boolean;
  bookingIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkAssignDialog: React.FC<BulkAssignDialogProps> = ({
  open,
  bookingIds,
  onClose,
  onSuccess,
}) => {
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAdvisors, setLoadingAdvisors] = useState(false);
  const [error, setError] = useState('');

  // Debug logging
  useEffect(() => {
    console.log('🔵 [BULK ASSIGN DIALOG] Props changed:', { open, bookingIdsCount: bookingIds.length });
  }, [open, bookingIds]);

  useEffect(() => {
    if (open) {
      console.log('✅ [BULK ASSIGN DIALOG] Dialog opened, fetching advisors...');
      fetchAdvisors();
    }
  }, [open]);

  const fetchAdvisors = async () => {
    setLoadingAdvisors(true);
    setError('');
    try {
      console.log('📊 [BULK ASSIGN] Fetching advisors...');
      const response = await employeeAPI.getUsers({ 
        role: 'CUSTOMER_ADVISOR',
        isActive: true,
        limit: 100 
      });
      
      const advisorList = response.data?.users || [];
      console.log('✅ [BULK ASSIGN] Loaded advisors:', advisorList.length);
      setAdvisors(advisorList);
      
      if (advisorList.length === 0) {
        setError('No active Customer Advisors found');
      }
    } catch (err: any) {
      console.error('❌ [BULK ASSIGN] Failed to fetch advisors:', err);
      setError('Failed to load advisors. Please try again.');
    } finally {
      setLoadingAdvisors(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedAdvisorId) {
      setError('Please select an advisor');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('💾 [BULK ASSIGN] Assigning bookings...');
      const response = await bookingAPI.bulkAssignBookings(
        bookingIds,
        selectedAdvisorId,
        reason || undefined
      );

      console.log('✅ [BULK ASSIGN] Success:', response);
      
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('❌ [BULK ASSIGN] Failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to assign bookings';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedAdvisorId('');
    setReason('');
    setError('');
    onClose();
  };

  const selectedAdvisor = advisors.find(a => a.firebaseUid === selectedAdvisorId);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Assign {bookingIds.length} Booking{bookingIds.length > 1 ? 's' : ''} to Advisor
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loadingAdvisors ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Advisor</InputLabel>
                <Select
                  value={selectedAdvisorId}
                  onChange={(e) => setSelectedAdvisorId(e.target.value)}
                  label="Select Advisor"
                  disabled={advisors.length === 0}
                >
                  {advisors.map((advisor) => (
                    <MenuItem key={advisor.firebaseUid} value={advisor.firebaseUid}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {advisor.name?.[0] || <PersonIcon />}
                        </Avatar>
                        <ListItemText
                          primary={advisor.name}
                          secondary={advisor.email}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Reason (Optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                multiline
                rows={2}
                placeholder="Why are you assigning these bookings?"
                sx={{ mb: 2 }}
              />

              <Alert severity="info" icon={false}>
                <Typography variant="body2">
                  <strong>Summary:</strong>
                </Typography>
                <Typography variant="body2">
                  • {bookingIds.length} booking{bookingIds.length > 1 ? 's' : ''} will be assigned
                </Typography>
                {selectedAdvisor && (
                  <Typography variant="body2">
                    • To: <strong>{selectedAdvisor.name}</strong> ({selectedAdvisor.email})
                  </Typography>
                )}
              </Alert>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={!selectedAdvisorId || loading || loadingAdvisors}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Assigning...' : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

