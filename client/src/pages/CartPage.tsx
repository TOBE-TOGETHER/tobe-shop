import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

// Updated cart data with Pexels images
const initialCartItems = [
  {
    id: 1,
    name: 'Premium Smartphone',
    price: 999.99,
    quantity: 1,
    image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 3,
    name: 'Wireless Headphones',
    price: 299.99,
    quantity: 2,
    image: 'https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const CartPage: React.FC = () => {
  const { t } = useTranslation();
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const navigate = useNavigate();

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax rate
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = () => {
    // In a real app, redirect to checkout page or process payment
    navigate('/checkout');
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        {t('cart.title')}
      </Typography>

      {cartItems.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 6,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {t('cart.empty')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/products"
            sx={{ mt: 2 }}
          >
            {t('cart.continueShopping')}
          </Button>
        </Box>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('cart.product')}</TableCell>
                    <TableCell align="right">{t('product.price')}</TableCell>
                    <TableCell align="center">{t('product.quantity')}</TableCell>
                    <TableCell align="right">{t('cart.total')}</TableCell>
                    <TableCell align="center">{t('common.action')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: 80,
                              height: 80,
                              objectFit: 'cover',
                              marginRight: 16,
                              borderRadius: '4px',
                            }}
                          />
                          <Typography variant="body1">{item.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        ${item.price.toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                          >
                            <RemoveIcon />
                          </IconButton>
                          <TextField
                            size="small"
                            value={item.quantity}
                            InputProps={{
                              readOnly: true,
                              sx: { width: 40, mx: 1, input: { textAlign: 'center' } },
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveItem(item.id)}
                          aria-label={t('cart.remove')}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button
                variant="outlined"
                component={RouterLink}
                to="/products"
              >
                {t('cart.continueShopping')}
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('cart.orderSummary')}
                </Typography>
                <Box sx={{ my: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body1">{t('cart.subtotal')}</Typography>
                    <Typography variant="body1">
                      ${calculateSubtotal().toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body1">{t('cart.tax')}</Typography>
                    <Typography variant="body1">
                      ${calculateTax().toFixed(2)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">{t('cart.total')}</Typography>
                    <Typography variant="h6">
                      ${calculateTotal().toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handleCheckout}
                >
                  {t('cart.checkout')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CartPage; 