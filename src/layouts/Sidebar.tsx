// Sidebar Navigation Component
// This file contains the sidebar navigation with role-based menu items

import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  People,
  Inventory,
  Event,
  QuestionAnswer,
  Description,
  AccountTree,
  CloudUpload,
  ManageAccounts,
  Business,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { NAVIGATION_ITEMS } from '@/utils/constants';
import type { RoleName } from '@/api/types';

interface SidebarProps {
  onItemClick?: () => void;
}

const iconMap: Record<string, React.ComponentType> = {
  Dashboard,
  CloudUpload,
  People,
  ManageAccounts,
  Business,
  Inventory,
  Event,
  QuestionAnswer,
  Description,
  AccountTree,
};

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onItemClick) {
      onItemClick();
    }
  };

  // Filter navigation items based on user role
  const filteredNavItems = NAVIGATION_ITEMS.filter(item => {
    // Check if user has any of the required roles
    return item.roles.some(role => hasRole(role as RoleName));
  });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand Section */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderBottomColor: 'divider' }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          🚗 AutoAdmin
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Management Dashboard
        </Typography>
      </Box>

      {/* Navigation Items */}
      <Box sx={{ flexGrow: 1, pt: 2 }}>
        <List sx={{ px: 1 }}>
          {filteredNavItems.map((item) => {
            const IconComponent = iconMap[item.icon];
            const isActive = location.pathname === item.path;

            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'primary.contrastText' : 'text.primary',
                    '&:hover': {
                      backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? 'primary.contrastText' : 'text.secondary',
                      minWidth: 40,
                    }}
                  >
                    <IconComponent />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer Section */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderTopColor: 'divider' }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Automotive Admin v1.0.0
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          © 2024 All Rights Reserved
        </Typography>
      </Box>
    </Box>
  );
};
