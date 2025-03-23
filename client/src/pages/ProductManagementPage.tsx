import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  FormHelperText,
  InputLabel,
  CircularProgress,
  Alert,
  Snackbar,
  styled,
  Avatar,
  useTheme,
  Chip,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { apiGet, apiPost, apiPut } from '../utils/api';

// Define Product interface based on server model
interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  status?: string;
  shopId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Add the Shop interface
interface Shop {
  id: number;
  name: string;
  description: string;
  logo: string;
  address: string;
  userId: number;
  ownerId?: number;
  ownerUsername?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Categories for the dropdown
const categories = [
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Books',
  'Toys & Games',
  'Beauty',
  'Sports',
  'Automotive',
  'Jewelry',
  'Other',
];

// Product status options
const statusOptions = [
  'available',
  'unavailable',
  'archived'
];

// Mock products for initial testing
const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Gaming Laptop',
    description: 'High-performance gaming laptop with the latest graphics card.',
    price: 1299.99,
    image: 'https://via.placeholder.com/300x200',
    category: 'Electronics',
    stock: 15,
    shopId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Wireless Headphones',
    description: 'Noise-canceling wireless headphones with 20-hour battery life.',
    price: 199.99,
    image: 'https://via.placeholder.com/300x200',
    category: 'Electronics',
    stock: 30,
    shopId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Smart Watch',
    description: 'Fitness tracker and smartwatch with heart rate monitor.',
    price: 249.99,
    image: 'https://via.placeholder.com/300x200',
    category: 'Electronics',
    stock: 25,
    shopId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Styled Card component
const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  maxWidth: '100%',
  borderRadius: '12px',
  overflow: 'hidden',
  height: 'auto',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
  },
}));

// Styled Shop Indicator Card
const StyledShopCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  overflow: 'hidden',
}));

const ProductManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { token, userId, user } = useAuth();
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(false);
  const [shopLoading, setShopLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: '',
    stock: 0,
    status: 'available',
    shopId: shop?.id
  });
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  
  // Show snackbar helper
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };
  
  // Fetch products for selected shop
  const fetchProducts = useCallback(async () => {
    if (!shop) return;
    
    setLoading(true);
    
    try {
      // Use apiGet instead of fetch
      const data = await apiGet<{products: Product[]}>(`products?shopId=${shop.id}`);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : t('common.networkError'));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [shop, t]);
  
  // Fetch user's shops
  const fetchUserShops = useCallback(async () => {
    setShopLoading(true);
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
      
      // Use apiGet instead of fetch
      try {
        const data = await apiGet<{shops: Shop[]}>(`users/${userId}/shops`, token);
        setShop(data.shops[0]);
      } catch (err) {
        console.warn('Failed to fetch user shops, trying fallback:', err);
        
        // Fallback: Try to get all shops and filter by owner
        const fallbackData = await apiGet<{shops: Shop[]}>('shops', token);
        const userShops = (fallbackData.shops || []).filter(shop => 
          shop.ownerId === parseInt(userId, 10) || shop.ownerUsername === user?.username
        );
        
        setShop(userShops[0]);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      setError(error instanceof Error ? error.message : t('common.networkError'));
    } finally {
      setShopLoading(false);
    }
  }, [t, user?.username]);
  
  // Fetch products from API on component mount
  useEffect(() => {
    fetchUserShops();
  }, [fetchUserShops]);
  
  // Refetch products when shop changes
  useEffect(() => {
    if (shop) {
      fetchProducts();
    }
  }, [shop, fetchProducts]);
  
  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      image: '',
      category: '',
      stock: 0,
      status: 'available',
      shopId: shop?.id
    });
    setFormErrors({});
  };
  
  // Handle edit button click
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      ...product,
      price: Number(product.price),
      stock: Number(product.stock),
    });
    setOpenForm(true);
  };
  
  // Handle add button click
  const handleAddClick = () => {
    setSelectedProduct(null);
    resetForm();
    setOpenForm(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setOpenDeleteDialog(true);
  };
  
  // Handle close form
  const handleCloseForm = () => {
    setOpenForm(false);
    setFormErrors({});
  };
  
  // Handle close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === 'price' || name === 'stock' ? Number(value) : value 
    });
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };
  
  // Handle category change
  const handleCategoryChange = (event: SelectChangeEvent) => {
    setFormData({
      ...formData,
      category: event.target.value,
    });
  };

  // Handle form status change
  const handleFormStatusChange = (event: SelectChangeEvent<string>) => {
    setFormData({
      ...formData,
      status: event.target.value
    });
  };

  // Handle status change
  const handleStatusChange = async (product: Product, newStatus: string) => {
    setLoading(true);
    
    try {
      // Get token from localStorage
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        throw new Error(t('auth.tokenNotFound'));
      }
      
      // Use apiPut instead of fetch
      await apiPut<{product: Product}>(`products/${product.id}`, { 
        status: newStatus 
      }, authToken);
      
      // Update local state
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, status: newStatus } : p
      ));
      
      showSnackbar(t('productManagement.statusUpdateSuccess'), 'success');
    } catch (error) {
      console.error('Error updating product status:', error);
      showSnackbar(
        error instanceof Error 
          ? error.message 
          : t('productManagement.statusUpdateError'),
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete product
  const handleDelete = async () => {
    if (!selectedProduct || !selectedProduct.id) return;
    
    try {
      // Get token from localStorage
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        throw new Error(t('auth.tokenNotFound'));
      }
      
      await apiPut(`products/${selectedProduct.id}/delete`, {}, authToken);
      
      // Update local state
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      
      // Show success message
      showSnackbar(t('products.deleteSuccess'), 'success');
    } catch (err) {
      console.error('Error deleting product:', err);
      showSnackbar(
        err instanceof Error ? err.message : t('common.error'),
        'error'
      );
    } finally {
      setOpenDeleteDialog(false);
      setSelectedProduct(null);
    }
  };
  
  // Validate the form
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      errors.name = t('common.required');
    }
    
    if (!formData.description.trim()) {
      errors.description = t('common.required');
    }
    
    if (!formData.price || formData.price <= 0) {
      errors.price = t('common.invalidPrice');
    }
    
    if (!formData.image.trim()) {
      errors.image = t('common.required');
    }
    
    if (!formData.category) {
      errors.category = t('common.required');
    }
    
    if (formData.stock === undefined || formData.stock < 0) {
      errors.stock = t('common.invalidStock');
    }
    
    return errors;
  };
  
  // Handle form submit - update to include the shopId
  const handleSubmit = async () => {
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Make sure we have a shop to add products to
    if (!shop) {
      showSnackbar(t('products.noShopWarning'), 'error');
      return;
    }
    
    try {
      // Get token from localStorage
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        throw new Error(t('auth.tokenNotFound'));
      }
      
      // Include the shopId in the form data
      const productData = {
        ...formData,
        shopId: shop.id,
        status: formData.status || 'available' // Ensure status is always set
      };
      
      console.log('Sending product data:', JSON.stringify(productData));
      
      let response;
      if (selectedProduct?.id) {
        // Update existing product
        response = await apiPut<{product: Product}>(`products/${selectedProduct.id}`, productData, authToken);
        
        // Update existing product in state
        const updatedProduct = response.product || {
          ...productData,
          id: selectedProduct.id
        };
        
        setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
        showSnackbar(t('products.updateSuccess'), 'success');
      } else {
        // Create new product
        response = await apiPost<{product: Product}>('products', productData, authToken);
        
        // Add new product to state
        const newProduct = response.product || {
          ...productData,
          id: Date.now() // Temporary ID as fallback
        };
        
        setProducts([...products, newProduct]);
        showSnackbar(t('products.addSuccess'), 'success');
      }
      
      // Close the form
      setOpenForm(false);
    } catch (err) {
      console.error('Error saving product:', err);
      showSnackbar(
        err instanceof Error ? err.message : t('common.error'),
        'error'
      );
    }
  };
  
  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {t('nav.myProducts')}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />} 
          onClick={handleAddClick}
          size="medium"
        >
          {t('products.add')}
        </Button>
      </Box>
      
      {/* Shop indicator box */}
      <StyledShopCard sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ p: 1.5, width: '100%' }}>
          {shopLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2">{t('common.loading')}</Typography>
            </Box>
          ) : shop ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {shop.logo && (
                <Avatar 
                  src={shop.logo} 
                  alt={shop.name} 
                  sx={{ width: 36, height: 36, mr: 1.5 }}
                />
              )}
              <Box>
                <Typography variant="subtitle2" fontWeight="medium">
                  {t('products.shopIndicator')} <span style={{ color: theme.palette.primary.main }}>{shop.name}</span>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('shops.productCount')}: {products.length}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="body2" color="error">
                {t('products.noShopWarning')}
              </Typography>
              <Button 
                variant="outlined" 
                color="primary"
                component="a" 
                href="/my/shops"
                size="small"
                sx={{ mt: 0.5 }}
              >
                {t('products.createShopFirst')}
              </Button>
            </Box>
          )}
        </Box>
      </StyledShopCard>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress size={30} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : products.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 3, px: 2, mt: 2, borderRadius: '12px' }}>
          <Box sx={{ maxWidth: '400px', mx: 'auto' }}>
            <Box sx={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(0, 255, 178, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5
            }}>
              <AddIcon sx={{ fontSize: 30, color: theme.palette.primary.main }} />
            </Box>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              {t('products.noProducts')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('products.addFirst')}
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleAddClick}
              disabled={!shop}
              size="small"
            >
              {t('products.addNew')}
            </Button>
          </Box>
        </Card>
      ) : (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {products.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
              <StyledCard>
                <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
                  <CardMedia
                    component="img"
                    image={product.image}
                    alt={product.name}
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <Box sx={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <Chip
                      label={t(`products.statusOptions.${product.status || 'available'}`)}
                      size="small"
                      color={
                        product.status === 'available'
                          ? 'success'
                          : product.status === 'unavailable'
                          ? 'warning'
                          : 'default'
                      }
                    />
                  </Box>
                </Box>
                <CardContent sx={{ p: 1.5, pb: 0.5, flexGrow: 1, minHeight: '70px' }}>
                  <Typography gutterBottom variant="subtitle2" component="div" noWrap fontWeight="medium">
                    {product.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    mb: 0.5
                  }}>
                    {product.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" color="primary" fontWeight="bold">
                      ${product.price.toFixed(2)}
                    </Typography>
                    <Typography variant="caption">
                      {t('products.stock')}: {product.stock}
                    </Typography>
                  </Box>
                </CardContent>
                <Box sx={{ height: '8px' }} />
                <CardActions sx={{ p: 0.5, mt: 'auto', borderTop: `1px solid ${theme.palette.divider}` }}>
                  <IconButton 
                    size="small"
                    color="primary" 
                    onClick={() => handleEdit(product)} 
                    aria-label={t('common.edit')}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small"
                    color="error" 
                    onClick={() => handleDeleteClick(product)} 
                    aria-label={t('common.delete')}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Product Form Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedProduct ? t('products.edit') : t('products.add')}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="name"
            label={t('products.name')}
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="description"
            name="description"
            label={t('products.description')}
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.description}
            onChange={handleInputChange}
            error={!!formErrors.description}
            helperText={formErrors.description}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="price"
            name="price"
            label={t('products.price')}
            type="number"
            fullWidth
            variant="outlined"
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            value={formData.price}
            onChange={handleInputChange}
            error={!!formErrors.price}
            helperText={formErrors.price}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="image"
            name="image"
            label={t('products.imageUrl')}
            type="text"
            fullWidth
            variant="outlined"
            value={formData.image}
            onChange={handleInputChange}
            error={!!formErrors.image}
            helperText={formErrors.image}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }} error={!!formErrors.category}>
            <InputLabel id="category-label">{t('products.category')}</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              name="category"
              value={formData.category}
              label={t('products.category')}
              onChange={handleCategoryChange}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
            {formErrors.category && <FormHelperText>{formErrors.category}</FormHelperText>}
          </FormControl>
          <TextField
            margin="dense"
            id="stock"
            name="stock"
            label={t('products.stock')}
            type="number"
            fullWidth
            variant="outlined"
            value={formData.stock}
            onChange={handleInputChange}
            error={!!formErrors.stock}
            helperText={formErrors.stock}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="normal" error={!!formErrors.status}>
            <InputLabel id="status-label">{t('products.status')}</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              name="status"
              value={formData.status || 'available'}
              onChange={handleFormStatusChange}
              label={t('products.status')}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {t(`products.statusOptions.${option}`)}
                </MenuItem>
              ))}
            </Select>
            {formErrors.status && <FormHelperText>{formErrors.status}</FormHelperText>}
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'flex-end' }}>
          <Button onClick={handleCloseForm}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedProduct ? t('common.update') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {t('products.deleteConfirmation')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t('products.deleteWarning')} {selectedProduct?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'flex-end' }}>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductManagementPage; 