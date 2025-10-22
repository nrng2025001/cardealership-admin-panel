// Dashboard Page Component
// This file contains the main dashboard with KPIs, charts, and recent activities

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  Grid,
} from '@mui/material';
import {
  People,
  QuestionAnswer,
  Description,
  Event,
  Inventory,
  TrendingUp,
  Person,
  QuestionMark,
  Assignment,
  EventNote,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { dashboardAPI } from '@/api/dashboard';
import { bookingAPI } from '@/api/bookings';
import { enquiryAPI } from '@/api/enquiries';
import { StatusSummaryCard } from '@/components/dashboard/StatusSummaryCard';
import type { DashboardStats } from '@/api/types';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, color, trend }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUp
                sx={{
                  color: trend.isPositive ? 'success.main' : 'error.main',
                  fontSize: 16,
                  mr: 0.5,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: trend.isPositive ? 'success.main' : 'error.main',
                }}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

// Activity Item Component
interface ActivityItemProps {
  type: 'booking' | 'enquiry' | 'quotation' | 'employee';
  message: string;
  timestamp: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ type, message, timestamp }) => {
  const getActivityIcon = () => {
    switch (type) {
      case 'booking':
        return <EventNote sx={{ color: 'primary.main' }} />;
      case 'enquiry':
        return <QuestionMark sx={{ color: 'info.main' }} />;
      case 'quotation':
        return <Assignment sx={{ color: 'success.main' }} />;
      case 'employee':
        return <Person sx={{ color: 'warning.main' }} />;
      default:
        return <Event sx={{ color: 'text.secondary' }} />;
    }
  };

  return (
    <ListItem sx={{ px: 0 }}>
      <ListItemIcon sx={{ minWidth: 40 }}>
        {getActivityIcon()}
      </ListItemIcon>
      <ListItemText
        primary={message}
        secondary={formatDateTime(timestamp)}
        primaryTypographyProps={{ variant: 'body2' }}
        secondaryTypographyProps={{ variant: 'caption' }}
      />
    </ListItem>
  );
};

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('📊 [DASHBOARD] Fetching dashboard data...');
        
        // Fetch all dashboard data in parallel
        const [statsResponse, revenueResponse, salesResponse, activitiesResponse] = await Promise.all([
          dashboardAPI.getDashboardStats().catch(err => {
            console.warn('⚠️ [DASHBOARD] Stats API failed:', err.message);
            return { data: null };
          }),
          dashboardAPI.getRevenueChartData().catch(err => {
            console.warn('⚠️ [DASHBOARD] Revenue API failed:', err.message);
            return { data: [] };
          }),
          dashboardAPI.getSalesPerformance().catch(err => {
            console.warn('⚠️ [DASHBOARD] Sales API failed:', err.message);
            return { data: [] };
          }),
          dashboardAPI.getRecentActivities().catch(err => {
            console.warn('⚠️ [DASHBOARD] Activities API failed:', err.message);
            return { data: [] };
          }),
        ]);

        console.log('✅ [DASHBOARD] Data fetch complete');
        
        // Set data from API
        setStats(statsResponse.data);
        setRevenueData(revenueResponse.data || []);
        setSalesData(salesResponse.data || []);
        setActivities(activitiesResponse.data || []);
        
        setError(null);
        console.log('✅ [DASHBOARD] All data loaded from backend API');
      } catch (err) {
        console.error('❌ [DASHBOARD] Unexpected error:', err);
        setError('Failed to load dashboard data. Please check your connection and try again.');
      } finally {
        setLoading(false);
        console.log('🏁 [DASHBOARD] Loading complete');
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mb: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to your Automotive Admin dashboard. Here's what's happening today.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(5, 1fr)' 
        }, 
        gap: 3, 
        mb: 4 
      }}>
        <KPICard
          title="Total Employees"
          value={stats?.totalEmployees || 0}
          icon={<People />}
          color="primary.main"
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title="Active Enquiries"
          value={stats?.activeEnquiries || 0}
          icon={<QuestionAnswer />}
          color="info.main"
          trend={{ value: 8, isPositive: true }}
        />
        <KPICard
          title="Pending Quotations"
          value={stats?.pendingQuotations || 0}
          icon={<Description />}
          color="warning.main"
          trend={{ value: -5, isPositive: false }}
        />
        <KPICard
          title="Total Bookings"
          value={stats?.totalBookings || 0}
          icon={<Event />}
          color="success.main"
          trend={{ value: 15, isPositive: true }}
        />
        <KPICard
          title="Stock Count"
          value={stats?.stockCount || 0}
          icon={<Inventory />}
          color="secondary.main"
          trend={{ value: 3, isPositive: true }}
        />
      </Box>

      {/* Status Summary Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          lg: '1fr 1fr' 
        }, 
        gap: 3, 
        mb: 4 
      }}>
        <StatusSummaryCard
          title="Booking Analytics"
          type="bookings"
          onFetchSummary={bookingAPI.getBookingStatusSummary}
        />
        <StatusSummaryCard
          title="Enquiry Analytics"
          type="enquiries"
          onFetchSummary={enquiryAPI.getEnquiryStatusSummary}
        />
      </Box>

      {/* Charts Section */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          lg: '2fr 1fr' 
        }, 
        gap: 3, 
        mb: 4 
      }}>
        {/* Revenue Chart */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Revenue Trend (Last 12 Months)
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value / 1000}K`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1976d2"
                    strokeWidth={3}
                    dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Sales Performance Chart */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Sales Performance
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `$${value / 1000}K`} />
                  <YAxis dataKey="employeeName" type="category" width={100} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Sales']} />
                  <Bar dataKey="sales" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Recent Activities */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          md: 'repeat(2, 1fr)' 
        }, 
        gap: 3 
      }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Activities
            </Typography>
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {activities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ActivityItem
                    type={activity.type}
                    message={activity.message}
                    timestamp={activity.timestamp}
                  />
                  {index < activities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Quick Stats
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">Monthly Revenue</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(stats?.revenue || 0)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">Conversion Rate</Typography>
                <Chip label="78%" color="success" size="small" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">Customer Satisfaction</Typography>
                <Chip label="4.8/5" color="primary" size="small" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">Team Productivity</Typography>
                <Chip label="High" color="success" size="small" />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
