import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Snackbar,
  Alert,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTranslation } from 'react-i18next';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../contexts/AuthContext';
import { apiPut } from '../utils/api';

// Importing the User interface from useUser.ts
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  shopId?: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProfilePage: React.FC = () => {
  const { isAuthenticated, isSeller } = useAuth();
  const { user, refresh, updateUser } = useUser();
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Load fresh user data only once when component mounts
  useEffect(() => {
    refresh().catch(err => {
      console.error('Failed to refresh user data:', err);
      setErrorMessage(t('profile.loadError'));
    });
  }, [refresh, t]);
  
  // Form state
  const [formData, setFormData] = useState({
    username: user?.username || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  
  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditing) {
      // Discard changes
      if (user) {
        setFormData({
          username: user.username || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
        });
      }
    }
    setIsEditing(!isEditing);
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error(t('auth.tokenNotFound'));
      }
      
      // Extract user ID from token (format: "<userId>_<username>_<timestamp>")
      const parts = token.split('_');
      if (parts.length < 1) {
        throw new Error(t('auth.invalidToken'));
      }
      
      const userId = parts[0];
      
      // Use apiPut instead of fetch
      const data = await apiPut<{user: User}>(`users/${userId}`, formData, token);
      
      // Update user data in context using the useUser hook
      updateUser(data.user);
      setSuccessMessage(t('profile.updateSuccess'));
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      setErrorMessage(error instanceof Error ? error.message : t('common.unknownError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle message close
  const handleMessageClose = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  // Handle avatar upload click
  const handleAvatarUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle avatar file change
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (file.size > maxSize) {
      setErrorMessage(t('profile.avatarSizeError'));
      return;
    }
    
    setIsAvatarLoading(true);
    setErrorMessage(null);
    
    try {
      // Convert file to data URL
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        if (!event.target || !event.target.result) {
          setErrorMessage(t('profile.fileReadError'));
          setIsAvatarLoading(false);
          return;
        }
        
        const dataUrl = event.target.result as string;
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error(t('auth.tokenNotFound'));
        }
        
        // Extract user ID from token (format: "<userId>_<username>_<timestamp>")
        const parts = token.split('_');
        if (parts.length < 1) {
          throw new Error(t('auth.invalidToken'));
        }
        
        const userId = parts[0];
        
        // Use apiPut instead of fetch
        const data = await apiPut<{user: User}>(`users/${userId}/avatar`, { avatar: dataUrl }, token);
        
        // Update user data in context
        updateUser(data.user);
        setSuccessMessage(t('profile.avatarUpdated'));
      };
      
      reader.onerror = () => {
        setErrorMessage(t('profile.fileReadError'));
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Avatar upload error:', error);
      setErrorMessage(error instanceof Error ? error.message : t('common.unknownError'));
    } finally {
      setIsAvatarLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Success and Error Messages */}
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={handleMessageClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleMessageClose} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!errorMessage} 
        autoHideDuration={6000} 
        onClose={handleMessageClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleMessageClose} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
      
      <Box>
        {/* Profile Header */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          alignItems: { xs: 'center', sm: 'flex-start' }, 
          gap: 2,
          mb: 3
        }}>
          {/* Avatar Section */}
          <Box sx={{ position: 'relative' }}>
            {user?.avatar ? (
              <Avatar 
                src={user.avatar} 
                alt={user.username} 
                sx={{ width: 100, height: 100 }}
              />
            ) : (
              <Avatar 
                sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: '2.5rem' }}
              >
                {getUserInitials()}
              </Avatar>
            )}
            <IconButton 
              sx={{ 
                position: 'absolute', 
                bottom: 0, 
                right: 0, 
                bgcolor: 'background.paper',
                boxShadow: 1,
                width: 36,
                height: 36
              }}
              onClick={handleAvatarUploadClick}
              disabled={isAvatarLoading}
            >
              {isAvatarLoading ? (
                <CircularProgress size={20} />
              ) : (
                <AddPhotoAlternateIcon fontSize="small" />
              )}
            </IconButton>
            <input
              type="file"
              hidden
              ref={fileInputRef}
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </Box>
          
          {/* User Info */}
          <Box sx={{ 
            flexGrow: 1, 
            textAlign: { xs: 'center', sm: 'left' },
            mt: { xs: 1, sm: 0 }
          }}>
            <Typography variant="h5">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              @{user?.username}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {user?.email}
            </Typography>
            {isSeller && (
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 1, 
                  display: 'inline-block',
                  bgcolor: 'primary.light', 
                  color: 'primary.contrastText',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1
                }}
              >
                {t('auth.seller')}
              </Typography>
            )}
          </Box>
        </Box>
        
        {/* Tabs Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="profile tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<AccountCircleIcon />} label={t('profile.personalInfo')} />
            {isSeller && <Tab icon={<ShoppingBagIcon />} label={t('seller.dashboard')} />}
          </Tabs>
        </Box>
        
        {/* Profile Information Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: { xs: 0, sm: 2 } }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2 
            }}>
              <Typography variant="h6">
                {t('profile.personalInfo')}
              </Typography>
              <IconButton onClick={handleEditToggle}>
                {isEditing ? <CancelIcon /> : <EditIcon />}
              </IconButton>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('auth.username')}
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing || isLoading}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('auth.email')}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing || isLoading}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('auth.firstName')}
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing || isLoading}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('auth.lastName')}
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing || isLoading}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('auth.phone')}
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing || isLoading}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('auth.address')}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing || isLoading}
                    multiline
                    rows={2}
                    size="small"
                  />
                </Grid>
                
                {isEditing && (
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{ mt: 1 }}
                      startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={isLoading}
                    >
                      {t('profile.saveChanges')}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Box>
        </TabPanel>
        
        {/* Seller Dashboard Tab */}
        {isSeller && (
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: { xs: 0, sm: 2 } }}>
              <Typography variant="h6">
                {t('seller.dashboard')}
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="outlined" fullWidth>
                  {t('seller.products')}
                </Button>
                <Button variant="outlined" fullWidth>
                  {t('seller.orders')}
                </Button>
                <Button variant="outlined" fullWidth>
                  {t('seller.stats')}
                </Button>
              </Box>
            </Box>
          </TabPanel>
        )}
      </Box>
    </Container>
  );
};

export default ProfilePage; 