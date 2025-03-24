import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ShopManagementPage from './pages/ShopManagementPage';
import ProductManagementPage from './pages/ProductManagementPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
import ShopsListPage from './pages/ShopsListPage';
import ShopDetailPage from './pages/ShopDetailPage';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';
import PrivateRoute from './components/PrivateRoute';

// Create a futuristic gaming-inspired theme
let theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00FFB2', // Neon teal
      light: '#64FFDA',
      dark: '#00CC8E',
      contrastText: '#000000',
    },
    secondary: {
      main: '#FF0080', // Neon pink
      light: '#FF4DAA',
      dark: '#CC0066',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0A0A0A', // Near black
      paper: '#121212', // Dark gray
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    error: {
      main: '#FF3D6A', // Neon red
    },
    warning: {
      main: '#FFAD00', // Neon orange
    },
    info: {
      main: '#00BBFF', // Neon blue
    },
    success: {
      main: '#00FF70', // Neon green
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 0 12px 0 rgba(0, 255, 178, 0.5)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #00FFB2 30%, #00FFDA 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #00FFB2 30%, #00FFDA 90%)',
            boxShadow: '0 0 20px 0 rgba(0, 255, 178, 0.6)',
          },
        },
        outlinedPrimary: {
          borderColor: '#00FFB2',
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 178, 0.1)',
            boxShadow: '0 0 12px 0 rgba(0, 255, 178, 0.4)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #FF0080 30%, #FF36A6 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #FF0080 30%, #FF36A6 90%)',
            boxShadow: '0 0 20px 0 rgba(255, 0, 128, 0.6)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(to bottom right, rgba(30, 30, 30, 0.8), rgba(20, 20, 20, 0.8))',
          backdropFilter: 'blur(16px)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 8,
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 255, 178, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00FFB2',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(to right, rgba(10, 10, 10, 0.95), rgba(18, 18, 18, 0.95))',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: 'none',
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            width: '0',
            height: '2px',
            bottom: '-2px',
            left: '0',
            backgroundColor: '#00FFB2',
            transition: 'width 0.3s ease-in-out',
          },
          '&:hover:after': {
            width: '100%',
          },
        },
      },
    },
  },
});

// Make theme responsive
theme = responsiveFontSizes(theme);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductListPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/shops" element={<ShopsListPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route 
                    path="/my/shops" 
                    element={
                      <PrivateRoute roles={['seller']}>
                        <ShopManagementPage />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/my/products" 
                    element={
                      <PrivateRoute roles={['seller']}>
                        <ProductManagementPage />
                      </PrivateRoute>
                    } 
                  />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/shops/:id" element={<ShopDetailPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Layout>
            </Router>
          </ThemeProvider>
        </I18nextProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App; 