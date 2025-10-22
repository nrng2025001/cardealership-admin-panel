import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Chip,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

interface StatusBreakdown {
  status?: string;
  category?: string;
  count: number;
  percentage?: number;
}

interface StatusSummary {
  totalBookings?: number;
  totalEnquiries?: number;
  recentBookings?: number;
  recentEnquiries?: number;
  pendingBookings?: number;
  hotEnquiries?: number;
  statusBreakdown?: StatusBreakdown[];
  categoryBreakdown?: StatusBreakdown[];
  trend?: 'up' | 'down' | 'stable';
  trendPercentage?: number;
}

interface StatusSummaryCardProps {
  title: string;
  type: 'bookings' | 'enquiries';
  onFetchSummary: () => Promise<{ data: StatusSummary }>;
  refreshTrigger?: number;
}

export const StatusSummaryCard: React.FC<StatusSummaryCardProps> = ({
  title,
  type,
  onFetchSummary,
  refreshTrigger = 0
}) => {
  const [summary, setSummary] = useState<StatusSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`📊 [STATUS SUMMARY] Fetching ${type} summary...`);
        const response = await onFetchSummary();
        setSummary(response.data);
        console.log(`✅ [STATUS SUMMARY] ${type} summary loaded:`, response.data);
      } catch (err) {
        console.error(`❌ [STATUS SUMMARY] Failed to fetch ${type} summary:`, err);
        setError('Failed to load summary data');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [type, onFetchSummary, refreshTrigger]);

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">No data available</Alert>
        </CardContent>
      </Card>
    );
  }

  const totalCount = summary.totalBookings || summary.totalEnquiries || 0;
  const recentCount = summary.recentBookings || summary.recentEnquiries || 0;
  const pendingCount = summary.pendingBookings || summary.hotEnquiries || 0;
  const breakdown = summary.statusBreakdown || summary.categoryBreakdown || [];

  const getTrendIcon = () => {
    if (summary.trend === 'up') return <TrendingUpIcon color="success" />;
    if (summary.trend === 'down') return <TrendingDownIcon color="error" />;
    return <AssessmentIcon color="info" />;
  };

  const getTrendColor = () => {
    if (summary.trend === 'up') return 'success.main';
    if (summary.trend === 'down') return 'error.main';
    return 'info.main';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            {summary.trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getTrendIcon()}
                {summary.trendPercentage && (
                  <Typography 
                    variant="body2" 
                    color={getTrendColor()}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {summary.trendPercentage > 0 ? '+' : ''}{summary.trendPercentage}%
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        }
        avatar={<AssessmentIcon color="primary" />}
      />
      <CardContent>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                {totalCount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                {recentCount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recent (7d)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                {pendingCount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {type === 'bookings' ? 'Pending' : 'Hot'}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {breakdown.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon fontSize="small" />
              {type === 'bookings' ? 'Status Breakdown' : 'Category Breakdown'}
            </Typography>
            <Stack spacing={1}>
              {breakdown.slice(0, 5).map((item, index) => {
                const percentage = item.percentage || (totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0);
                const status = item.status || item.category || 'Unknown';
                
                return (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {status}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {item.count}
                        </Typography>
                        <Chip 
                          label={`${percentage}%`} 
                          size="small" 
                          variant="outlined"
                          color={percentage > 50 ? 'primary' : percentage > 25 ? 'secondary' : 'default'}
                        />
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          backgroundColor: percentage > 50 ? 'primary.main' : percentage > 25 ? 'secondary.main' : 'grey.400'
                        }
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
            
            {breakdown.length > 5 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                +{breakdown.length - 5} more {type === 'bookings' ? 'statuses' : 'categories'}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
