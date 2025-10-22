// Auto-Assign Dialog Component
// Automatically distributes bookings among advisors using different strategies

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  AutoMode as AutoModeIcon,
  EqualizerOutlined as BalanceIcon,
  ShuffleOutlined as ShuffleIcon,
  TrendingUp as LoadIcon,
} from '@mui/icons-material';
import { bookingAPI } from '@/api/bookings';

interface AutoAssignDialogProps {
  open: boolean;
  bookingIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

type AssignmentStrategy = 'ROUND_ROBIN' | 'LEAST_LOAD' | 'RANDOM';

export const AutoAssignDialog: React.FC<AutoAssignDialogProps> = ({
  open,
  bookingIds,
  onClose,
  onSuccess,
}) => {
  const [strategy, setStrategy] = useState<AssignmentStrategy>('LEAST_LOAD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  // Debug logging
  useEffect(() => {
    console.log('🟣 [AUTO ASSIGN DIALOG] Props changed:', { open, bookingIdsCount: bookingIds.length });
  }, [open, bookingIds]);

  const strategyInfo = {
    ROUND_ROBIN: {
      icon: <BalanceIcon />,
      title: 'Round Robin',
      description: 'Distribute bookings evenly across all advisors in rotation',
      benefit: 'Fair distribution - each advisor gets equal number of bookings',
    },
    LEAST_LOAD: {
      icon: <LoadIcon />,
      title: 'Least Load (Recommended)',
      description: 'Assign to advisors with the fewest active bookings first',
      benefit: 'Balanced workload - prevents overloading busy advisors',
    },
    RANDOM: {
      icon: <ShuffleIcon />,
      title: 'Random',
      description: 'Randomly assign bookings to available advisors',
      benefit: 'Quick assignment - no complex calculation needed',
    },
  };

  const handleAutoAssign = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('🤖 [AUTO ASSIGN] Starting auto-assignment...');
      const response = await bookingAPI.autoAssignBookings(bookingIds, strategy);

      console.log('✅ [AUTO ASSIGN] Success:', response);
      setResult(response.data);

      // Show result for 2 seconds, then close
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 3000);
    } catch (err: any) {
      console.error('❌ [AUTO ASSIGN] Failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to auto-assign bookings';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStrategy('LEAST_LOAD');
    setError('');
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoModeIcon />
          Auto-Assign {bookingIds.length} Booking{bookingIds.length > 1 ? 's' : ''}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {result ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Successfully assigned {result.totalAssigned} booking(s)!</strong>
              </Typography>
              {result.summary?.map((item: any, index: number) => (
                <Typography key={index} variant="body2">
                  • {item.advisorName}: {item.assignedCount} booking{item.assignedCount > 1 ? 's' : ''}
                </Typography>
              ))}
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select an assignment strategy:
              </Typography>

              <RadioGroup value={strategy} onChange={(e) => setStrategy(e.target.value as AssignmentStrategy)}>
                {(Object.keys(strategyInfo) as AssignmentStrategy[]).map((key) => {
                  const info = strategyInfo[key];
                  return (
                    <Card 
                      key={key}
                      sx={{ 
                        mb: 2, 
                        border: strategy === key ? 2 : 1,
                        borderColor: strategy === key ? 'primary.main' : 'divider',
                        cursor: 'pointer',
                      }}
                      onClick={() => setStrategy(key)}
                    >
                      <CardContent>
                        <FormControlLabel
                          value={key}
                          control={<Radio />}
                          label={
                            <Box sx={{ ml: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                {info.icon}
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                  {info.title}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {info.description}
                              </Typography>
                              <Typography variant="caption" color="primary">
                                ✓ {info.benefit}
                              </Typography>
                            </Box>
                          }
                          sx={{ m: 0, width: '100%' }}
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </RadioGroup>

              <Alert severity="info" icon={false}>
                <Typography variant="body2">
                  <strong>How it works:</strong>
                </Typography>
                <Typography variant="body2">
                  • Bookings will be automatically distributed among all active Customer Advisors
                </Typography>
                <Typography variant="body2">
                  • Only advisors in your dealership will be considered
                </Typography>
                <Typography variant="body2">
                  • Each booking will be assigned to exactly one advisor
                </Typography>
              </Alert>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {result ? 'Close' : 'Cancel'}
        </Button>
        {!result && (
          <Button
            onClick={handleAutoAssign}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AutoModeIcon />}
          >
            {loading ? 'Assigning...' : 'Auto-Assign'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

