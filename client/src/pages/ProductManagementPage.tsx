import React, { useState, useEffect } from 'react';
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
  const { token, userId } = useAuth();
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shopLoading, setShopLoading] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  
  // Dialog states
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
    shopId: userId !== null ? userId : undefined
  });
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  
  // Fetch products from API on component mount
  useEffect(() => {
    fetchShop();
  }, []);
  
  // Refetch products when shop changes
  useEffect(() => {
    if (shop) {
      fetchProducts();
    }
  }, [shop]);
  
  // Function to fetch the user's shop from the backend
  const fetchShop = async () => {
    if (!token || !userId) return;
    
    setShopLoading(true);
    try {
      // First try to fetch from user-specific shop endpoint
      const response = await fetch(`http://localhost:8080/api/users/${userId}/shops`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        // If 404, try the general shops endpoint
        if (response.status === 404) {
          const fallbackResponse = await fetch(`http://localhost:8080/api/shops`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!fallbackResponse.ok) {
            throw new Error(`Failed to fetch shop data: ${fallbackResponse.status}`);
          }
          
          const data = await fallbackResponse.json();
          
          // Find the shop for the current user
          let userShop = null;
          if (data.shops && Array.isArray(data.shops)) {
            userShop = data.shops.find((s: any) => s.userId === userId);
          } else if (Array.isArray(data)) {
            userShop = data.find((s: any) => s.userId === userId);
          }
          
          setShop(userShop);
          return;
        }
        
        throw new Error(`Failed to fetch shop data: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process different response formats
      let userShop = null;
      if (data.shops && Array.isArray(data.shops)) {
        userShop = data.shops.find((s: any) => s.userId === userId);
      } else if (Array.isArray(data)) {
        userShop = data.find((s: any) => s.userId === userId);
      } else if (data.shop) {
        userShop = data.shop;
      }
      
      setShop(userShop);
    } catch (err) {
      console.error('Error fetching shop:', err);
    } finally {
      setShopLoading(false);
    }
  };
  
  // Function to fetch products from the backend
  const fetchProducts = async () => {
    if (!token || !shop) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch products for the current shop
      const response = await fetch(`http://localhost:8080/api/products?shopId=${shop.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
      console.log('Fetched products:', data.products);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
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

  // Handle status change
  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setFormData({
      ...formData,
      status: event.target.value
    });
  };
  
  // Handle delete product
  const handleDelete = async () => {
    if (!selectedProduct || !selectedProduct.id) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      // Update local state
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      
      // Show success message
      setSnackbar({
        open: true,
        message: t('products.deleteSuccess'),
        severity: 'success',
      });
    } catch (err) {
      console.error('Error deleting product:', err);
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : t('common.error'),
        severity: 'error',
      });
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
      setSnackbar({
        open: true,
        message: t('products.noShopError'),
        severity: 'error',
      });
      return;
    }
    
    try {
      const url = selectedProduct?.id 
        ? `http://localhost:8080/api/products/${selectedProduct.id}` 
        : 'http://localhost:8080/api/products';
        
      const method = selectedProduct?.id ? 'PUT' : 'POST';
      
      // Include the shopId in the form data
      const productData = {
        ...formData,
        shopId: shop.id,
        status: formData.status || 'available' // Ensure status is always set
      };
      
      console.log('Sending product data:', JSON.stringify(productData));
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to save product';
        
        try {
          // Try to parse as JSON if possible
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If not JSON, use the text as is
          if (errorText) errorMessage = errorText;
        }
        
        // Special handling for specific status codes
        if (response.status === 403) {
          throw new Error('You can only update products from your own shop. Please refresh and try again.');
        } else if (response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        } else {
          throw new Error(errorMessage);
        }
      }
      
      // Parse response data
      let data;
      try {
        const responseText = await response.text();
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.warn('Could not parse response as JSON:', e);
        data = { product: productData }; // Fallback to using the sent data
      }
      
      if (selectedProduct?.id) {
        // Ensure we have a product object to work with
        const updatedProduct = data.product || {
          ...productData,
          id: selectedProduct.id
        };
        
        // Update existing product in state
        setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
        setSnackbar({
          open: true,
          message: t('products.updateSuccess'),
          severity: 'success',
        });
      } else {
        // Ensure we have a product object with an ID
        const newProduct = data.product || {
          ...productData,
          id: Date.now() // Temporary ID as fallback
        };
        
        // Add new product to state
        setProducts([...products, newProduct]);
        setSnackbar({
          open: true,
          message: t('products.addSuccess'),
          severity: 'success',
        });
      }
      
      // Close the form
      setOpenForm(false);
    } catch (err) {
      console.error('Error saving product:', err);
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : t('common.error'),
        severity: 'error',
      });
    }
  };
  
  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      image: '',
      category: '',
      stock: 0,
      status: 'available',
      shopId: userId !== null ? userId : undefined
    });
    setFormErrors({});
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
              onChange={handleStatusChange}
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