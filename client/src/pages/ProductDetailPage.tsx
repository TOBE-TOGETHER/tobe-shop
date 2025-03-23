import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardMedia,
  Container,
  Divider,
  Grid,
  Link,
  Rating,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Chip,
  Paper,
  IconButton,
  alpha,
  useTheme,
  Alert,
  Skeleton,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CompareIcon from '@mui/icons-material/Compare';
import ShareIcon from '@mui/icons-material/Share';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StoreIcon from '@mui/icons-material/Store';
import { apiGet } from '../utils/api';
import { useCart } from '../contexts/CartContext';

// Define interfaces
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  status: string;
  shopId: number;
  createdAt: string;
  updatedAt: string;
  shop?: Shop;
  // Additional properties for UI enhancement (not from API)
  gallery?: string[];
  badges?: string[];
  rating?: number;
  reviews?: number;
  features?: string[];
  benefits?: string[];
  originalPrice?: number;
  discount?: string;
  colors?: string[];
  sizes?: string[];
  specifications?: Array<{name: string, value: string}>;
}

interface Shop {
  id: number;
  name: string;
  description: string;
  logo: string;
  address: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }
}

// TabPanel component
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
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProductDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [tabValue, setTabValue] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('#4285F4');
  const theme = useTheme();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // State for API data
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  // Fetch product data from API
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use apiGet utility instead of fetch for product details
        const data = await apiGet<{product: Product}>(`products/${id}`);
        setProduct(data.product);
        
        // Fetch shop details if we have a shopId
        if (data.product.shopId) {
          try {
            // Use apiGet utility instead of fetch for shop details
            const shopData = await apiGet<{shop: Shop}>(`shops/${data.product.shopId}`);
            setShop(shopData.shop);
          } catch (shopError) {
            console.error('Error fetching shop:', shopError);
            // We don't set the main error state here since the product was loaded successfully
          }
        }
        
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProductDetails();
    }
  }, [id]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle quantity change
  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= (product?.stock || 1)) {
      setQuantity(value);
    }
  };
  
  // Handle quantity buttons
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image,
      stock: product.stock
    });
    
    setAddedToCart(true);
    
    // Reset after a short delay
    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);
  };

  // Render the benefit item
  const renderBenefitItem = (text: string, index: number) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }} key={index}>
      <Box sx={{ 
        minWidth: 24, 
        mr: 2, 
        mt: 0.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Box sx={{ 
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          bgcolor: 'primary.main' 
        }} />
      </Box>
      <Typography variant="body2">{text}</Typography>
    </Box>
  );

  // Render product images
  const renderProductImages = () => {
    if (!product) return null;
    
    // Create a gallery array from the product image or use the existing gallery if available
    const galleryImages = product.gallery || [product.image];
    
    return (
      <Grid item xs={12} md={6}>
        <Grid item xs={12}>
          <Card 
            elevation={0}
            sx={{ 
              background: 'transparent', 
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: 2
            }}
          >
            <CardMedia
              component="img"
              height={400}
              image={galleryImages[selectedImage]}
              alt={product.name}
              sx={{ objectFit: 'cover' }}
            />
          </Card>
        </Grid>

        {galleryImages.length > 1 && (
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} sx={{ mt: 1, overflowX: 'auto', pb: 1 }}>
              {galleryImages.map((image, index) => (
                <Box
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  sx={{ 
                    width: 80, 
                    height: 80,
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedImage === index ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                    opacity: selectedImage === index ? 1 : 0.7,
                    transition: 'all 0.2s',
                    '&:hover': {
                      opacity: 1
                    }
                  }}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 1}`} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }} 
                  /> 
                </Box>
              ))}
            </Stack>
          </Grid>
        )}
      </Grid>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Container>
        <Box sx={{ my: 4 }}>
          <Skeleton variant="text" width="70%" height={60} />
          <Skeleton variant="rectangular" width="100%" height={400} sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="text" width="90%" height={30} />
              <Skeleton variant="text" width="60%" height={30} />
              <Skeleton variant="text" width="80%" height={30} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" width="100%" height={200} />
            </Grid>
          </Grid>
        </Box>
      </Container>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <Container>
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Product not found'}
          </Alert>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('product.notFound')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            {t('product.removedOrNotExist')}
          </Typography>
          <Button variant="contained" component={RouterLink} to="/products">
            {t('product.browseProducts')}
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 8 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link component={RouterLink} to="/" color="inherit">
          {t('nav.home')}
        </Link>
        <Link component={RouterLink} to="/products" color="inherit">
          {t('nav.products')}
        </Link>
        {product && product.shopId && (
          <Link 
            component={RouterLink} 
            to={`/shops/${product.shopId}`} 
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <StoreIcon sx={{ mr: 0.5, fontSize: 16 }} />
            {shop?.name || t('shop.unknown')}
          </Link>
        )}
        <Typography color="text.primary">{product?.name}</Typography>
      </Breadcrumbs>

      <Box>
        {/* Product details */}
        <Grid container spacing={4}>
          {/* Product images */}
          {renderProductImages()}
          
          {/* Product badges */}
          {product.badges && product.badges.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              {product.badges.map((badge, index) => (
                <Chip
                  key={index}
                  label={badge}
                  color={badge === 'NEW' ? 'primary' : 'success'}
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              ))}
            </Stack>
          )}
        </Grid>
        
        {/* Product info */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              {product.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={product.rating} precision={0.5} readOnly />
              <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                ({product.reviews} {t('product.reviews')})
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                ${product.price.toFixed(2)}
              </Typography>
              {product.originalPrice && (
                <Typography variant="body1" color="text.secondary" sx={{ textDecoration: 'line-through', ml: 2 }}>
                  ${product.originalPrice.toFixed(2)}
                </Typography>
              )}
              {product.discount && (
                <Chip 
                  label={product.discount} 
                  size="small" 
                  color="error" 
                  sx={{ ml: 2, fontWeight: 'bold' }}
                />
              )}
            </Box>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {product.description}
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Color picker */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                {t('product.color')}
              </Typography>
              <Stack direction="row" spacing={1}>
                {product.colors?.map((color, index) => (
                  <Box 
                    key={index}
                    onClick={() => setSelectedColor(color)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: color,
                      border: selectedColor === color ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                      outline: selectedColor === color ? `2px solid ${alpha(theme.palette.primary.main, 0.5)}` : 'none',
                      outlineOffset: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </Stack>
            </Box>
            
            {/* Size picker */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {t('product.size')}
                </Typography>
                <Link href="#" underline="hover" color="primary">
                  {t('product.sizeChart')}
                </Link>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {product.sizes?.map((size, index) => (
                  <Button
                    key={index}
                    variant={selectedSize === size ? "contained" : "outlined"}
                    size="small"
                    color={selectedSize === size ? "primary" : "inherit"}
                    onClick={() => setSelectedSize(size)}
                    sx={{ 
                      minWidth: 40, 
                      height: 40,
                      borderRadius: 1
                    }}
                  >
                    {size}
                  </Button>
                ))}
              </Stack>
            </Box>
            
            {/* Quantity selector */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                {t('product.quantity')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  sx={{ 
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    borderRadius: 1,
                  }}
                  size="small"
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <TextField
                  value={quantity}
                  onChange={handleQuantityChange}
                  inputProps={{ 
                    min: 1, 
                    max: product.stock, 
                    style: { 
                      textAlign: 'center',
                      padding: '8px',
                      width: '40px'
                    } 
                  }}
                  variant="outlined"
                  size="small"
                  sx={{ 
                    width: '60px', 
                    mx: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                />
                <IconButton 
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stock}
                  sx={{ 
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    borderRadius: 1,
                  }}
                  size="small"
                >
                  <AddIcon fontSize="small" />
                </IconButton>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  Available: {product.stock}
                </Typography>
              </Box>
            </Box>
            
            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large" 
                startIcon={<AddShoppingCartIcon />}
                sx={{ 
                  py: 1.5,
                  flex: 2,
                  borderRadius: 1,
                  fontWeight: 'bold',
                }}
                disabled={product?.stock <= 0}
                onClick={handleAddToCart}
              >
                {addedToCart ? t('product.addedToCart') : t('product.addToCart')}
              </Button>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                sx={{ 
                  flex: 1,
                  py: 1.5,
                  borderRadius: 1, 
                  bgcolor: theme.palette.grey[100],
                  color: theme.palette.grey[800],
                  '&:hover': {
                    bgcolor: theme.palette.grey[200],
                  }
                }}
              >
                {t('product.buyNow')}
              </Button>
            </Box>
            
            {/* Additional buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Button 
                startIcon={<CompareIcon />} 
                variant="text" 
                color="inherit"
                size="small"
              >
                {t('product.compare')}
              </Button>
              <Button 
                startIcon={<FavoriteIcon />} 
                variant="text" 
                color="inherit"
                size="small"
              >
                {t('product.favorite')}
              </Button>
              <Button 
                startIcon={<ShareIcon />} 
                variant="text" 
                color="inherit"
                size="small"
              >
                {t('product.share')}
              </Button>
            </Box>
            
            {/* Product features */}
            <Box sx={{ 
              mt: 4, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2 
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                p: 2,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }}>
                <VerifiedUserIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    100% original
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chocolate bar candy canes ice cream toffee cookie halvah.
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                p: 2,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }}>
                <AccessTimeIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    10 days replacement
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Marshmallow biscuit donut dragée fruitcake wafer.
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                p: 2,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }}>
                <LocalShippingIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Year warranty
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cotton candy gingerbread cake I love sugar sweet.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Box>
      
      {/* Product details tabs */}
      <Box sx={{ width: '100%', mt: 6 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="product details tabs"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label={t('product.description')} />
            <Tab label={t('product.specifications')} />
            <Tab label={t('product.reviews')} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom fontWeight="bold">Benefits</Typography>
          {product.benefits?.map((benefit, index) => renderBenefitItem(benefit, index))}
          
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }} fontWeight="bold">Features</Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            {product.features?.map((feature, index) => (
              <Typography component="li" variant="body2" key={index} sx={{ mb: 1 }}>
                {feature}
              </Typography>
            ))}
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
            {product.specifications ? (
              product.specifications.map((spec, index) => (
                <Grid container key={index} sx={{ py: 1.5, borderBottom: index < (product.specifications?.length || 0) - 1 ? 1 : 0, borderColor: 'divider' }}>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">{spec.name}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={8}>
                    <Typography variant="body2">{spec.value}</Typography>
                  </Grid>
                </Grid>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('product.noSpecifications')}
              </Typography>
            )}
          </Paper>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="body1">
              {t('product.reviewsWillBeDisplayed')}
            </Typography>
          </Paper>
        </TabPanel>
      </Box>
      
      {/* Delivery information */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Delivery and returns
        </Typography>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="body2" paragraph>
            Your order of $200 or more gets free standard delivery.
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Standard delivered 4-5 Business Days
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Express delivered 2-4 Business Days
            </Typography>
          </Box>
          <Typography variant="body2">
            Orders are processed and delivered Monday-Friday (excluding public holidays)
          </Typography>
        </Paper>
      </Box>

      {addedToCart && (
        <Button
          variant="contained" 
          color="secondary"
          onClick={() => navigate('/cart')}
          sx={{ mt: 1 }}
        >
          {t('product.goToCart')}
        </Button>
      )}
    </Container>
  );
};

export default ProductDetailPage; 