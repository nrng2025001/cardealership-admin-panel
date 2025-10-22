// Admin Bulk Upload Page
// This page allows admin users to upload Excel/CSV files for bulk booking imports
// Integrated with backend API

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
} from '@mui/material';
import {
  CloudUpload,
  FileUpload,
  CheckCircle,
  Error,
  Description,
  History,
  Download,
  Visibility,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useAuth } from '@/context/AuthContext';
import { bookingAPI } from '@/api/bookings';
import { EnhancedUpload } from '@/components/common/EnhancedUpload';
import type { BulkImportResponse } from '@/api/types';

export const BulkUploadPage: React.FC = () => {
  const { user, canBulkImport } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dealerCode, setDealerCode] = useState('TATA001');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<BulkImportResponse | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Import history
  const [importHistory, setImportHistory] = useState<BulkImportResponse[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalImports, setTotalImports] = useState(0);

  // Preview dialog
  const [openPreview, setOpenPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (canBulkImport()) {
      loadImportHistory();
    }
  }, [historyPage]);

  const loadImportHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await bookingAPI.getImportHistory(historyPage, 10);
      if (response.data && response.data.imports) {
        // Ensure each import has an id field
        const importsWithIds = response.data.imports.map((imp: any, index: number) => ({
          ...imp,
          id: imp.id || `import-${index}`,
        }));
        setImportHistory(importsWithIds);
        setTotalImports(response.data.pagination?.total || 0);
      }
    } catch (err: any) {
      console.error('Failed to load import history:', err);
      setImportHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDownloadErrors = async (importId: string) => {
    try {
      const blob = await bookingAPI.downloadImportErrors(importId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `import-errors-${importId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Failed to download error report');
    }
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
      ];
      
      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
        setError('Please select a valid Excel (.xlsx, .xls) or CSV file');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  }, []);

  const handlePreview = async () => {
    if (!selectedFile || !dealerCode) {
      setError('Please select a file and enter dealer code');
      return;
    }

    setPreviewLoading(true);
    setError('');

    try {
      const response = await bookingAPI.previewBulkImport(selectedFile, dealerCode);
      
      if (response.success && response.data?.preview) {
        setPreviewData(response.data.preview);
        setOpenPreview(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to preview file');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleUploadWithProgress = async (file: File, onProgress?: (progress: number) => void) => {
    setIsUploading(true);
    setError('');
    setSuccess('');
    setUploadResult(null);
    setUploadProgress(0);

    try {
      const response = await bookingAPI.uploadBulkBookings(
        file, 
        dealerCode,
        (progress) => {
          setUploadProgress(progress);
          onProgress?.(progress);
        }
      );

      // Handle response - check if it exists and has expected structure
      if (!response) {
        throw new Error('No response received from server');
      }

      if (response.success && response.data) {
        setUploadResult(response.data);
        setSuccess(`Successfully imported ${response.data.successfulRows || 0} bookings!`);
        
        // Refresh import history
        loadImportHistory();
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || err.message || 'Upload failed');
      throw err; // Re-throw for EnhancedUpload to handle
    } finally {
      setIsUploading(false);
    }

    return {
      totalRows: uploadResult?.totalRows || 0,
      successfulRows: uploadResult?.successfulRows || 0,
      failedRows: uploadResult?.failedRows || 0,
      errors: uploadResult?.errors || [],
      fileName: file.name,
      fileSize: file.size
    };
  };

  const handleUpload = async () => {
    if (!selectedFile || !dealerCode) {
      setError('Please select a file and enter dealer code');
      return;
    }

    await handleUploadWithProgress(selectedFile);
  };

  const importHistoryColumns: GridColDef[] = [
    {
      field: 'fileName',
      headerName: 'File Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const statusColors: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
          COMPLETED: 'success',
          FAILED: 'error',
          PROCESSING: 'warning',
          PENDING: 'info',
        };
        const status = params.value as string;
        if (!status) return <Chip label="UNKNOWN" color="default" size="small" />;
        return (
          <Chip
            label={status}
            color={statusColors[status] || 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'totalRecords',
      headerName: 'Total',
      width: 100,
      align: 'center',
      type: 'number',
    },
    {
      field: 'successfulRecords',
      headerName: 'Success',
      width: 100,
      align: 'center',
      type: 'number',
      renderCell: (params) => (
        <Chip label={params.value || 0} color="success" size="small" variant="outlined" />
      ),
    },
    {
      field: 'failedRecords',
      headerName: 'Failed',
      width: 100,
      align: 'center',
      type: 'number',
      renderCell: (params) => {
        const value = params.value || 0;
        return (
          <Chip 
            label={value} 
            color={value > 0 ? 'error' : 'default'} 
            size="small" 
            variant="outlined" 
          />
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Uploaded',
      width: 150,
      valueGetter: (value: any) => {
        if (!value) return null;
        return new Date(value);
      },
      renderCell: (params) => {
        if (!params.value) return '-';
        try {
          return params.value.toLocaleString();
        } catch {
          return '-';
        }
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => {
        const failedRecords = params.row.failedRecords || 0;
        const importId = params.row.id;
        
        if (failedRecords > 0 && importId) {
          return (
            <IconButton
              size="small"
              onClick={() => handleDownloadErrors(importId)}
              title="Download Error Report"
            >
              <Download fontSize="small" />
            </IconButton>
          );
        }
        return null;
      },
    },
  ];

  if (!canBulkImport()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">You do not have permission to access bulk import.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CloudUpload color="primary" />
        Bulk Booking Import
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome, {user?.name}! Upload Excel/CSV files to bulk import booking data.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Instructions Card */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
          💡 Pro Tip: Assign Advisors After Import
        </Typography>
        <Typography variant="body2">
          Import your bookings using Excel/CSV, then use the <strong>Bulk Assign</strong> or <strong>Auto-Assign</strong> features on the Bookings page to quickly assign advisors to multiple bookings at once!
        </Typography>
      </Alert>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Upload Section */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileUpload color="primary" />
                Upload Excel/CSV File
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Dealer Code"
                  value={dealerCode}
                  onChange={(e) => setDealerCode(e.target.value)}
                  margin="normal"
                  helperText="Enter the dealer code for these bookings"
                  required
                />

                <EnhancedUpload
                  onUpload={async (file, onProgress) => {
                    setSelectedFile(file);
                    const result = await handleUploadWithProgress(file, onProgress);
                    return result;
                  }}
                  acceptedTypes={['.xlsx', '.xls', '.csv']}
                  maxSize={10}
                  disabled={!dealerCode}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>
                Required Excel Columns:
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2"><strong>Required:</strong></Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>• customer_name</Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>• customer_phone</Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>• dealer_code</Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>• variant</Typography>
                
                <Typography variant="body2" sx={{ mt: 1 }}><strong>Optional:</strong></Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>• customer_email, color, zone, region</Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>• booking_date, expected_delivery_date</Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>• finance_required, financer_name</Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>• advisor_id, stock_availability</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Latest Upload Result */}
        {uploadResult && (
          <Box sx={{ gridColumn: '1 / -1' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                  Latest Upload Result
                </Typography>
                
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">File:</Typography>
                    <Typography variant="body2" fontWeight="bold">{uploadResult.fileName || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Status:</Typography>
                    <Chip label={uploadResult.status || 'UNKNOWN'} color="success" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Total Records:</Typography>
                    <Typography variant="body2" fontWeight="bold">{uploadResult.totalRecords || 0}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="success.main">Successful:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {uploadResult.successfulRecords || 0}
                              </Typography>
                            </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color={(uploadResult.failedRecords || 0) > 0 ? 'error.main' : 'text.secondary'}>
                      Failed:
                            </Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold" 
                      color={(uploadResult.failedRecords || 0) > 0 ? 'error.main' : 'text.secondary'}
                    >
                      {uploadResult.failedRecords || 0}
                                  </Typography>
                              </Box>
                  
                  {(uploadResult.failedRecords || 0) > 0 && uploadResult.id && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Download />}
                      onClick={() => handleDownloadErrors(uploadResult.id)}
                      sx={{ mt: 2 }}
                      fullWidth
                    >
                      Download Error Report
                    </Button>
                  )}
                </Paper>
            </CardContent>
          </Card>
        </Box>
        )}
      </Box>

      {/* Import History */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <History color="primary" />
            Import History
          </Typography>
          
          <DataGrid
            rows={importHistory}
            columns={importHistoryColumns}
            loading={loadingHistory}
            paginationMode="server"
            paginationModel={{ page: historyPage - 1, pageSize: 10 }}
            onPaginationModelChange={(model) => setHistoryPage(model.page + 1)}
            rowCount={totalImports}
            pageSizeOptions={[10, 20, 50]}
            autoHeight
            disableRowSelectionOnClick
          />
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="md" fullWidth>
        <DialogTitle>Import Preview</DialogTitle>
        <DialogContent>
          {previewData && (
            <Box>
              <Alert severity={previewData.invalidRows > 0 ? 'warning' : 'success'} sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Total Rows: {previewData.totalRows} | 
                  Valid: {previewData.validRows} | 
                  Invalid: {previewData.invalidRows}
              </Typography>
              </Alert>

              {previewData.errors && previewData.errors.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Validation Errors:
              </Typography>
                  {previewData.errors.slice(0, 10).map((error: any, i: number) => (
                    <Typography key={i} variant="caption" color="error" display="block">
                      Row {error.row}: {error.message}
              </Typography>
                  ))}
                  {previewData.errors.length > 10 && (
                    <Typography variant="caption" color="text.secondary">
                      ... and {previewData.errors.length - 10} more errors
              </Typography>
                  )}
                </Box>
              )}
            
              <Typography variant="subtitle2" gutterBottom>
                Sample Data (first 5 rows):
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Row</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Variant</TableCell>
                      <TableCell>Dealer</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewData.sampleData?.slice(0, 5).map((row: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{row.customer_name}</TableCell>
                        <TableCell>{row.customer_phone}</TableCell>
                        <TableCell>{row.variant}</TableCell>
                        <TableCell>{row.dealer_code}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Close</Button>
          <Button 
            onClick={() => {
              setOpenPreview(false);
              handleUpload();
            }} 
            variant="contained"
            disabled={previewData?.invalidRows > 0}
          >
            Proceed with Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
