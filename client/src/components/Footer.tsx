import React from 'react';
import { Box, Container, Typography, Link, Stack, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'background.paper',
        py: 4,
        mt: 'auto',
        borderTop: 1,
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'center', md: 'flex-start' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              {t('app.name')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              © {currentYear} {t('app.name')}. {t('footer.rights')}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={3}>
            <Link href="#" color="inherit" underline="hover">
              {t('footer.aboutUs')}
            </Link>
            <Link href="#" color="inherit" underline="hover">
              {t('footer.contactUs')}
            </Link>
            <Link href="#" color="inherit" underline="hover">
              {t('footer.terms')}
            </Link>
            <Link href="#" color="inherit" underline="hover">
              {t('footer.privacy')}
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer; 