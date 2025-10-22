// Reusable Form Dialog Component
// This file contains a generic form dialog for CRUD operations

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  title: string;
  children: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  disabled?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  hideActions?: boolean;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Save',
  cancelText = 'Cancel',
  loading = false,
  disabled = false,
  maxWidth = 'sm',
  fullWidth = true,
  hideActions = false,
}) => {
  // Hide actions if hideActions is true OR if onSubmit is not provided
  const showActions = !hideActions && onSubmit !== undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: 'text.secondary',
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ pt: 1 }}>
          {children}
        </Box>
      </DialogContent>

      {showActions && (
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            color="inherit"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onSubmit}
            variant="contained"
            disabled={loading || disabled}
            sx={{ minWidth: 100 }}
          >
            {loading ? 'Saving...' : submitText}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

