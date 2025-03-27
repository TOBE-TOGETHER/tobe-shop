import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Badge,
  CssBaseline
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import StorefrontIcon from '@mui/icons-material/Storefront';
import InventoryIcon from '@mui/icons-material/Inventory';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../hooks/useUser';
import { useCart } from '../contexts/CartContext';
import LanguageSwitcher from './LanguageSwitcher';
import Footer from './Footer';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated, isSeller, logout } = useAuth();
  const { user } = useUser();
  const { getCartCount } = useCart();
  const { t } = useTranslation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        {t('app.name')}
      </Typography>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/" sx={{ textAlign: 'center' }}>
            <ListItemText primary={t('nav.home')} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/products" sx={{ textAlign: 'center' }}>
            <ListItemText primary={t('nav.products')} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/shops" sx={{ textAlign: 'center' }}>
            <ListItemText primary={t('nav.shops')} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/about" sx={{ textAlign: 'center' }}>
            <ListItemText primary={t('nav.aboutUs')} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/contact" sx={{ textAlign: 'center' }}>
            <ListItemText primary={t('nav.contactUs')} />
          </ListItemButton>
        </ListItem>
        {!isAuthenticated ? (
          <>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/login" sx={{ textAlign: 'center' }}>
                <ListItemText primary={t('nav.login')} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/register" sx={{ textAlign: 'center' }}>
                <ListItemText primary={t('nav.register')} />
              </ListItemButton>
            </ListItem>
          </>
        ) : isSeller ? (
          <>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/my/shops" sx={{ textAlign: 'center' }}>
                <ListItemText primary={t('nav.myShop')} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/my/products" sx={{ textAlign: 'center' }}>
                <ListItemText primary={t('nav.myProducts')} />
              </ListItemButton>
            </ListItem>
          </>
        ) : null}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="static"
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              color: 'white',
              textDecoration: 'none',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {t('app.name')}
          </Typography>

          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <Button color="inherit" component={RouterLink} to="/">
              {t('nav.home')}
            </Button>
            <Button color="inherit" component={RouterLink} to="/products">
              {t('nav.products')}
            </Button>
            <Button color="inherit" component={RouterLink} to="/shops">
              {t('nav.shops')}
            </Button>
            <Button color="inherit" component={RouterLink} to="/about">
              {t('nav.aboutUs')}
            </Button>
            <Button color="inherit" component={RouterLink} to="/contact">
              {t('nav.contactUs')}
            </Button>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <LanguageSwitcher />

          <IconButton color="inherit" component={RouterLink} to="/cart">
            <Badge badgeContent={getCartCount()} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {!isAuthenticated ? (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                {t('nav.login')}
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                {t('nav.register')}
              </Button>
            </>
          ) : (
            <>
              <IconButton
                color="inherit"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
              >
                {user?.avatar ? (
                  <Avatar
                    src={user.avatar}
                    alt={user.username}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircleIcon />
                )}
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose} component={RouterLink} to="/profile">
                  <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                  {t('nav.profile')}
                </MenuItem>
                {isSeller && (
                  <>
                    <MenuItem onClick={handleClose} component={RouterLink} to="/my/shops">
                      <StorefrontIcon fontSize="small" sx={{ mr: 1 }} />
                      {t('nav.myShop')}
                    </MenuItem>
                    <MenuItem onClick={handleClose} component={RouterLink} to="/my/products">
                      <InventoryIcon fontSize="small" sx={{ mr: 1 }} />
                      {t('nav.myProducts')}
                    </MenuItem>
                  </>
                )}
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                  {t('nav.logout')}
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>

      <Footer />
    </Box>
  );
};

export default Layout; 