// Employee Hierarchy Page - Redesigned
// Intuitive org chart visualization with clear reporting structure

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Grid,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Divider,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  AccountTree,
  Person,
  Email,
  Phone,
  SupervisedUserCircle,
  Edit,
  Search,
  ViewList,
  GridView,
  TrendingUp,
  EmojiEvents,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { employeeAPI } from '@/api/employees';
import { Employee } from '@/api/types';
import { getInitials, formatDate } from '@/utils/formatters';

// Role color mapping
const ROLE_COLORS = {
  'General Manager': '#1976d2',
  'Sales Manager': '#388e3c',
  'Team Lead': '#f57c00',
  'Advisor': '#7b1fa2',
  'Admin': '#d32f2f',
};

// Employee Card Component for Org Chart
interface EmployeeCardProps {
  employee: Employee;
  level: number;
  onViewDetails: (emp: Employee) => void;
  onEditManager: (emp: Employee) => void;
  canEdit: boolean;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  level,
  onViewDetails,
  onEditManager,
  canEdit,
}) => {
  const roleColor = ROLE_COLORS[employee.role as keyof typeof ROLE_COLORS] || '#666';
  
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        borderTop: `4px solid ${roleColor}`,
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        minWidth: 200,
      }}
    >
      <Box onClick={() => onViewDetails(employee)}>
        <Avatar
          sx={{
            width: 56,
            height: 56,
            bgcolor: roleColor,
            mx: 'auto',
            mb: 1,
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}
        >
          {getInitials(employee.name)}
        </Avatar>
        
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          {employee.name}
        </Typography>
        
        <Chip
          label={employee.role}
          size="small"
          sx={{
            bgcolor: roleColor,
            color: 'white',
            mb: 1,
            fontSize: '0.7rem',
          }}
        />
        
        {employee.subordinateCount !== undefined && employee.subordinateCount > 0 && (
          <Box sx={{ mt: 1 }}>
            <Badge badgeContent={employee.subordinateCount} color="primary">
              <SupervisedUserCircle sx={{ fontSize: 20, color: 'text.secondary' }} />
            </Badge>
            <Typography variant="caption" display="block" color="text.secondary">
              {employee.subordinateCount} direct report{employee.subordinateCount > 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
      </Box>
      
      {canEdit && (
        <Tooltip title="Edit Manager Assignment">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onEditManager(employee);
            }}
            sx={{ 
              mt: 1,
              position: 'relative',
              zIndex: 1,
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Paper>
  );
};

// Org Chart Level Component
interface OrgLevelProps {
  title: string;
  employees: Employee[];
  level: number;
  color: string;
  onViewDetails: (emp: Employee) => void;
  onEditManager: (emp: Employee) => void;
  canEdit: boolean;
}

const OrgLevel: React.FC<OrgLevelProps> = ({
  title,
  employees,
  level,
  color,
  onViewDetails,
  onEditManager,
  canEdit,
}) => {
  if (employees.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            width: 4,
            height: 40,
            bgcolor: color,
            mr: 2,
            borderRadius: 1,
          }}
        />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {employees.length} employee{employees.length > 1 ? 's' : ''}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {employees.map((employee) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={employee.id}>
            <EmployeeCard
              employee={employee}
              level={level}
              onViewDetails={onViewDetails}
              onEditManager={onEditManager}
              canEdit={canEdit}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export const HierarchyPage: React.FC = () => {
  const { canViewHierarchy, isAdmin } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchAllEmployees();
  }, []);

  const fetchAllEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 [HIERARCHY] Fetching all employees...');
      
      const response = await employeeAPI.getEmployees({ limit: 1000 });
      
      let employeeList: Employee[] = [];
      if (Array.isArray(response.data)) {
        employeeList = response.data;
      } else if (response.data && response.data.employees) {
        employeeList = response.data.employees;
      }
      
      console.log('✅ [HIERARCHY] Loaded employees:', employeeList.length);
      setEmployees(employeeList);
    } catch (err) {
      console.error('❌ [HIERARCHY] Failed to load employees:', err);
      setError('Failed to load employee hierarchy');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  const handleEditManager = (employee: Employee) => {
    // TODO: Implement manager reassignment dialog
    console.log('Edit manager for:', employee.name);
  };

  // Group employees by role
  const generalManagers = employees.filter((e) => e.role === 'General Manager');
  const salesManagers = employees.filter((e) => e.role === 'Sales Manager');
  const teamLeads = employees.filter((e) => e.role === 'Team Lead');
  const advisors = employees.filter((e) => e.role === 'Advisor');

  // Filter by search query
  const filterEmployees = (empList: Employee[]) => {
    if (!searchQuery) return empList;
    return empList.filter(
      (e) =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (!canViewHierarchy()) {
    return (
      <Box>
        <Alert severity="error">
          You don't have permission to view the employee hierarchy.
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
          <AccountTree sx={{ verticalAlign: 'middle', mr: 1 }} />
          Organization Hierarchy
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visual representation of your sales team structure
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Employees
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {employees.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#1976d2', width: 48, height: 48 }}>
                  <Person />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Sales Managers
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {salesManagers.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#388e3c', width: 48, height: 48 }}>
                  <EmojiEvents />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Team Leads
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {teamLeads.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#f57c00', width: 48, height: 48 }}>
                  <SupervisedUserCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Advisors
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {advisors.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#7b1fa2', width: 48, height: 48 }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and View Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search employees..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Org Chart View">
            <IconButton
              color={viewMode === 'chart' ? 'primary' : 'default'}
              onClick={() => setViewMode('chart')}
            >
              <AccountTree />
            </IconButton>
          </Tooltip>
          <Tooltip title="List View">
            <IconButton
              color={viewMode === 'list' ? 'primary' : 'default'}
              onClick={() => setViewMode('list')}
            >
              <ViewList />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Org Chart View */}
      {viewMode === 'chart' && (
        <Box>
          {/* General Managers */}
          <OrgLevel
            title="General Managers"
            employees={filterEmployees(generalManagers)}
            level={0}
            color="#1976d2"
            onViewDetails={handleViewDetails}
            onEditManager={handleEditManager}
            canEdit={isAdmin()}
          />

          {/* Sales Managers */}
          <OrgLevel
            title="Sales Managers"
            employees={filterEmployees(salesManagers)}
            level={1}
            color="#388e3c"
            onViewDetails={handleViewDetails}
            onEditManager={handleEditManager}
            canEdit={isAdmin()}
          />

          {/* Team Leads */}
          <OrgLevel
            title="Team Leads"
            employees={filterEmployees(teamLeads)}
            level={2}
            color="#f57c00"
            onViewDetails={handleViewDetails}
            onEditManager={handleEditManager}
            canEdit={isAdmin()}
          />

          {/* Customer Advisors */}
          <OrgLevel
            title="Customer Advisors"
            employees={filterEmployees(advisors)}
            level={3}
            color="#7b1fa2"
            onViewDetails={handleViewDetails}
            onEditManager={handleEditManager}
            canEdit={isAdmin()}
          />
        </Box>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent>
            <Box sx={{ overflowX: 'auto' }}>
              {filterEmployees(employees).map((employee) => (
                <Paper
                  key={employee.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => handleViewDetails(employee)}
                >
                  <Avatar
                    sx={{
                      bgcolor: ROLE_COLORS[employee.role as keyof typeof ROLE_COLORS] || '#666',
                      width: 48,
                      height: 48,
                    }}
                  >
                    {getInitials(employee.name)}
                  </Avatar>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {employee.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        label={employee.role}
                        size="small"
                        sx={{ bgcolor: ROLE_COLORS[employee.role as keyof typeof ROLE_COLORS], color: 'white' }}
                      />
                      {employee.managerName && (
                        <Typography variant="caption" color="text.secondary">
                          Reports to: {employee.managerName}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      <Email sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                      {employee.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <Phone sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                      {employee.phone}
                    </Typography>
                  </Box>

                  {employee.subordinateCount !== undefined && employee.subordinateCount > 0 && (
                    <Chip
                      label={`${employee.subordinateCount} reports`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  )}
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Employee Details Sidebar - TODO */}
      {/* {selectedEmployee && (
        <EmployeeDetailsSidebar
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )} */}
    </Box>
  );
};
