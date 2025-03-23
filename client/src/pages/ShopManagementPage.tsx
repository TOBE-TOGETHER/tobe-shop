import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  CardActions,
  Paper,
  styled
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import EditIcon from '@mui/icons-material/Edit';
import StoreIcon from '@mui/icons-material/Store';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import AddIcon from '@mui/icons-material/Add';

// Interface for Shop
interface Shop {
  id: number;
  name: string;
  description: string;
  logo: string;
  address: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.2)',
  },
}));

// Shop Details component
interface ShopDetailsProps {
  shop: Shop;
  onEdit: () => void;
}

const ShopDetails: React.FC<ShopDetailsProps> = ({ shop, onEdit }) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <StyledCard>
          <CardMedia
            component="img"
            height="200"
            image={shop.logo || 'https://via.placeholder.com/400x200?text=Shop+Logo'}
            alt={shop.name}
          />
          <CardContent>
            <Typography variant="h5" component="div" gutterBottom>
              {shop.name}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BusinessIcon sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {shop.address || t('shops.addressRequired')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
              <DescriptionIcon sx={{ mr: 1, mt: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                {shop.description || t('shops.descriptionRequired')}
              </Typography>
            </Box>
          </CardContent>
          <Box sx={{ flexGrow: 1 }} />
          <CardActions>
            <Button
              startIcon={<EditIcon />}
              variant="contained"
              onClick={onEdit}
              fullWidth
            >
              {t('shops.editDetails')}
            </Button>
          </CardActions>
        </StyledCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            {t('shops.shopDetails')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              {t('shops.shopIdLabel')} {shop.id}
            </Typography>
            <Typography variant="body1">
              {t('shops.createdAtLabel')} {new Date(shop.createdAt).toLocaleDateString()}
            </Typography>
            <Typography variant="body1">
              {t('shops.updatedAtLabel')} {new Date(shop.updatedAt).toLocaleDateString()}
            </Typography>
            <Typography variant="body1">
              {t('shops.statusLabel')} <span style={{ color: '#4caf50' }}>{t('shops.activeStatus')}</span>
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {t('shops.createYourShopDesc')}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<StoreIcon />}
              component="a"
              href="/my/products"
              sx={{ mt: 1 }}
            >
              {t('shops.viewAllProducts')}
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

const ShopManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, token, userId, refreshUserData, isInitialized } = useAuth();

  // State for shop data
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State to track if initial data load has been attempted
  const [initialLoadAttempted, setInitialLoadAttempted] = useState<boolean>(false);

  // State for form handling
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: false,
  });

  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Fetch user's shop data
  const fetchShopData = React.useCallback(async () => {
    if (!isInitialized) {
      console.log('Auth not initialized yet, deferring shop data fetch');
      return;
    }
    
    if (!userId || !token) {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        console.log('Cannot fetch shop data: no token available');
        setLoading(false);
        setInitialLoadAttempted(true);
        return;
      }
      
      // Try to extract userId from token
      const parts = storedToken.split('_');
      if (parts.length < 1) {
        console.log('Cannot fetch shop data: invalid token format');
        setLoading(false);
        setInitialLoadAttempted(true);
        return;
      }
      
      const tokenUserId = parseInt(parts[0], 10);
      if (!tokenUserId) {
        console.log('Cannot fetch shop data: invalid userId in token');
        setLoading(false);
        setInitialLoadAttempted(true);
        return;
      }
      
      console.log('Fetching shop data with stored token for userId:', tokenUserId);
      
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/users/${tokenUserId}/shops`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        
        if (!response.ok) {
          // Handle 404 case with fallback
          if (response.status === 404) {
            const fallbackResponse = await fetch(`http://localhost:8080/api/shops`, {
              headers: {
                'Authorization': `Bearer ${storedToken}`
              }
            });
            
            if (!fallbackResponse.ok) {
              throw new Error(`Failed to fetch shop data: ${fallbackResponse.status}`);
            }
            
            const data = await fallbackResponse.json();
            processShopData(data, tokenUserId);
            return;
          }
          
          throw new Error(`Failed to fetch shop data: ${response.status}`);
        }
        
        const data = await response.json();
        processShopData(data, tokenUserId);
      } catch (err) {
        console.error('Error fetching shop data:', err);
        setError('Failed to load shop data');
        setShop(null);
      } finally {
        setLoading(false);
        setInitialLoadAttempted(true);
      }
      return;
    }

    // Normal flow with auth context values
    console.log('Fetching shop data with token from context for userId:', userId);
    setLoading(true);
    try {
      // Try fetching user's shops from the API
      const response = await fetch(`http://localhost:8080/api/users/${userId}/shops`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // If the specific endpoint doesn't exist, fall back to the general shops endpoint
        if (response.status === 404) {
          console.log('User-specific shops endpoint not found, falling back to general endpoint');
          const fallbackResponse = await fetch(`http://localhost:8080/api/shops`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!fallbackResponse.ok) {
            const errorText = await fallbackResponse.text();
            console.error('Shop fetch error:', fallbackResponse.status, errorText);
            throw new Error(`Failed to fetch shop data: ${fallbackResponse.status} ${errorText}`);
          }

          const data = await fallbackResponse.json();
          console.log('General shops data response:', data);

          processShopData(data, userId);
          return;
        }

        // Handle 403 forbidden (user not authorized) as "no shop" rather than an error
        if (response.status === 403) {
          console.log('User not authorized to view this shop. Treating as no shop available.');
          setShop(null);
          setLoading(false);
          return;
        }

        const errorText = await response.text();
        console.error('Shop fetch error:', response.status, errorText);
        throw new Error(`Failed to fetch shop data: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('User shops data response:', data);

      processShopData(data, userId);
    } catch (err) {
      console.error('Error fetching shop data:', err);
      setError('Failed to load shop data');
      setShop(null);
    } finally {
      setLoading(false);
      setInitialLoadAttempted(true);
    }
  }, [token, userId, isInitialized]);

  // Process shop data from different response formats
  const processShopData = (data: any, currentUserId: number | null) => {
    if (!currentUserId) {
      setShop(null);
      return;
    }

    let userShop = null;

    // Handle different response formats
    if (data.shops && Array.isArray(data.shops)) {
      // Response format: {shops: [...]}
      userShop = data.shops.find((s: any) =>
        s.userId === currentUserId || s.userId === Number(currentUserId)
      );
      console.log('User shop found from shops array:', userShop, 'for userId:', currentUserId);
    } else if (Array.isArray(data)) {
      // Response format: direct array of shops
      userShop = data.find((s: any) =>
        s.userId === currentUserId || s.userId === Number(currentUserId)
      );
      console.log('User shop found from direct array:', userShop, 'for userId:', currentUserId);
    } else if (data.shop) {
      // Response format: {shop: {...}}
      userShop = data.shop;
      console.log('User shop found from shop object:', userShop);
    } else if (data.message) {
      // Placeholder implementation
      console.log('No shops data available: ', data.message);
    } else {
      console.log('Unknown response format or no shops available');
    }

    setShop(userShop);
    setError(null);
  };

  // Refresh user data if we have a token but no user
  useEffect(() => {
    if (isInitialized && !user && localStorage.getItem('token')) {
      console.log('Auth initialized but no user - attempting to refresh user data');
      refreshUserData().catch(err => {
        console.error('Failed to refresh user data:', err);
      });
    }
  }, [isInitialized, user, refreshUserData]);

  // Update the useEffect that handles data fetching on component mount
  // Modify the useEffect to better handle initialization and avoid unnecessary fetches
  useEffect(() => {
    if (loading) return;
    
    if (isInitialized) {
      if (!initialLoadAttempted) {
        console.log('Auth initialized, attempting to fetch shop data');
        fetchShopData();
      }
    }
  }, [fetchShopData, isInitialized, initialLoadAttempted, loading]);

  // Handle form open
  const handleOpenForm = () => {
    if (shop) {
      // Edit mode - populate form with existing data
      setFormData({
        name: shop.name || '',
        description: shop.description || '',
        logo: shop.logo || '',
        address: shop.address || ''
      });
    } else {
      // Create mode - reset form
      setFormData({
        name: '',
        description: '',
        logo: '',
        address: ''
      });
    }
    setOpenForm(true);
  };

  // Handle form close
  const handleCloseForm = () => {
    setOpenForm(false);
    setFormErrors({ name: false });
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error for this field if any
    if (name === 'name' && formErrors.name) {
      setFormErrors({
        ...formErrors,
        name: false
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors = {
      name: !formData.name.trim(),
    };

    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!validateForm() || !token || !userId) {
      return;
    }

    setLoading(true);
    console.log('Submitting shop form with token:', token, 'userId:', userId);

    try {
      if (shop) {
        // Update existing shop
        console.log('Updating shop:', shop.id, formData);
        const response = await fetch(`http://localhost:8080/api/shops/${shop.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        const responseText = await response.text();
        console.log('Update shop response:', response.status, responseText);

        if (!response.ok) {
          throw new Error(`Failed to update shop: ${response.status} ${responseText}`);
        }

        setSnackbar({
          open: true,
          message: t('shops.updateSuccess'),
          severity: 'success'
        });
      } else {
        // Create new shop
        console.log('Creating new shop:', formData);

        // For debugging - log request details
        console.log('Request headers:', {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });
        console.log('Request body:', JSON.stringify(formData));

        try {
          const response = await fetch('http://localhost:8080/api/shops', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
          });

          let responseText;
          try {
            responseText = await response.text();
          } catch (e) {
            responseText = 'Could not get response text';
          }

          console.log('Create shop response:', response.status, responseText);

          if (!response.ok) {
            // For 404 errors, display a more specific message but continue
            if (response.status === 404) {
              console.warn('Shop creation API is not available - using local fallback');

              // Create a temporary local shop object
              const tempShop: Shop = {
                id: Date.now(), // Temporary ID
                name: formData.name,
                description: formData.description,
                logo: formData.logo,
                address: formData.address,
                userId: userId || 0, // Use token-extracted userId
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };

              // Set the shop locally
              setShop(tempShop);

              // Show success message
              setSnackbar({
                open: true,
                message: t('shops.createSuccess') + ' (Local Only)',
                severity: 'warning'
              });

              // No need to refresh data
              handleCloseForm();
              return;
            }

            throw new Error(`Failed to create shop: ${response.status} ${responseText}`);
          }

          setSnackbar({
            open: true,
            message: t('shops.createSuccess'),
            severity: 'success'
          });

          // Refresh user data to update role
          await refreshUserData();
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          throw fetchError;
        }
      }

      // Fetch updated shop data
      await fetchShopData();
      handleCloseForm();
    } catch (err) {
      console.error('Error saving shop:', err);
      setSnackbar({
        open: true,
        message: shop ? t('shops.shopUpdateError') : t('shops.shopCreationError'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('shops.management')}
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              {t('shops.loadingShopData')}
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {t('shops.errorLoading')}
          </Alert>
        ) : !user && isInitialized ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t('shops.loginRequiredDesc')}
          </Alert>
        ) : (
          <>
            {shop ? (
              // Display shop details if exists
              <ShopDetails
                shop={shop}
                onEdit={handleOpenForm}
              />
            ) : initialLoadAttempted ? (
              // Display create shop call-to-action only after we've attempted to load data
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  textAlign: 'center'
                }}
              >
                <StoreOutlinedIcon sx={{ fontSize: 100, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  {t('shops.noShopFound')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {t('shops.createYourShopDesc')}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenForm}
                  size="large"
                >
                  {t('shops.createShop')}
                </Button>
              </Box>
            ) : (
              // Loading placeholder if we haven't attempted to load data yet
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Create/Edit Shop Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {shop ? t('shops.editShop') : t('shops.createShop')}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {shop ? t('shops.updateShopInfo') : t('shops.createYourShopDesc')}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label={t('shops.name')}
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={formErrors.name}
              helperText={formErrors.name ? t('shops.nameRequired') : t('shops.nameHelper')}
              disabled={loading}
              autoFocus
            />
            <TextField
              margin="normal"
              fullWidth
              id="description"
              label={t('shops.description')}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              disabled={loading}
              helperText={t('shops.descriptionHelper')}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
              <ImageIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {t('shops.logoHelper')}
              </Typography>
            </Box>
            <TextField
              margin="normal"
              fullWidth
              id="logo"
              label={t('shops.logo')}
              name="logo"
              value={formData.logo}
              onChange={handleInputChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              fullWidth
              id="address"
              label={t('shops.address')}
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              disabled={loading}
              helperText={t('shops.addressHelper')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? t('common.loading') : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ShopManagementPage; 