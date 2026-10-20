import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ThemeProvider,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button as MuiButton,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  Chip,
} from '@mui/material';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';
import { vastraTheme } from '../theme/muiTheme.js';
import { useAuthStore } from '../store/authStore.js';
import { api } from '../lib/api.js';
import { User } from '../types/index.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth, syncSupabaseUser } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Email validation regex
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSuccessfulAuth = (authenticatedUser: User) => {
    setSuccessMessage('Authentication successful. Redirecting to storefront...');
    setTimeout(() => {
      if (authenticatedUser.role === 'ADMIN' && from === '/') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    if (!isEmailValid) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    try {
      setIsLoading(true);

      // 1. Try Supabase Auth first if configured
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (!error && data.user) {
            const syncedUser = await syncSupabaseUser(data.user);
            handleSuccessfulAuth(syncedUser);
            return;
          }
        } catch {
          // Fall back gracefully to database auth
        }
      }

      // 2. Direct backend database authentication
      const res = await api.post<{
        data: { user: User; token: string };
      }>('/auth/login', {
        email: email.trim(),
        password,
      });

      setAuth(res.data.user, res.data.token);
      handleSuccessfulAuth(res.data.user);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google 1-Click Sign In via Supabase OAuth
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMessage(null);

      if (!isSupabaseConfigured) {
        setErrorMessage(
          'Supabase OAuth requires your VITE_SUPABASE_ANON_KEY in client/.env. You can use the Quick Demo Credentials below to test sign-in immediately!'
        );
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/',
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAutofillDemo = (demoType: 'customer' | 'admin') => {
    if (demoType === 'customer') {
      setEmail('customer@vastrastore.com');
      setPassword('Customer@12345');
    } else {
      setEmail('admin@vastrastore.com');
      setPassword('Admin@12345');
    }
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <ThemeProvider theme={vastraTheme}>
      <Box
        sx={{
          minHeight: '75vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 8,
          backgroundColor: '#FDFBF7',
        }}
      >
        <Card
          sx={{
            maxWidth: 440,
            width: '100%',
            p: { xs: 2.5, sm: 4 },
            border: '1px solid #EAE4D9',
            backgroundColor: '#FFFFFF',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Brand Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  letterSpacing: '0.25em',
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 700,
                  color: '#22201E',
                  fontSize: '1.25rem',
                }}
              >
                TANTUVI ATELIER
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mt: 1.5,
                  fontWeight: 600,
                  color: '#22201E',
                  fontSize: '1.2rem',
                }}
              >
                Sign In to Your Account
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B655F', fontSize: '0.8rem', mt: 0.5 }}>
                Access your orders, addresses, and curated handloom wishlist
              </Typography>
            </Box>

            {/* Quick Demo Credentials Bar */}
            <Box
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#FAF7F2',
                border: '1px solid #EAE4D9',
                borderRadius: 1,
              }}
            >
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                  <Shield size={14} color="#8C4A2F" />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#8C4A2F' }}>
                    Quick Demo Credentials
                  </Typography>
                </Stack>
                <Chip label="One-Click" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
              </Stack>
              <Stack direction="row" spacing={1.5}>
                <MuiButton
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={() => handleAutofillDemo('customer')}
                  sx={{
                    borderColor: '#EAE4D9',
                    color: '#22201E',
                    fontSize: '0.72rem',
                    textTransform: 'none',
                    py: 0.75,
                    '&:hover': { borderColor: '#22201E', backgroundColor: '#FFFFFF' },
                  }}
                >
                  Demo Customer
                </MuiButton>
                <MuiButton
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={() => handleAutofillDemo('admin')}
                  sx={{
                    borderColor: '#EAE4D9',
                    color: '#22201E',
                    fontSize: '0.72rem',
                    textTransform: 'none',
                    py: 0.75,
                    '&:hover': { borderColor: '#22201E', backgroundColor: '#FFFFFF' },
                  }}
                >
                  Store Admin
                </MuiButton>
              </Stack>
            </Box>

            {/* Google OAuth Button */}
            <MuiButton
              variant="outlined"
              fullWidth
              disabled={isGoogleLoading || isLoading}
              onClick={handleGoogleSignIn}
              sx={{
                py: 1.25,
                mb: 2.5,
                borderColor: '#EAE4D9',
                color: '#22201E',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                display: 'flex',
                gap: 1.5,
                '&:hover': {
                  borderColor: '#22201E',
                  backgroundColor: '#FAF7F2',
                },
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
            </MuiButton>

            <Divider sx={{ my: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#8C857B', px: 1, letterSpacing: '0.05em' }}>
                OR WITH EMAIL
              </Typography>
            </Divider>

            {/* Alert Messages */}
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2.5, fontSize: '0.8rem', borderRadius: 1 }}>
                {errorMessage}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 2.5, fontSize: '0.8rem', borderRadius: 1 }}>
                {successMessage}
              </Alert>
            )}

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  required
                  size="small"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={Boolean(email && !isEmailValid)}
                  helperText={
                    email && !isEmailValid
                      ? 'Please enter a valid email address'
                      : email && isEmailValid
                      ? 'Valid email format'
                      : ''
                  }
                  slotProps={{
                    formHelperText: {
                      sx: {
                        color: email && isEmailValid ? '#15803D !important' : undefined,
                        fontSize: '0.72rem',
                      },
                    },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={16} color="#8C857B" />
                        </InputAdornment>
                      ),
                      endAdornment: email && isEmailValid ? (
                        <InputAdornment position="end">
                          <CheckCircle2 size={16} color="#15803D" />
                        </InputAdornment>
                      ) : undefined,
                    },
                  }}
                />

                <Box>
                  <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    required
                    size="small"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock size={16} color="#8C857B" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                              aria-label="Toggle password visibility"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.75 }}>
                    <Link
                      to="/forgot-password"
                      style={{
                        fontSize: '0.75rem',
                        color: '#8C4A2F',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      Forgot password?
                    </Link>
                  </Box>
                </Box>

                <MuiButton
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    py: 1.25,
                    backgroundColor: '#8C4A2F',
                    '&:hover': { backgroundColor: '#703A24' },
                    fontSize: '0.85rem',
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <span>Sign In</span>
                      <ArrowRight size={16} />
                    </Stack>
                  )}
                </MuiButton>
              </Stack>
            </form>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 4, pt: 2.5, borderTop: '1px solid #EAE4D9' }}>
              <Typography variant="body2" sx={{ color: '#6B655F', fontSize: '0.8rem' }}>
                New to Tantuvi?{' '}
                <Link
                  to="/register"
                  style={{
                    color: '#8C4A2F',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Create an Account
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
};
