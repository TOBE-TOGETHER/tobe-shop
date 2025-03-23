import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Collapse,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useTranslation } from 'react-i18next';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  address: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  phone?: string;
  address?: string;
  submit?: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'buyer',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors for the field being edited
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setFormData((prev) => ({ ...prev, role: event.target.value }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = t('common.required');
    } else if (formData.username.length < 3) {
      newErrors.username = t('auth.usernameLength');
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = t('common.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('common.invalidEmail');
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = t('common.required');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.passwordLength');
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('common.passwordMismatch');
    }
    
    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('common.required');
    }
    
    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('common.required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({}); // Clear previous errors
    
    try {
      // Prepare the data for the API
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        role: formData.role,
        phone: formData.phone ? formData.phone.trim() : "",
        address: formData.address ? formData.address.trim() : "",
      };
      
      console.log('Sending registration data:', userData);
      
      // Make the API call
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Log the detailed error for debugging
        console.error('Registration failed:', data);
        
        // Handle specific error messages
        if (data.error) {
          if (data.error.includes('Username already exists')) {
            setErrors({ ...errors, username: t('auth.usernameTaken') });
          } else if (data.error.includes('Email already exists')) {
            setErrors({ ...errors, email: t('auth.emailTaken') });
          } else if (data.error.includes('Missing required fields')) {
            setErrors({ ...errors, submit: data.error });
          } else {
            setErrors({ ...errors, submit: data.error });
          }
        } else {
          throw new Error(t('auth.registrationFailed'));
        }
        return;
      }
      
      console.log('Registration successful:', data);
      
      // Registration successful - redirect to login
      navigate('/login', { state: { message: t('auth.registerSuccess') } });
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        ...errors,
        submit: error instanceof Error ? error.message : t('common.unknownError'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOptionalFields = () => {
    setShowOptionalFields(!showOptionalFields);
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            {t('auth.register')}
          </Typography>
          
          {errors.submit && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {errors.submit}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="username"
                  label={t('auth.username')}
                  name="username"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={!!errors.username}
                  helperText={errors.username}
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="firstName"
                  label={t('auth.firstName')}
                  name="firstName"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label={t('auth.lastName')}
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label={t('auth.email')}
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label={t('auth.password')}
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label={t('auth.confirmPassword')}
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  onClick={toggleOptionalFields}
                  endIcon={showOptionalFields ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  sx={{ mb: 1 }}
                >
                  {t('common.additionalInfo')}
                </Button>
                <Collapse in={showOptionalFields}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="role-label">{t('auth.accountType')}</InputLabel>
                        <Select
                          labelId="role-label"
                          id="role"
                          name="role"
                          value={formData.role}
                          label={t('auth.accountType')}
                          onChange={handleRoleChange}
                        >
                          <MenuItem value="buyer">{t('auth.buyer')}</MenuItem>
                          <MenuItem value="seller">{t('auth.seller')}</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="phone"
                        label={t('auth.phone')}
                        name="phone"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="address"
                        label={t('auth.address')}
                        name="address"
                        autoComplete="street-address"
                        value={formData.address}
                        onChange={handleChange}
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </Collapse>
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : t('auth.register')}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/login" variant="body2">
                  {t('auth.haveAccount')} {t('auth.signIn')}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage; 