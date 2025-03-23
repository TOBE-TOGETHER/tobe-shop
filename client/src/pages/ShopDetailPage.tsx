import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  Paper,
  Breadcrumbs,
  Link,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import SearchIcon from '@mui/icons-material/Search';
import StorefrontIcon from '@mui/icons-material/Storefront';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useTranslation } from 'react-i18next';
import ProductCard, { Product } from '../components/products/ProductCard';
import { apiGet } from '../utils/api';

// Define interfaces
interface Shop {
  id: number;
  name: string;
  description: string;
  logo: string;
  address: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
  owner?: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

const categories = [
  'All Categories',
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

const ShopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  
  // Fetch shop data
  useEffect(() => {
    const fetchShopDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use apiGet utility instead of fetch for shop data
        const shopData = await apiGet<{shop: Shop}>(`shops/${id}`);
        setShop(shopData.shop);
        
        // Fetch products for this shop
        try {
          const productsData = await apiGet<{products: Product[]}>(`products?shopId=${id}&status=available`);
          setProducts(productsData.products || []);
        } catch (productsError) {
          console.error('Error fetching shop products:', productsError);
          // We don't set the main error since the shop was loaded successfully
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching shop:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchShopDetails();
    }
  }, [id]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle category filter change
  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };
  
  // Filter products based on search query and selected category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link component={RouterLink} to="/" color="inherit">
          {t('nav.home')}
        </Link>
        <Link component={RouterLink} to="/shops" color="inherit">
          {t('shops.allShops')}
        </Link>
        <Typography color="text.primary">
          {loading ? <Skeleton width={100} /> : shop?.name}
        </Typography>
      </Breadcrumbs>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : shop ? (
        <>
          {/* Shop Details Card */}
          <Paper 
            elevation={0}
            sx={{ 
              mb: 4, 
              borderRadius: 3,
              overflow: 'hidden',
              backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.6))',
              position: 'relative',
            }}
          >
            {/* Background image */}
            <Box sx={{ 
              position: 'absolute', 
              width: '100%', 
              height: '100%', 
              top: 0, 
              left: 0, 
              backgroundImage: `url(${shop.logo})`,
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              opacity: 0.2,
              zIndex: 0 
            }} />
            
            {/* Content */}
            <Box sx={{ 
              position: 'relative', 
              zIndex: 1, 
              display: 'flex',
              p: { xs: 2, md: 4 }
            }}>
              <Avatar 
                src={shop.logo} 
                alt={shop.name}
                sx={{ 
                  width: { xs: 80, md: 120 }, 
                  height: { xs: 80, md: 120 },
                  border: '4px solid',
                  borderColor: 'primary.main'
                }}
              />
              
              <Box sx={{ ml: 3, flex: 1 }}>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                  {shop.name}
                </Typography>
                
                <Typography variant="body1" paragraph sx={{ maxWidth: 700 }}>
                  {shop.description}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                  <Chip 
                    icon={<StorefrontIcon />} 
                    label={`${products.length} ${t('shops.products')}`}
                    color="primary" 
                    variant="outlined"
                  />
                  
                  {shop.address && (
                    <Chip 
                      label={shop.address} 
                      variant="outlined" 
                    />
                  )}
                  
                  {shop.owner && (
                    <Chip 
                      avatar={<Avatar src={shop.owner.avatar} alt={shop.owner.username} />}
                      label={`${t('shops.owner')}: ${shop.owner.username}`}
                      variant="outlined" 
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>
          
          {/* Filters row */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={handleSearchChange}
              size="small"
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="category-select-label">{t('products.category')}</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={selectedCategory}
                label={t('products.category')}
                onChange={handleCategoryChange}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category === 'All Categories' ? t('shops.allCategories') : category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          {/* Products Grid */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
            {t('shops.shopProducts')}
          </Typography>
          
          {filteredProducts.length === 0 ? (
            <Paper sx={{ textAlign: 'center', py: 6, px: 2 }}>
              <StorefrontIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {t('products.noProducts')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {searchQuery || selectedCategory !== 'All Categories'
                  ? t('shops.noMatchingProducts')
                  : t('shops.noProductsYet')}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredProducts.map((product) => (
                <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      ) : (
        <Alert severity="info">
          {t('shops.notFound')}
        </Alert>
      )}
    </Container>
  );
};

export default ShopDetailPage;
