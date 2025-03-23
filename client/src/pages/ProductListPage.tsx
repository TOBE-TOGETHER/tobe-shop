import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  FormControl,
  Grid, 
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  CircularProgress,
  Alert 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import ProductCard, { Product } from '../components/products/ProductCard';
import { apiGet } from '../utils/api';

// Define pagination response interface
interface PaginationData {
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

// Categories for the dropdown (should match the ones in ProductManagementPage)
const categories = [
  'All',
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

const ProductListPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    totalProducts: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 16
  });

  // Translation keys for categories
  const categoryTranslationKeys: {[key: string]: string} = {
    'All': 'product.categories.all',
    'Electronics': 'product.categories.electronics',
    'Clothing': 'product.categories.clothing',
    'Home & Kitchen': 'product.categories.homeAndKitchen',
    'Books': 'product.categories.books',
    'Toys & Games': 'product.categories.toysAndGames',
    'Beauty': 'product.categories.beauty',
    'Sports': 'product.categories.sports',
    'Automotive': 'product.categories.automotive',
    'Jewelry': 'product.categories.jewelry',
    'Other': 'product.categories.other'
  };

  // Fetch products when page, search, category, or sort changes
  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, sortBy, searchTerm]);

  // Function to fetch products from the backend with pagination and filters
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build the query parameters for filtering and pagination
      const queryParams = new URLSearchParams();
      queryParams.append('status', 'available');
      queryParams.append('page', page.toString());
      queryParams.append('limit', '16');
      
      // Add category filter if not 'All'
      if (selectedCategory !== 'All') {
        queryParams.append('category', selectedCategory);
      }
      
      // Add search term if provided
      if (searchTerm.trim()) {
        queryParams.append('search', searchTerm);
      }
      
      // Add sort parameter
      queryParams.append('sort', sortBy);
      
      // Use apiGet utility instead of fetch
      const data = await apiGet<{products: Product[], pagination?: any}>(`products?${queryParams.toString()}`);
      setProducts(data.products || []);
      
      // Update pagination data
      if (data.pagination) {
        setPagination(data.pagination);
      }
      
      console.log('Fetched products:', data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
    setPage(1);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSortBy('featured');
    setPage(1);
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('product.browseProducts')}
        </Typography>
        
        {/* Filters Section */}
        <Grid container spacing={2} sx={{ mb: 4, mt: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label={t('common.search')}
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>{t('product.category')}</InputLabel>
              <Select
                value={selectedCategory}
                label={t('product.category')}
                onChange={handleCategoryChange}
              >
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category === 'All' ? t('product.categories.all') : t(`product.categories.${category}`, category)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>{t('common.sort')}</InputLabel>
              <Select
                value={sortBy}
                label={t('common.sort')}
                onChange={handleSortChange}
              >
                <MenuItem value="featured">{t('product.featured')}</MenuItem>
                <MenuItem value="priceLow">{t('product.priceLowToHigh')}</MenuItem>
                <MenuItem value="priceHigh">{t('product.priceHighToLow')}</MenuItem>
                <MenuItem value="name">{t('product.name')}</MenuItem>
                <MenuItem value="newest">{t('product.newest')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {/* Product List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : products.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {t('product.noResults')}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={resetFilters}
            >
              {t('product.clearFilters')}
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {products.map((product) => (
                <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <Pagination 
                  count={pagination.totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default ProductListPage; 