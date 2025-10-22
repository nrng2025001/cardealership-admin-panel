// User Management Page
// Admin-only page for managing users, roles, and permissions

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { employeeAPI } from '@/api/employees';
import { useAuth } from '@/context/AuthContext';
import type { User, RoleName } from '@/api/types';

export const UserManagementPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    roleName: 'CUSTOMER_ADVISOR' as RoleName,
  });
  const [newRole, setNewRole] = useState<RoleName>('CUSTOMER_ADVISOR');
  const [newPassword, setNewPassword] = useState('');

  const roleOptions: RoleName[] = [
    'ADMIN',
    'GENERAL_MANAGER',
    'SALES_MANAGER',
    'TEAM_LEAD',
    'CUSTOMER_ADVISOR',
  ];

  const roleColors: Record<RoleName, 'error' | 'warning' | 'info' | 'success' | 'default'> = {
    ADMIN: 'error',
    GENERAL_MANAGER: 'warning',
    SALES_MANAGER: 'info',
    TEAM_LEAD: 'success',
    CUSTOMER_ADVISOR: 'default',
  };

  useEffect(() => {
    if (!isAdmin()) {
      setError('You do not have permission to access this page');
      return;
    }
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await employeeAPI.getUsers({ page, limit: 20 });
      
      if (response.success && response.data) {
        setUsers(response.data.users || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalUsers(response.data.pagination?.total || 0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    console.log('💾 [USER MANAGEMENT] Creating user...');
    console.log('User form data:', newUserForm);
    
    setError('');
    setSuccess('');

    try {
      console.log('📡 [USER MANAGEMENT] Calling API...');
      const response = await employeeAPI.createUser(newUserForm);
      console.log('API Response:', response);
      
      if (response.success) {
        console.log('✅ [USER MANAGEMENT] User created successfully');
        setSuccess(`User ${newUserForm.name} created successfully!`);
        setOpenDialog(false);
        setNewUserForm({
          name: '',
          email: '',
          password: '',
          roleName: 'CUSTOMER_ADVISOR',
        });
        loadUsers();
      }
    } catch (err: any) {
      console.error('❌ [USER MANAGEMENT] Error creating user:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      setError(err.response?.data?.message || err.message || 'Failed to create user');
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    setError('');
    setSuccess('');

    try {
      const response = await employeeAPI.updateUserRole(selectedUser.firebaseUid, newRole);
      
      if (response.success) {
        setSuccess(`Role updated successfully for ${selectedUser.name}`);
        setOpenRoleDialog(false);
        setSelectedUser(null);
        loadUsers();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    setError('');
    setSuccess('');

    try {
      const response = await employeeAPI.resetUserPassword(selectedUser.firebaseUid, newPassword);
      
      if (response.success) {
        setSuccess(`Password reset successfully for ${selectedUser.name}`);
        setOpenPasswordDialog(false);
        setSelectedUser(null);
        setNewPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    }
  };

  const handleToggleActive = async (user: User) => {
    setError('');
    setSuccess('');

    try {
      const response = user.isActive
        ? await employeeAPI.deactivateUser(user.firebaseUid)
        : await employeeAPI.activateUser(user.firebaseUid);
      
      if (response.success) {
        setSuccess(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
        loadUsers();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to toggle user status');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setError('');
    setSuccess('');

    try {
      console.log('🗑️ [USER MANAGEMENT] Deleting user:', selectedUser.firebaseUid, selectedUser.name);
      const response = await employeeAPI.deleteUser(selectedUser.firebaseUid);
      
      if (response.success) {
        console.log('✅ [USER MANAGEMENT] User deleted successfully');
        setSuccess(`User ${selectedUser.name} deleted successfully`);
        setOpenDeleteDialog(false);
        setSelectedUser(null);
        loadUsers();
      }
    } catch (err: any) {
      console.error('❌ [USER MANAGEMENT] Error deleting user:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
      });
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete user';
      setError(errorMsg);
      setOpenDeleteDialog(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 180,
      renderCell: (params) => (
        <Chip
          label={params.row.role.name.replace(/_/g, ' ')}
          color={roleColors[params.row.role.name as RoleName]}
          size="small"
        />
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? 'Active' : 'Inactive'}
          color={params.row.isActive ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 150,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => {
              setSelectedUser(params.row);
              setNewRole(params.row.role.name);
              setOpenRoleDialog(true);
            }}
            title="Edit Role"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setSelectedUser(params.row);
              setOpenPasswordDialog(true);
            }}
            title="Reset Password"
          >
            <LockIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleToggleActive(params.row)}
            title={params.row.isActive ? 'Deactivate' : 'Activate'}
          >
            {params.row.isActive ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setSelectedUser(params.row);
              setOpenDeleteDialog(true);
            }}
            title="Delete User"
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (!isAdmin()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">You do not have permission to access this page.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">User Management</Typography>
        <Box>
          <Button
            startIcon={<RefreshIcon />}
            onClick={loadUsers}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Create User
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Total Users: {totalUsers}
          </Typography>
          
          <DataGrid
            rows={users}
            columns={columns}
            getRowId={(row) => row.firebaseUid}
            loading={loading}
            paginationMode="server"
            paginationModel={{ page: page - 1, pageSize: 20 }}
            onPaginationModelChange={(model) => setPage(model.page + 1)}
            rowCount={totalUsers}
            pageSizeOptions={[10, 20, 50]}
            autoHeight
            disableRowSelectionOnClick
          />
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={newUserForm.name}
            onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={newUserForm.email}
            onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={newUserForm.password}
            onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
            margin="normal"
            helperText="Minimum 6 characters"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={newUserForm.roleName}
              onChange={(e) => setNewUserForm({ ...newUserForm, roleName: e.target.value as RoleName })}
            >
              {roleOptions.map((role) => (
                <MenuItem key={role} value={role}>
                  {role.replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained" disabled={!newUserForm.name || !newUserForm.email || !newUserForm.password}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update User Role</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Updating role for: <strong>{selectedUser?.name}</strong>
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select value={newRole} onChange={(e) => setNewRole(e.target.value as RoleName)}>
              {roleOptions.map((role) => (
                <MenuItem key={role} value={role}>
                  {role.replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRoleDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateRole} variant="contained">
            Update Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reset User Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Resetting password for: <strong>{selectedUser?.name}</strong>
          </Typography>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            helperText="Minimum 6 characters"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained" disabled={newPassword.length < 6}>
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            ⚠️ This action cannot be undone. The user will be permanently removed from the system.
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this user?
          </Typography>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'error.50', 
            border: '1px solid',
            borderColor: 'error.main',
            borderRadius: 1,
          }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {selectedUser?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedUser?.email} • {selectedUser?.role?.name.replace(/_/g, ' ')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} variant="contained" color="error">
            Delete User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

