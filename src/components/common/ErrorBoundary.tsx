// Error Boundary Component
// Catches JavaScript errors anywhere in the child component tree

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Alert, AlertTitle, Button, Typography } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            p: 3,
            bgcolor: 'background.default',
          }}
        >
          <Box sx={{ maxWidth: 600, width: '100%' }}>
            <Alert severity="error" icon={<ErrorOutline />}>
              <AlertTitle>Application Error</AlertTitle>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Something went wrong. Please try refreshing the page.
              </Typography>
              
              {this.state.error && (
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: 'rgba(0,0,0,0.1)', 
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  maxHeight: 200,
                  overflow: 'auto'
                }}>
                  <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Error Details:
                  </Typography>
                  <Typography variant="caption" display="block">
                    {this.state.error.toString()}
                  </Typography>
                  {this.state.errorInfo && (
                    <Typography variant="caption" display="block" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                      {this.state.errorInfo.componentStack}
                    </Typography>
                  )}
                </Box>
              )}

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={this.handleReset}
                  size="small"
                >
                  Go to Dashboard
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => window.location.reload()}
                  size="small"
                >
                  Refresh Page
                </Button>
              </Box>
            </Alert>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

