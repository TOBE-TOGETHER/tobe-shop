import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Avatar,
  Divider,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import StoreIcon from '@mui/icons-material/Store';
import SecurityIcon from '@mui/icons-material/Security';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const AboutUsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const features = [
    {
      icon: <StoreIcon sx={{ fontSize: 40 }} />,
      title: t('about.features.marketplace'),
      description: t('about.features.marketplaceDesc'),
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: t('about.features.security'),
      description: t('about.features.securityDesc'),
    },
    {
      icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
      title: t('about.features.delivery'),
      description: t('about.features.deliveryDesc'),
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 40 }} />,
      title: t('about.features.support'),
      description: t('about.features.supportDesc'),
    },
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          {t('about.title')}
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          {t('about.subtitle')}
        </Typography>
      </Box>

      {/* Mission Section */}
      <Paper elevation={0} sx={{ bgcolor: 'background.default', py: 6, px: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom align="center">
          {t('about.mission.title')}
        </Typography>
        <Typography variant="body1" paragraph align="center">
          {t('about.mission.description')}
        </Typography>
      </Paper>

      {/* Features Section */}
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>
          {t('about.features.title')}
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: theme.palette.primary.main,
                    mb: 2,
                  }}
                >
                  {feature.icon}
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Values Section */}
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>
          {t('about.values.title')}
        </Typography>
        <Divider sx={{ my: 4 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              {t('about.values.innovation')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('about.values.innovationDesc')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              {t('about.values.integrity')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('about.values.integrityDesc')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              {t('about.values.community')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('about.values.communityDesc')}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Contact Section */}
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {t('about.contact.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('about.contact.email')}: support@tobe-shop.com
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('about.contact.phone')}: +1 (555) 123-4567
        </Typography>
      </Box>
    </Container>
  );
};

export default AboutUsPage; 