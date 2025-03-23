import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
  styled,
  alpha,
  useTheme,
  CircularProgress,
  Alert
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Product } from '../components/products/ProductCard';

// Styled components for the futuristic UI
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '80vh',
  display: 'flex',
  alignItems: 'center',
  background: 'linear-gradient(180deg, #0A0A0A 0%, #121212 100%)',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    height: 'auto',
    minHeight: '90vh',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url(https://images.pexels.com/photos/6476260/pexels-photo-6476260.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.25,
    zIndex: 0,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, transparent 0%, #0A0A0A 70%)',
    zIndex: 1,
  }
}));

const HeroContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  width: '100%',
  padding: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(6),
  }
}));

const GlowingText = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  textShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.7)}`,
}));

const GlowingBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  background: alpha(theme.palette.background.paper, 0.7),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.2)}`,
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '5px',
    height: '100%',
    background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

const FuturisticCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(24, 24, 24, 0.9) 0%, rgba(12, 12, 12, 0.9) 100%)',
  backdropFilter: 'blur(10px)',
  borderRadius: '8px',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  overflow: 'hidden',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 12px 40px rgba(0, 0, 0, 0.6), 0 0 15px ${alpha(theme.palette.primary.main, 0.3)}`,
  }
}));

const GradientOverlay = styled(Box)(({ theme }) => ({
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    background: `linear-gradient(to top, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.background.paper, 0)} 100%)`,
    zIndex: 1,
  }
}));

const FullWidthSectionWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  background: 'linear-gradient(135deg, #0A0A0A 0%, #121212 100%)',
  padding: theme.spacing(6, 0),
  marginTop: theme.spacing(6),
  marginBottom: theme.spacing(6),
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: `linear-gradient(90deg, transparent 0%, ${theme.palette.primary.main} 50%, transparent 100%)`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: `linear-gradient(90deg, transparent 0%, ${theme.palette.primary.main} 50%, transparent 100%)`,
  }
}));

// Updated mock data for featured shops with futuristic theme
const featuredShops = [
  {
    id: 1,
    name: 'Neurolink Gaming',
    description: 'Cutting-edge neural interface technology',
    image: 'https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 2,
    name: 'Quantum Arcade',
    description: 'Zero-latency cloud gaming solutions',
    image: 'https://images.pexels.com/photos/4069868/pexels-photo-4069868.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 3,
    name: 'CyberTech Industries',
    description: 'Advanced gaming hardware and peripherals',
    image: 'https://images.pexels.com/photos/3913025/pexels-photo-3913025.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
];

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Add state for featured products from API
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add state for featured shops from API
  const [featuredShops, setFeaturedShops] = useState<any[]>([]);
  const [shopsLoading, setShopsLoading] = useState<boolean>(true);
  const [shopsError, setShopsError] = useState<string | null>(null);

  // Define fetch function outside useEffect so it can be reused
  const fetchFeaturedProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Update API endpoint to use port 8080 and sort by featured
      const response = await fetch('http://localhost:8080/api/products?status=available&page=1&limit=8&sort=featured');

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // The response likely has a different structure - adjust to match actual response
      setFeaturedProducts(data.products || data || []);

      console.log('Fetched products:', data); // Add logging to debug
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Define fetch function for shops with useCallback to avoid dependency cycle
  const fetchFeaturedShops = useCallback(async () => {
    setShopsLoading(true);
    setShopsError(null);
    
    try {
      // Fetch shops from API
      const response = await fetch('http://localhost:8080/api/shops?page=1&limit=8&sort=featured');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      // The response likely has a different structure - adjust to match actual response
      setFeaturedShops(data.shops || data || []);
      
      console.log('Fetched shops:', data); // Add logging to debug
    } catch (err) {
      console.error('Failed to fetch shops:', err);
      setShopsError(t('common.networkError'));
    } finally {
      setShopsLoading(false);
    }
  }, [t]);

  // Fetch featured products on component mount
  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  // Fetch featured shops on component mount
  useEffect(() => {
    fetchFeaturedShops();
  }, [fetchFeaturedShops]);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <Container maxWidth="lg">
            <Grid container spacing={{ xs: 2, md: 4 }} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography
                  variant="h1"
                  sx={{
                    mb: { xs: 0.5, md: 1 },
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1
                  }}
                >
                  {t('home.heroTitle')}
                </Typography>

                <GlowingText
                  variant="h3"
                  sx={{
                    mb: { xs: 2, md: 4 },
                    fontWeight: 700,
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2
                  }}
                >
                  {t('home.heroSubtitle')}
                </GlowingText>

                <Box sx={{
                  display: 'flex',
                  gap: { xs: 1, md: 2 },
                  mt: { xs: 3, md: 5 },
                  flexDirection: { xs: 'column', sm: 'row' },
                  width: { xs: '100%', sm: 'auto' }
                }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/products"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      px: { xs: 2, md: 4 },
                      py: { xs: 1, md: 1.5 },
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      fontWeight: 600,
                      width: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    {t('nav.products')}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    component={Link}
                    to="/register"
                    size="large"
                    sx={{
                      px: { xs: 2, md: 4 },
                      py: { xs: 1, md: 1.5 },
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      fontWeight: 600,
                      width: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    {t('auth.seller')}
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={5}>
                <GlowingBox sx={{ mt: { xs: 4, md: 0 }, position: 'relative' }}>
                  <Typography variant="body1" sx={{
                    mb: 2,
                    color: alpha(theme.palette.text.primary, 0.7),
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }}>
                    {t('home.shopDescription')}
                  </Typography>

                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: theme.palette.text.secondary,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    mt: { xs: 1.5, md: 2 }
                  }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        color: theme.palette.primary.main,
                      }}
                    >
                      01
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main }}>
                        {t('home.featureTitle1')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha(theme.palette.text.primary, 0.7) }}>
                        {t('home.featureDesc1')}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: theme.palette.text.secondary,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    mt: { xs: 1.5, md: 2 }
                  }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                        color: theme.palette.secondary.main,
                      }}
                    >
                      02
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main }}>
                        {t('home.featureTitle2')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha(theme.palette.text.primary, 0.7) }}>
                        {t('home.featureDesc2')}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: theme.palette.text.secondary,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    mt: { xs: 1.5, md: 2 }
                  }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${alpha('#FF4D6A', 0.3)}`,
                        color: '#FF4D6A',
                      }}
                    >
                      03
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ color: '#FF4D6A' }}>
                        {t('home.featureTitle3')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha(theme.palette.text.primary, 0.7) }}>
                        {t('home.featureDesc3')}
                      </Typography>
                    </Box>
                  </Box>
                </GlowingBox>
              </Grid>
            </Grid>
          </Container>
        </HeroContent>
      </HeroSection>

      {/* Featured Products */}
      <Box sx={{ 
        py: 8, 
        background: 'linear-gradient(135deg, #0A0A0A 0%, #121212 100%)',
        color: 'common.white',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${theme.palette.primary.main} 50%, transparent 100%)`,
        }
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="overline" sx={{
                color: theme.palette.primary.main,
                letterSpacing: '0.1em',
                fontSize: { xs: '0.7rem', md: '0.75rem' }
              }}>
                {t('home.featuredTitle')}
              </Typography>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                {t('home.featured')}
              </Typography>
            </Box>
            <Button 
              component={Link} 
              to="/products" 
              endIcon={<ArrowForwardIcon />} 
              sx={{ 
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08)
                }
              }}
            >
              {t('home.viewAll')}
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ my: 2 }}>
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  // Manually trigger a refetch
                  setLoading(true);
                  setError(null);
                  fetchFeaturedProducts();
                }}
              >
                {t('common.tryAgain')}
              </Button>
            </Box>
          ) : !featuredProducts || featuredProducts.length === 0 ? (
            <Alert severity="info" sx={{ my: 2 }}>{t('home.noProducts')}</Alert>
          ) : (
            <Box 
              sx={{ 
                display: 'flex',
                overflowX: 'hidden',
                pb: 2,
                gap: 3,
                position: 'relative',
                '& > div': {
                  animation: 'scrollProducts 30s linear infinite',
                },
                '@keyframes scrollProducts': {
                  '0%': {
                    transform: 'translateX(0)'
                  },
                  '100%': {
                    transform: 'translateX(calc(-280px * 4))'
                  }
                }
              }}
            >
              <Box sx={{ display: 'flex', gap: 3 }}>
                {/* First set of products for infinite scroll effect */}
                {featuredProducts.map((product) => (
                  <Card 
                    key={`first-${product.id}`}
                    sx={{ 
                      width: 280, 
                      minWidth: 280,
                      display: 'flex',
                      flexDirection: 'column',
                      height: 400,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[10],
                      },
                      backgroundColor: 'rgba(37, 37, 37, 0.9)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <CardActionArea 
                      component={Link} 
                      to={`/products/${product.id}`}
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        flexGrow: 1,
                        alignItems: 'stretch',
                        height: '100%'
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={product.image || 'https://via.placeholder.com/300x200'}
                        alt={product.name}
                        sx={{ 
                          objectFit: 'cover',
                          objectPosition: 'center',
                          height: '200px',
                          width: '100%',
                          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                        }}
                      />
                      <CardContent sx={{ 
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <Box>
                          <Typography variant="h6" component="h3" sx={{ 
                            color: theme.palette.primary.main,
                            fontWeight: 'bold',
                            mb: 1
                          }}>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ 
                            mb: 2,
                            height: '2.4em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            color: alpha(theme.palette.common.white, 0.7)
                          }}>
                            {product.description?.slice(0, 80)}
                            {product.description?.length > 80 ? '...' : ''}
                          </Typography>
                        </Box>
                        <Typography variant="h6" component="p" sx={{ 
                          color: theme.palette.common.white,
                          fontWeight: 'bold' 
                        }}>
                          ${product.price?.toFixed(2)}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
                
                {/* Duplicate set for infinite scroll effect */}
                {featuredProducts.map((product) => (
                  <Card 
                    key={`second-${product.id}`}
                    sx={{ 
                      width: 280, 
                      minWidth: 280,
                      display: 'flex',
                      flexDirection: 'column',
                      height: 400,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[10],
                      },
                      backgroundColor: 'rgba(37, 37, 37, 0.9)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <CardActionArea 
                      component={Link} 
                      to={`/products/${product.id}`}
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        flexGrow: 1,
                        alignItems: 'stretch',
                        height: '100%'
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={product.image || 'https://via.placeholder.com/300x200'}
                        alt={product.name}
                        sx={{ 
                          objectFit: 'cover',
                          objectPosition: 'center',
                          height: '200px',
                          width: '100%',
                          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                        }}
                      />
                      <CardContent sx={{ 
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <Box>
                          <Typography variant="h6" component="h3" sx={{ 
                            color: theme.palette.primary.main,
                            fontWeight: 'bold',
                            mb: 1
                          }}>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ 
                            mb: 2,
                            height: '2.4em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            color: alpha(theme.palette.common.white, 0.7)
                          }}>
                            {product.description?.slice(0, 80)}
                            {product.description?.length > 80 ? '...' : ''}
                          </Typography>
                        </Box>
                        <Typography variant="h6" component="p" sx={{ 
                          color: theme.palette.common.white,
                          fontWeight: 'bold' 
                        }}>
                          ${product.price?.toFixed(2)}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </Container>
      </Box>

      {/* Benefits/Features Section */}
      <Box sx={{ 
        py: 8, 
        background: 'linear-gradient(135deg, #0A0A0A 0%, #121212 100%)',
        color: 'common.white',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${theme.palette.primary.main} 50%, transparent 100%)`,
        }
      }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h4" component="h2" gutterBottom>
              {t('home.welcomeTitle')}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
              {t('home.welcomeSubtitle')}
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Benefit 1 */}
            <Grid item xs={12} md={4}>
              <Box 
                sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: 'rgba(37, 37, 37, 0.9)',
                  height: '100%',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <Typography 
                  variant="h2" 
                  component="div" 
                  sx={{ 
                    mb: 1, 
                    color: theme.palette.primary.main,
                    fontWeight: 'bold',
                    display: 'inline-block'
                  }}
                >
                  01
                </Typography>
                <Typography variant="h6" component="h3" sx={{ mb: 2, color: theme.palette.common.white }}>
                  {t('home.benefit1Title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('home.benefit1Desc')}
                </Typography>
              </Box>
            </Grid>

            {/* Benefit 2 */}
            <Grid item xs={12} md={4}>
              <Box 
                sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: 'rgba(37, 37, 37, 0.9)',
                  height: '100%',
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                }}
              >
                <Typography 
                  variant="h2" 
                  component="div" 
                  sx={{ 
                    mb: 1, 
                    color: theme.palette.secondary.main,
                    fontWeight: 'bold',
                    display: 'inline-block'
                  }}
                >
                  02
                </Typography>
                <Typography variant="h6" component="h3" sx={{ mb: 2, color: theme.palette.common.white }}>
                  {t('home.benefit2Title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('home.benefit2Desc')}
                </Typography>
              </Box>
            </Grid>

            {/* Benefit 3 */}
            <Grid item xs={12} md={4}>
              <Box 
                sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: 'rgba(37, 37, 37, 0.9)',
                  height: '100%',
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                }}
              >
                <Typography 
                  variant="h2" 
                  component="div" 
                  sx={{ 
                    mb: 1, 
                    color: theme.palette.error.main,
                    fontWeight: 'bold',
                    display: 'inline-block'
                  }}
                >
                  03
                </Typography>
                <Typography variant="h6" component="h3" sx={{ mb: 2, color: theme.palette.common.white }}>
                  {t('home.benefit3Title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('home.benefit3Desc')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Empty Box with No Bottom Border */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #0A0A0A 0%, #121212 100%)', 
        height: '80px' 
      }}></Box>

      {/* Featured Shops Section */}
      <Box sx={{ 
        py: 8, 
        background: 'linear-gradient(135deg, #0A0A0A 0%, #121212 100%)',
        color: 'common.white',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${theme.palette.primary.main} 50%, transparent 100%)`,
        }
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="overline" sx={{
                color: theme.palette.primary.main,
                letterSpacing: '0.1em',
                fontSize: { xs: '0.7rem', md: '0.75rem' }
              }}>
                {t('home.exploreShops')}
              </Typography>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                {t('home.featuredShops')}
              </Typography>
            </Box>
            <Button 
              component={Link} 
              to="/shops" 
              endIcon={<ArrowForwardIcon />} 
              sx={{ 
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08)
                }
              }}
            >
              {t('home.viewAll')}
            </Button>
          </Box>
          
          {shopsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : shopsError ? (
            <Box sx={{ my: 2 }}>
              <Alert severity="error" sx={{ mb: 2 }}>{shopsError}</Alert>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  // Manually trigger a refetch
                  setShopsLoading(true);
                  setShopsError(null);
                  fetchFeaturedShops();
                }}
              >
                {t('common.tryAgain')}
              </Button>
            </Box>
          ) : !featuredShops || featuredShops.length === 0 ? (
            <Alert severity="info" sx={{ my: 2 }}>{t('shops.noResults')}</Alert>
          ) : (
            <Box 
              sx={{ 
                display: 'flex',
                overflowX: 'hidden',
                pb: 2,
                gap: 3,
                position: 'relative',
                '& > div': {
                  animation: 'scrollShops 30s linear infinite',
                },
                '@keyframes scrollShops': {
                  '0%': {
                    transform: 'translateX(0)'
                  },
                  '100%': {
                    transform: 'translateX(calc(-280px * 4))'
                  }
                }
              }}
            >
              <Box sx={{ display: 'flex', gap: 3 }}>
                {/* First set of shops for infinite scroll effect */}
                {featuredShops.map((shop) => (
                  <Card 
                    key={`first-${shop.id}`}
                    sx={{ 
                      width: 280, 
                      minWidth: 280,
                      display: 'flex',
                      flexDirection: 'column',
                      height: 380,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[10],
                      },
                      backgroundColor: 'rgba(37, 37, 37, 0.9)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <CardActionArea 
                      component={Link} 
                      to={`/shops/${shop.id}`}
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        flexGrow: 1,
                        alignItems: 'stretch',
                        height: '100%'
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={shop.logo || 'https://via.placeholder.com/300x200?text=Shop'}
                        alt={shop.name}
                        sx={{ 
                          objectFit: 'cover',
                          objectPosition: 'center',
                          height: '200px',
                          width: '100%',
                          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                        }}
                      />
                      <CardContent sx={{ 
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <Box>
                          <Typography variant="h6" component="h3" sx={{ 
                            color: theme.palette.primary.main,
                            fontWeight: 'bold',
                            mb: 1
                          }}>
                            {shop.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ 
                            mb: 2,
                            height: '2.4em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            color: alpha(theme.palette.common.white, 0.7)
                          }}>
                            {shop.description?.slice(0, 80)}
                            {shop.description?.length > 80 ? '...' : ''}
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          color="primary"
                          fullWidth
                        >
                          {t('home.exploreShop')}
                        </Button>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
                
                {/* Duplicate set for infinite scroll effect */}
                {featuredShops.map((shop) => (
                  <Card 
                    key={`second-${shop.id}`}
                    sx={{ 
                      width: 280, 
                      minWidth: 280,
                      display: 'flex',
                      flexDirection: 'column',
                      height: 380,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[10],
                      },
                      backgroundColor: 'rgba(37, 37, 37, 0.9)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <CardActionArea 
                      component={Link} 
                      to={`/shops/${shop.id}`}
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        flexGrow: 1,
                        alignItems: 'stretch',
                        height: '100%'
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={shop.logo || 'https://via.placeholder.com/300x200?text=Shop'}
                        alt={shop.name}
                        sx={{ 
                          objectFit: 'cover',
                          objectPosition: 'center',
                          height: '200px',
                          width: '100%',
                          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                        }}
                      />
                      <CardContent sx={{ 
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <Box>
                          <Typography variant="h6" component="h3" sx={{ 
                            color: theme.palette.primary.main,
                            fontWeight: 'bold',
                            mb: 1
                          }}>
                            {shop.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ 
                            mb: 2,
                            height: '2.4em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            color: alpha(theme.palette.common.white, 0.7)
                          }}>
                            {shop.description?.slice(0, 80)}
                            {shop.description?.length > 80 ? '...' : ''}
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          color="primary"
                          fullWidth
                        >
                          {t('home.exploreShop')}
                        </Button>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 