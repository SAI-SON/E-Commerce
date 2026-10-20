import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  LinearProgress,
} from '@mui/material';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { vastraTheme } from '../theme/muiTheme.js';
import { useAuthStore } from '../store/authStore.js';
import { api } from '../lib/api.js';
import { User as UserType } from '../types/index.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, syncSupabaseUser } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Real-time validations
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Real-time password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { label: '', percent: 0, color: '#EAE4D9' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: 'Weak', percent: 25, color: '#DC2626' };
    if (score === 2) return { label: 'Fair', percent: 50, color: '#D97706' };
    if (score === 3) return { label: 'Good', percent: 75, color: '#2563EB' };
    return { label: 'Strong', percent: 100, color: '#16A34A' };
  };

  const strength = getPasswordStrength();

  const handleSuccessfulAuth = (user: UserType) => {
    setSuccessMessage('Account created successfully! Redirecting to storefront...');
    setTimeout(() => {
      if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }, 450);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('Please provide both your first and last name.');
      return;
    }

    if (!isEmailValid) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    try {
      setIsLoading(true);

      // 1. If Supabase is active, register in Supabase Auth
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                phone: phone.trim() || undefined,
              },
            },
          });
          if (!error && data.user) {
            const syncedUser = await syncSupabaseUser(data.user);
            handleSuccessfulAuth(syncedUser);
            return;
          }
        } catch {
          // Fall back gracefully to backend database registration
        }
      }

      // 2. Direct backend database registration
      const res = await api.post<{
        data: { user: UserType; token: string };
      }>('/auth/register', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      });

      setAuth(res.data.user, res.data.token);
      handleSuccessfulAuth(res.data.user);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Registration failed. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMessage(null);

      if (!isSupabaseConfigured) {
        setErrorMessage(
          'Supabase Google Sign-Up requires your VITE_SUPABASE_ANON_KEY in client/.env. You can complete registration with email and password below!'
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
      setErrorMessage(err.message || 'Google sign up failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <ThemeProvider theme={vastraTheme}>
      <Box
        sx={{
          minHeight: '80vh',
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
            maxWidth: 480,
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
                Join the Tantuvi Collective
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B655F', fontSize: '0.8rem', mt: 0.5 }}>
                Real-time account setup with verified artisan orders & express checkout
              </Typography>
            </Box>

            {/* Google 1-Click Sign Up */}
            <MuiButton
              variant="outlined"
              fullWidth
              disabled={isGoogleLoading || isLoading}
              onClick={handleGoogleSignUp}
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
              <span>{isGoogleLoading ? 'Connecting Google...' : 'Sign up with Google'}</span>
            </MuiButton>

            <Divider sx={{ my: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#8C857B', px: 1, letterSpacing: '0.05em' }}>
                OR WITH PERSONAL DETAILS
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

            {/* Registration Form */}
            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="First Name"
                    type="text"
                    fullWidth
                    required
                    size="small"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Aarav"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <UserIcon size={16} color="#8C857B" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <TextField
                    label="Last Name"
                    type="text"
                    fullWidth
                    required
                    size="small"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Sharma"
                  />
                </Stack>

                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  required
                  size="small"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav@example.com"
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

                <TextField
                  label="Phone Number (Optional)"
                  type="tel"
                  fullWidth
                  size="small"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone size={16} color="#8C857B" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Box>
                  <TextField
                    label="Create Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    required
                    size="small"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
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

                  {/* Real-time Password Progress Bar */}
                  {password && (
                    <Box sx={{ mt: 1.25 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#8C857B', fontSize: '0.7rem' }}>
                          Password strength
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: strength.color,
                            fontSize: '0.7rem',
                          }}
                        >
                          {strength.label}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={strength.percent}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: '#FAF7F2',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: strength.color,
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                  )}
                  <Typography variant="caption" sx={{ display: 'block', color: '#8C857B', mt: 0.75, fontSize: '0.7rem' }}>
                    Must contain at least 8 characters, an uppercase letter, and a number.
                  </Typography>
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
                      <span>Create Account</span>
                      <ArrowRight size={16} />
                    </Stack>
                  )}
                </MuiButton>
              </Stack>
            </form>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 4, pt: 2.5, borderTop: '1px solid #EAE4D9' }}>
              <Typography variant="body2" sx={{ color: '#6B655F', fontSize: '0.8rem' }}>
                Already a patron?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#8C4A2F',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Sign In Instead
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
};
