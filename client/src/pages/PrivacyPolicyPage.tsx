import React from 'react';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PrivacyPolicyPage: React.FC = () => {
  const { t } = useTranslation();
  const lastUpdated = "March 28, 2025";

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          {t('privacy.title')}
        </Typography>
        
        <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
          Last Updated: {lastUpdated}
        </Typography>
        
        <Paper elevation={0} sx={{ p: 4, mt: 4 }}>
          <Typography paragraph>
            {t('privacy.introduction.content')}
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('privacy.scope.title')}
          </Typography>
          <Typography paragraph>
            {t('privacy.scope.content')}
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('privacy.informationCollection.title')}
          </Typography>
          <Typography paragraph>
            {t('privacy.informationCollection.content')}
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary={t('privacy.informationCollection.personal.title')}
                secondary={t('privacy.informationCollection.personal.content')}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary={t('privacy.informationCollection.payment.title')}
                secondary={t('privacy.informationCollection.payment.content')}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary={t('privacy.informationCollection.usage.title')}
                secondary={t('privacy.informationCollection.usage.content')}
              />
            </ListItem>
          </List>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('privacy.informationUse.title')}
          </Typography>
          <Typography paragraph>
            {t('privacy.informationUse.content')}
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary={t('privacy.informationUse.purposes.title')}
                secondary={t('privacy.informationUse.purposes.content')}
              />
            </ListItem>
          </List>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('privacy.informationSharing.title')}
          </Typography>
          <Typography paragraph>
            {t('privacy.informationSharing.content')}
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary={t('privacy.informationSharing.thirdParties.title')}
                secondary={t('privacy.informationSharing.thirdParties.content')}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary={t('privacy.informationSharing.legal.title')}
                secondary={t('privacy.informationSharing.legal.content')}
              />
            </ListItem>
          </List>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('privacy.dataSecurity.title')}
          </Typography>
          <Typography paragraph>
            {t('privacy.dataSecurity.content')}
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('privacy.cookies.title')}
          </Typography>
          <Typography paragraph>
            {t('privacy.cookies.content')}
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary={t('privacy.cookies.types.title')}
                secondary={t('privacy.cookies.types.content')}
              />
            </ListItem>
          </List>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('privacy.userRights.title')}
          </Typography>
          <Typography paragraph>
            {t('privacy.userRights.content')}
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary={t('privacy.userRights.access.title')}
                secondary={t('privacy.userRights.access.content')}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary={t('privacy.userRights.deletion.title')}
                secondary={t('privacy.userRights.deletion.content')}
              />
            </ListItem>
          </List>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('privacy.dataRetention.title')}
          </Typography>
          <Typography paragraph>
            {t('privacy.dataRetention.content')}
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('privacy.internationalTransfers.title')}
          </Typography>
          <Typography paragraph>
            {t('privacy.internationalTransfers.content')}
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('privacy.childrenPrivacy.title')}
          </Typography>
          <Typography paragraph>
            {t('privacy.childrenPrivacy.content')}
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('privacy.changes.title')}
          </Typography>
          <Typography paragraph>
            {t('privacy.changes.content')}
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            {t('privacy.contact.title')}
          </Typography>
          <Typography paragraph>
            {t('privacy.contact.content')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Email: privacy@tobeshop.com<br />
            Address: 123 Privacy Street, Tech City, TC 12345
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default PrivacyPolicyPage; 