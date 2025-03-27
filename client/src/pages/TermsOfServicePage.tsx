import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';

const TermsOfServicePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          {t('terms.title')}
        </Typography>
        
        <Paper elevation={0} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            {t('terms.introduction.title')}
          </Typography>
          <Typography paragraph>
            {t('terms.introduction.content')}
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('terms.userAgreement.title')}
          </Typography>
          <Typography paragraph>
            {t('terms.userAgreement.content')}
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('terms.accountResponsibilities.title')}
          </Typography>
          <Typography paragraph>
            {t('terms.accountResponsibilities.content')}
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('terms.purchases.title')}
          </Typography>
          <Typography paragraph>
            {t('terms.purchases.content')}
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('terms.sellerGuidelines.title')}
          </Typography>
          <Typography paragraph>
            {t('terms.sellerGuidelines.content')}
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('terms.intellectualProperty.title')}
          </Typography>
          <Typography paragraph>
            {t('terms.intellectualProperty.content')}
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('terms.limitations.title')}
          </Typography>
          <Typography paragraph>
            {t('terms.limitations.content')}
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('terms.termination.title')}
          </Typography>
          <Typography paragraph>
            {t('terms.termination.content')}
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('terms.changes.title')}
          </Typography>
          <Typography paragraph>
            {t('terms.changes.content')}
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('terms.contact.title')}
          </Typography>
          <Typography paragraph>
            {t('terms.contact.content')}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default TermsOfServicePage; 