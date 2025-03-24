import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useCart } from '../contexts/CartContext';
import LockIcon from '@mui/icons-material/Lock';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SecurityIcon from '@mui/icons-material/Security';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { apiPost, apiGet } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const steps = ['Review Order', 'Payment Details', 'Confirmation'];

const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({
    cardNumber: false,
    cardHolder: false,
    expiryDate: false,
    cvv: false,
  });
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  });
  const [shippingErrors, setShippingErrors] = useState({
    fullName: false,
    addressLine1: false,
    city: false,
    state: false,
    postalCode: false,
    country: false,
    phone: false,
  });
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<{
    id: number;
    status: string;
    total: number;
    orderItems: Array<{
      productId: number;
      product?: {
        name: string;
        image: string;
      };
      quantity: number;
      price: number;
      totalPrice: number;
    }>;
    shippingAddress: string;
    paymentId: string;
    createdAt: string;
  } | null>(null);

  const calculateSubtotal = () => {
    return getCartTotal();
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateShipping = () => {
    return calculateSubtotal() > 100 ? 0 : 10; // Free shipping over $100
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  const handlePaymentInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPaymentDetails({
      ...paymentDetails,
      [name]: value,
    });
    
    // Clear the error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: false,
      });
    }
  };

  const handleShippingInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setShippingAddress({
      ...shippingAddress,
      [name]: value,
    });
    
    // Clear the error when user types
    if (shippingErrors[name as keyof typeof shippingErrors]) {
      setShippingErrors({
        ...shippingErrors,
        [name]: false,
      });
    }
  };

  const validatePaymentDetails = () => {
    const newErrors = {
      cardNumber: paymentDetails.cardNumber.length < 16,
      cardHolder: paymentDetails.cardHolder.trim() === '',
      expiryDate: !/^\d{2}\/\d{2}$/.test(paymentDetails.expiryDate),
      cvv: !/^\d{3,4}$/.test(paymentDetails.cvv),
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const validateShippingAddress = () => {
    const newErrors = {
      fullName: shippingAddress.fullName.trim() === '',
      addressLine1: shippingAddress.addressLine1.trim() === '',
      city: shippingAddress.city.trim() === '',
      state: shippingAddress.state.trim() === '',
      postalCode: shippingAddress.postalCode.trim() === '',
      country: shippingAddress.country.trim() === '',
      phone: shippingAddress.phone.trim() === '',
    };
    
    setShippingErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateShippingAddress()) {
      return;
    }
    
    if (activeStep === 1 && !validatePaymentDetails()) {
      return;
    }
    
    if (activeStep === 1) {
      handlePlaceOrder();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // Create order items from cart items
      const orderItems = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      // Create the order data matching our API format with detailed shipping info
      const orderData = {
        orderItems: orderItems,
        shippingDetails: {
          fullName: shippingAddress.fullName,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2 || "",
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone
        },
        paymentInfo: {
          bankCode: paymentDetails.cardNumber.substring(0, 6), // Use first 6 digits as bank code
          vssCode: paymentDetails.cvv // Use CVV as VSS code
        }
      };

      // Call the API to create the order, passing the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      interface OrderResponse {
        message: string;
        order: {
          id: number;
          status: string;
          total: number;
          orderItems: Array<{
            productId: number;
            quantity: number;
            price: number;
            totalPrice: number;
          }>;
        };
      }
      
      const response = await apiPost<OrderResponse>('orders', orderData, token);
      
      console.log('Order created successfully:', response);
      
      // Set order success and ID
      setOrderSuccess(true);
      setOrderId(response.order.id.toString());
      
      // Clear the cart
      clearCart();
      
      // Move to the confirmation step
      setActiveStep(2);
    } catch (error) {
      console.error('Error creating order:', error);
      // Show error to user
      alert(t('checkout.orderError'));
    } finally {
      setLoading(false);
    }
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const fetchOrderDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await apiGet<{order: any}>(`orders/${id}`, token);
      setOrderDetails(response.order);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  useEffect(() => {
    if (orderId && activeStep === 2 && !orderDetails) {
      fetchOrderDetails(orderId);
    }
  }, [orderId, activeStep, orderDetails]);

  const renderOrderSummary = () => (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('order.orderSummary')}
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, maxHeight: 300, overflow: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('product.name')}</TableCell>
                <TableCell align="right">{t('product.price')}</TableCell>
                <TableCell align="center">{t('product.quantity')}</TableCell>
                <TableCell align="right">{t('cart.total')}</TableCell>
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
                          width: 40,
                          height: 40,
                          objectFit: 'cover',
                          marginRight: 8,
                          borderRadius: '4px',
                        }}
                      />
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {item.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    ${item.price.toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    {item.quantity}
                  </TableCell>
                  <TableCell align="right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 2 }} />
        
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">{t('cart.subtotal')}</Typography>
            <Typography variant="body2">${calculateSubtotal().toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">{t('cart.tax')}</Typography>
            <Typography variant="body2">${calculateTax().toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">{t('order.shipping')}</Typography>
            <Typography variant="body2">
              {calculateShipping() === 0 
                ? t('order.freeShipping') 
                : `$${calculateShipping().toFixed(2)}`}
            </Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" fontWeight="bold">{t('cart.total')}</Typography>
            <Typography variant="subtitle1" fontWeight="bold">${calculateTotal().toFixed(2)}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderShippingAddressForm = () => (
    <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('checkout.shippingAddress')}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label={t('order.fullName')}
            name="fullName"
            value={shippingAddress.fullName}
            onChange={handleShippingInputChange}
            error={shippingErrors.fullName}
            helperText={shippingErrors.fullName ? t('common.required') : ''}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label={t('order.addressLine1')}
            name="addressLine1"
            value={shippingAddress.addressLine1}
            onChange={handleShippingInputChange}
            error={shippingErrors.addressLine1}
            helperText={shippingErrors.addressLine1 ? t('common.required') : ''}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t('order.addressLine2')}
            name="addressLine2"
            value={shippingAddress.addressLine2}
            onChange={handleShippingInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label={t('order.city')}
            name="city"
            value={shippingAddress.city}
            onChange={handleShippingInputChange}
            error={shippingErrors.city}
            helperText={shippingErrors.city ? t('common.required') : ''}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label={t('order.state')}
            name="state"
            value={shippingAddress.state}
            onChange={handleShippingInputChange}
            error={shippingErrors.state}
            helperText={shippingErrors.state ? t('common.required') : ''}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label={t('order.postalCode')}
            name="postalCode"
            value={shippingAddress.postalCode}
            onChange={handleShippingInputChange}
            error={shippingErrors.postalCode}
            helperText={shippingErrors.postalCode ? t('common.required') : ''}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label={t('order.country')}
            name="country"
            value={shippingAddress.country}
            onChange={handleShippingInputChange}
            error={shippingErrors.country}
            helperText={shippingErrors.country ? t('common.required') : ''}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label={t('order.phoneNumber')}
            name="phone"
            value={shippingAddress.phone}
            onChange={handleShippingInputChange}
            error={shippingErrors.phone}
            helperText={shippingErrors.phone ? t('common.required') : ''}
          />
        </Grid>
      </Grid>
    </Paper>
  );

  const renderPaymentForm = () => (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3 }}>
          {t('order.paymentDetails')}
        </Typography>
        
        <FormControl fullWidth error={errors.cardNumber} sx={{ mb: 3 }}>
          <InputLabel htmlFor="card-number">{t('order.cardNumber')}</InputLabel>
          <OutlinedInput
            id="card-number"
            name="cardNumber"
            value={paymentDetails.cardNumber}
            onChange={handlePaymentInputChange}
            startAdornment={
              <InputAdornment position="start">
                <CreditCardIcon />
              </InputAdornment>
            }
            placeholder="1234 5678 9012 3456"
            inputProps={{ maxLength: 19 }}
            label={t('order.cardNumber')}
          />
          {errors.cardNumber && (
            <FormHelperText>{t('order.invalidCardNumber')}</FormHelperText>
          )}
        </FormControl>
        
        <FormControl fullWidth error={errors.cardHolder} sx={{ mb: 3 }}>
          <InputLabel htmlFor="card-holder">{t('order.cardHolder')}</InputLabel>
          <OutlinedInput
            id="card-holder"
            name="cardHolder"
            value={paymentDetails.cardHolder}
            onChange={handlePaymentInputChange}
            label={t('order.cardHolder')}
            placeholder="John Doe"
          />
          {errors.cardHolder && (
            <FormHelperText>{t('common.required')}</FormHelperText>
          )}
        </FormControl>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <FormControl fullWidth error={errors.expiryDate}>
              <InputLabel htmlFor="expiry-date">{t('order.expiryDate')}</InputLabel>
              <OutlinedInput
                id="expiry-date"
                name="expiryDate"
                value={paymentDetails.expiryDate}
                onChange={handlePaymentInputChange}
                startAdornment={
                  <InputAdornment position="start">
                    <EventIcon />
                  </InputAdornment>
                }
                placeholder="MM/YY"
                inputProps={{ maxLength: 5 }}
                label={t('order.expiryDate')}
              />
              {errors.expiryDate && (
                <FormHelperText>{t('order.invalidExpiryDate')}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth error={errors.cvv}>
              <InputLabel htmlFor="cvv">{t('order.cvv')}</InputLabel>
              <OutlinedInput
                id="cvv"
                name="cvv"
                type="password"
                value={paymentDetails.cvv}
                onChange={handlePaymentInputChange}
                startAdornment={
                  <InputAdornment position="start">
                    <SecurityIcon />
                  </InputAdornment>
                }
                placeholder="123"
                inputProps={{ maxLength: 4 }}
                label={t('order.cvv')}
              />
              {errors.cvv && (
                <FormHelperText>{t('order.invalidCvv')}</FormHelperText>
              )}
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LockIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
          <Typography variant="caption" color="text.secondary">
            {t('order.securePayment')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const renderOrderConfirmation = () => (
    <Box sx={{ textAlign: 'center', p: 3 }}>
      <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        {t('order.thankYou')}
      </Typography>
      <Typography variant="body1" paragraph>
        {t('order.orderConfirmed')}
      </Typography>
      
      <Card variant="outlined" sx={{ mb: 3, textAlign: 'left', p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
          {t('order.orderDetails')}:
        </Typography>
        
        <Typography variant="subtitle1" fontWeight="bold">
          {t('order.orderNumber')}: #{orderId}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {t('order.status')}: <Box component="span" sx={{ color: 'success.main', fontWeight: 'bold' }}>
            {orderDetails?.status || t('order.paid')}
          </Box>
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {t('order.date')}: {orderDetails?.createdAt ? new Date(orderDetails.createdAt).toLocaleString() : new Date().toLocaleString()}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {t('order.paymentId')}: {orderDetails?.paymentId || '—'}
        </Typography>
        
        {orderDetails?.orderItems && orderDetails.orderItems.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              {t('order.items')}:
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, maxHeight: 300, overflow: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('product.name')}</TableCell>
                    <TableCell align="right">{t('product.price')}</TableCell>
                    <TableCell align="center">{t('product.quantity')}</TableCell>
                    <TableCell align="right">{t('cart.total')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderDetails.orderItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {item.product?.name || `Product #${item.productId}`}
                      </TableCell>
                      <TableCell align="right">
                        ${item.price.toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        {item.quantity}
                      </TableCell>
                      <TableCell align="right">
                        ${item.totalPrice.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
        
        <Box sx={{ textAlign: 'right', mt: 2, borderTop: '1px solid #eee', pt: 2 }}>
          <Typography variant="h6">
            {t('order.total')}: ${orderDetails?.total?.toFixed(2) || '0.00'}
          </Typography>
        </Box>
      </Card>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        {t('order.confirmationEmail')}
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        onClick={handleContinueShopping}
        sx={{ mt: 2 }}
      >
        {t('cart.continueShopping')}
      </Button>
    </Box>
  );

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {renderShippingAddressForm()}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderOrderSummary()}
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {renderOrderSummary()}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderPaymentForm()}
            </Grid>
          </Grid>
        );
      case 2:
        return renderOrderConfirmation();
      default:
        return <div>Unknown step</div>;
    }
  };

  const renderButtons = () => {
    if (activeStep === steps.length - 1) {
      return (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleContinueShopping}
        >
          {t('cart.continueShopping')}
        </Button>
      );
    }

    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          {t('common.back')}
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          disabled={loading}
          startIcon={activeStep === 1 && loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {activeStep === 1 
            ? (loading ? t('checkout.processingPayment') : t('checkout.placeOrder'))
            : t('common.next')
          }
        </Button>
      </Box>
    );
  };

  // Redirect to products if cart is empty (unless order was just completed)
  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            py: 6 
          }}
        >
          <Typography variant="h5" gutterBottom>
            {t('cart.empty')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('checkout.emptyCartMessage')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleContinueShopping}
          >
            {t('cart.continueShopping')}
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('checkout.title')}
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{t(`checkout.${label.toLowerCase().replace(' ', '')}`)}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {renderStepContent(activeStep)}
      
      {renderButtons()}
    </Container>
  );
};

export default CheckoutPage; 