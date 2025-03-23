import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Divider,
  Grid,
  TextField,
  Typography,
  InputAdornment,
  Skeleton,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useTranslation } from 'react-i18next';

// Define Shop interface
interface Shop {
  id: number;
  name: string;
  description: string;
  logo?: string;
  address?: string;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
  productCount?: number;
  owner?: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

const ShopsListPage: React.FC = () => {
  const { t } = useTranslation();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch shops from API
  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8080/api/shops');
      
      if (!response.ok) {
        throw new Error('Failed to fetch shops');
      }
      
      const data = await response.json();
      
      if (data && data.shops) {
        // Process each shop to ensure it has the correct format
        const processedShops = data.shops.map((shop: Shop) => ({
          ...shop,
          // If logo is missing, provide a default
          logo: shop.logo || 'https://via.placeholder.com/600x400?text=Shop',
        }));
        
        setShops(processedShops);
      } else {
        setShops([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shops');
      console.error('Error fetching shops:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle enter key press in search field
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Just filter client-side
    }
  };

  // Filter shops based on search query (client-side filtering)
  const filteredShops = searchQuery.trim() === '' 
    ? shops 
    : shops.filter(shop => 
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shop.address && shop.address.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('shops.allShops')}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {t('shops.discover')}
        </Typography>
        
        <TextField
          fullWidth
          placeholder={t('shops.searchPlaceholder')}
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          sx={{ mb: 4, mt: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Box>
      
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item key={item} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" height={32} width="80%" />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="text" height={20} width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : filteredShops.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <StorefrontIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {t('shops.noResults')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('shops.tryDifferent')}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredShops.map((shop) => (
            <Grid item key={shop.id} xs={12} sm={6} md={4} lg={3}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height={200}
                  image={shop.logo || 'https://via.placeholder.com/600x400?text=Shop'}
                  alt={shop.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {shop.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {shop.description}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('shops.owner')}: {shop.owner?.username || `User ${shop.userId}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {shop.productCount || 0} {t('shops.products')}
                    </Typography>
                  </Box>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button 
                    component={RouterLink} 
                    to={`/shops/${shop.id}`}
                    variant="contained" 
                    fullWidth
                  >
                    {t('shops.visit')}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ShopsListPage; 