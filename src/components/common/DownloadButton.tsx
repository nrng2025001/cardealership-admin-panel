import React, { useState } from 'react';
import {
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Stack
} from '@mui/material';
import {
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

interface DownloadFilters {
  format: 'excel' | 'json';
  startDate?: string;
  endDate?: string;
  status?: string;
  category?: string;
  advisorId?: string;
}

interface DownloadButtonProps {
  type: 'bookings' | 'enquiries';
  onDownload: (filters: DownloadFilters) => Promise<Blob>;
  availableStatuses?: string[];
  availableCategories?: string[];
  availableAdvisors?: Array<{ id: string; name: string }>;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  type,
  onDownload,
  availableStatuses = [],
  availableCategories = [],
  availableAdvisors = []
}) => {
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<DownloadFilters>({
    format: 'excel',
    startDate: '',
    endDate: '',
    status: '',
    category: '',
    advisorId: ''
  });
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    try {
      console.log(`📥 [DOWNLOAD] Starting ${type} download with filters:`, filters);
      
      const blob = await onDownload(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileExtension = filters.format === 'excel' ? 'xlsx' : 'json';
      const fileName = `${type}_export_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setMessage({ text: 'Download completed successfully!', type: 'success' });
      console.log('✅ [DOWNLOAD] Download completed:', fileName);
    } catch (error) {
      console.error('❌ [DOWNLOAD] Download failed:', error);
      setMessage({ text: 'Download failed. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof DownloadFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      format: 'excel',
      startDate: '',
      endDate: '',
      status: '',
      category: '',
      advisorId: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== 'excel');

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
          onClick={handleDownload}
          disabled={loading}
          sx={{ minWidth: 140 }}
        >
          {loading ? 'Downloading...' : `Download ${type}`}
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={() => setShowFilters(!showFilters)}
          color={hasActiveFilters ? 'primary' : 'inherit'}
        >
          Filters {hasActiveFilters && <Chip label="Active" size="small" sx={{ ml: 1 }} />}
        </Button>
      </Stack>

      {showFilters && (
        <Box sx={{ 
          p: 2, 
          border: '1px solid', 
          borderColor: 'divider', 
          borderRadius: 1, 
          bgcolor: 'background.paper',
          mb: 2 
        }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Format</InputLabel>
              <Select
                value={filters.format}
                onChange={(e) => handleFilterChange('format', e.target.value)}
                label="Format"
              >
                <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />

            <TextField
              size="small"
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />

            {type === 'bookings' && availableStatuses.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {availableStatuses.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {type === 'enquiries' && availableCategories.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {availableCategories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {type === 'bookings' && availableAdvisors.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Advisor</InputLabel>
                <Select
                  value={filters.advisorId}
                  onChange={(e) => handleFilterChange('advisorId', e.target.value)}
                  label="Advisor"
                >
                  <MenuItem value="">All Advisors</MenuItem>
                  {availableAdvisors.map(advisor => (
                    <MenuItem key={advisor.id} value={advisor.id}>{advisor.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Button
              size="small"
              variant="text"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              Clear
            </Button>
          </Stack>

          {hasActiveFilters && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {filters.startDate && (
                <Chip 
                  label={`From: ${filters.startDate}`} 
                  size="small" 
                  onDelete={() => handleFilterChange('startDate', '')}
                />
              )}
              {filters.endDate && (
                <Chip 
                  label={`To: ${filters.endDate}`} 
                  size="small" 
                  onDelete={() => handleFilterChange('endDate', '')}
                />
              )}
              {filters.status && (
                <Chip 
                  label={`Status: ${filters.status}`} 
                  size="small" 
                  onDelete={() => handleFilterChange('status', '')}
                />
              )}
              {filters.category && (
                <Chip 
                  label={`Category: ${filters.category}`} 
                  size="small" 
                  onDelete={() => handleFilterChange('category', '')}
                />
              )}
              {filters.advisorId && (
                <Chip 
                  label={`Advisor: ${availableAdvisors.find(a => a.id === filters.advisorId)?.name}`} 
                  size="small" 
                  onDelete={() => handleFilterChange('advisorId', '')}
                />
              )}
            </Box>
          )}
        </Box>
      )}

      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setMessage(null)} 
          severity={message?.type || 'info'}
          sx={{ width: '100%' }}
        >
          {message?.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};
