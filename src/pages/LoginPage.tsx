// Login Page Component
// This file contains the login form for user authentication

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Avatar,
} from '@mui/material';
import { Login as LoginIcon, DeleteSweep as ClearIcon } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔐 [LOGIN PAGE] Form submitted for:', email);
    
    // Clear any stale data from localStorage before login
    console.log('🧹 [LOGIN PAGE] Clearing stale localStorage data...');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');

    try {
      const success = await login(email, password);
      console.log('✅ [LOGIN PAGE] Login result:', success ? 'SUCCESS' : 'FAILED');
      
      if (success) {
        console.log('🎉 [LOGIN PAGE] Redirecting to dashboard...');
        navigate('/');
      } else {
        console.error('❌ [LOGIN PAGE] Login failed - invalid credentials');
        setError('Invalid email or password. Please check your credentials and try again.');
      }
    } catch (err: any) {
      console.error('❌ [LOGIN PAGE] Login exception:', err);
      setError(`Login failed: ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
      console.log('🏁 [LOGIN PAGE] Login attempt completed');
    }
  };

  const handleClearAllData = async () => {
    console.log('🧹 [LOGIN PAGE] CLEAR ALL DATA button clicked');
    
    try {
      // Clear localStorage
      localStorage.clear();
      console.log('✅ [LOGIN PAGE] localStorage cleared');
      
      // Clear sessionStorage
      sessionStorage.clear();
      console.log('✅ [LOGIN PAGE] sessionStorage cleared');
      
      // Sign out from Firebase
      await signOut(auth);
      console.log('✅ [LOGIN PAGE] Firebase signed out');
      
      // Reload page
      console.log('🔄 [LOGIN PAGE] Reloading page...');
      window.location.reload();
    } catch (error) {
      console.error('❌ [LOGIN PAGE] Clear data failed:', error);
      // Force reload anyway
      window.location.reload();
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    console.log('🚀 [LOGIN PAGE] ========================================');
    console.log('🚀 [LOGIN PAGE] BUTTON CLICKED!');
    console.log('🚀 [LOGIN PAGE] Demo login clicked for:', demoEmail);
    console.log('🚀 [LOGIN PAGE] ========================================');
    
    // Clear any stale data from localStorage before login
    console.log('🧹 [LOGIN PAGE] Clearing stale localStorage data...');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    try {
      console.log('📞 [LOGIN PAGE] Calling login function...');
      const success = await login(demoEmail, demoPassword);
      console.log('✅ [LOGIN PAGE] Login function returned:', success);
      console.log('✅ [LOGIN PAGE] Success type:', typeof success);
      
      if (success) {
        console.log('🎉 [LOGIN PAGE] Login was successful!');
        console.log('🧭 [LOGIN PAGE] About to call navigate("/")...');
        navigate('/', { replace: true });
        console.log('✅ [LOGIN PAGE] navigate() called successfully');
        
        // Add a small delay to see if navigation is working
        setTimeout(() => {
          console.log('⏰ [LOGIN PAGE] 1 second after navigate - checking location:', window.location.pathname);
        }, 1000);
      } else {
        console.error('❌ [LOGIN PAGE] Login returned false - invalid credentials');
        setError(`Demo login failed for ${demoEmail}. Please check backend logs.`);
      }
    } catch (err: any) {
      console.error('❌ [LOGIN PAGE] Demo login exception:', err);
      console.error('❌ [LOGIN PAGE] Error stack:', err.stack);
      setError(`Demo login failed: ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
      console.log('🏁 [LOGIN PAGE] Demo login attempt completed');
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        {/* Logo Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              mx: 'auto',
              mb: 2,
              fontSize: '2rem',
            }}
          >
            🚗
          </Avatar>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Automotive Admin Portal
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Admin access for bulk data management
          </Typography>
        </Box>

        {/* Login Card */}
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LoginIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography component="h2" variant="h5">
                  Sign In
                </Typography>
              </Box>
              
              {/* Clear Data Button */}
              <Button
                type="button"
                variant="outlined"
                size="small"
                color="error"
                onClick={handleClearAllData}
                startIcon={<ClearIcon />}
                sx={{ fontSize: '0.75rem', py: 0.5 }}
              >
                Clear Cache
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading && (
              <Alert severity="info" sx={{ mb: 2 }}>
                ⏳ Connecting to backend... First login may take up to 60 seconds (backend waking up)
              </Alert>
            )}

            <Box component="form" onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔥 [LOGIN PAGE] FORM SUBMIT EVENT TRIGGERED!');
              handleSubmit(e);
            }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    console.log('⌨️ [LOGIN PAGE] Enter key pressed in email field');
                  }
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    console.log('⌨️ [LOGIN PAGE] Enter key pressed in password field');
                  }
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>

            {/* Quick Login Buttons */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                Quick Login (Test Accounts):
              </Typography>
              
              <Button
                type="button"
                variant="contained"
                fullWidth
                onClick={() => handleDemoLogin('admin.new@test.com', 'testpassword123')}
                disabled={loading}
                sx={{ 
                  bgcolor: 'error.main', 
                  '&:hover': { bgcolor: 'error.dark' },
                  py: 1.5,
                  mb: 1
                }}
                startIcon={<LoginIcon />}
              >
                Login as Admin (Recommended)
              </Button>

              <Button
                type="button"
                variant="outlined"
                fullWidth
                onClick={() => handleDemoLogin('admin@cardealership.com', 'testpassword123')}
                disabled={loading}
                sx={{ 
                  py: 1.5,
                  mb: 1
                }}
                startIcon={<LoginIcon />}
              >
                Admin (Alternative)
              </Button>

              <Button
                type="button"
                variant="outlined"
                fullWidth
                onClick={() => handleDemoLogin('advisor.new@test.com', 'testpassword123')}
                disabled={loading}
                sx={{ 
                  py: 1.5
                }}
                startIcon={<LoginIcon />}
              >
                Login as Advisor (View Only)
              </Button>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontWeight: 'bold' }}>
                📝 Available Test Accounts:
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                <strong>Admin (Primary):</strong> admin.new@test.com / testpassword123
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                <strong>Admin (Alt):</strong> admin@cardealership.com / testpassword123
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', mt: 0.5 }}>
                <strong>Advisor:</strong> advisor.new@test.com / testpassword123
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

