import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Stack,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

interface UploadResult {
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors?: Array<{ row: number; message: string }>;
  fileName?: string;
  fileSize?: number;
}

interface EnhancedUploadProps {
  onUpload: (file: File, onProgress?: (progress: number) => void) => Promise<UploadResult>;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  templateUrl?: string;
  onTemplateDownload?: () => void;
  disabled?: boolean;
}

export const EnhancedUpload: React.FC<EnhancedUploadProps> = ({
  onUpload,
  acceptedTypes = ['.xlsx', '.xls', '.csv'],
  maxSize = 10,
  templateUrl,
  onTemplateDownload,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      setError(`Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File too large. Maximum size: ${maxSize}MB`);
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadResult(null);
    setError(null);

    try {
      console.log('📤 [UPLOAD] Starting file upload:', file.name);
      
      const result = await onUpload(file, (progressValue) => {
        setProgress(progressValue);
      });

      setUploadResult(result);
      console.log('✅ [UPLOAD] Upload completed:', result);
    } catch (err) {
      console.error('❌ [UPLOAD] Upload failed:', err);
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [onUpload, acceptedTypes, maxSize]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect, disabled, uploading]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const clearResult = () => {
    setUploadResult(null);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          textAlign: 'center',
          border: dragActive ? '2px dashed' : '1px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          backgroundColor: dragActive ? 'primary.50' : 'background.paper',
          cursor: disabled || uploading ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: disabled ? 'grey.300' : 'primary.main',
            backgroundColor: disabled ? 'background.paper' : 'primary.50'
          }
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          style={{ display: 'none' }}
          id="file-upload"
          disabled={disabled || uploading}
        />
        
        <label htmlFor="file-upload">
          <Box sx={{ cursor: disabled || uploading ? 'not-allowed' : 'pointer' }}>
            <CloudUploadIcon 
              sx={{ 
                fontSize: 48, 
                color: dragActive ? 'primary.main' : 'grey.400',
                mb: 2 
              }} 
            />
            
            <Typography variant="h6" gutterBottom>
              {uploading ? 'Uploading...' : 'Drag & Drop or Click to Upload'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Support for {acceptedTypes.join(', ')} files. Maximum size: {maxSize}MB
            </Typography>

            {!uploading && (
              <Button
                variant="contained"
                component="span"
                disabled={disabled}
                startIcon={<FileIcon />}
                sx={{ mt: 1 }}
              >
                Choose File
              </Button>
            )}
          </Box>
        </label>

        {templateUrl && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={onTemplateDownload}
              disabled={disabled || uploading}
            >
              Download Template
            </Button>
          </Box>
        )}
      </Paper>

      {uploading && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Uploading... {progress}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      )}

      {error && (
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          action={
            <IconButton size="small" onClick={clearResult}>
              <CloseIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {uploadResult && (
        <Alert 
          severity="success" 
          sx={{ mt: 2 }}
          action={
            <IconButton size="small" onClick={clearResult}>
              <CloseIcon />
            </IconButton>
          }
        >
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Upload Successful! 
              {uploadResult.fileName && ` (${uploadResult.fileName})`}
            </Typography>
            
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Chip 
                icon={<CheckCircleIcon />}
                label={`${uploadResult.successfulRows} successful`}
                color="success"
                size="small"
              />
              {uploadResult.failedRows > 0 && (
                <Chip 
                  icon={<ErrorIcon />}
                  label={`${uploadResult.failedRows} failed`}
                  color="error"
                  size="small"
                />
              )}
            </Stack>

            {uploadResult.fileSize && (
              <Typography variant="caption" color="text.secondary">
                File size: {formatFileSize(uploadResult.fileSize)}
              </Typography>
            )}

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="error">
                  Errors found in {uploadResult.errors.length} rows
                </Typography>
              </Box>
            )}
          </Box>
        </Alert>
      )}
    </Box>
  );
};
