import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import CheckIcon from '@mui/icons-material/Check';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const currentLanguage = i18n.language || localStorage.getItem('language') || 'en';

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
    handleMenuClose();
  };

  return (
    <>
      <Tooltip title={t('language.switchLanguage') || 'Switch Language'}>
        <IconButton
          color="inherit"
          aria-label="change language"
          onClick={handleMenuOpen}
          size="medium"
          sx={{ mx: 1 }}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { width: 160, maxWidth: '100%' }
        }}
      >
        <MenuItem 
          onClick={() => changeLanguage('en')}
          selected={currentLanguage === 'en'}
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            py: 1 
          }}
        >
          <Typography variant="body1">
            English
          </Typography>
          {currentLanguage === 'en' && <CheckIcon fontSize="small" color="primary" />}
        </MenuItem>
        <MenuItem 
          onClick={() => changeLanguage('zh')}
          selected={currentLanguage === 'zh'}
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            py: 1 
          }}
        >
          <Typography variant="body1">
            中文
          </Typography>
          {currentLanguage === 'zh' && <CheckIcon fontSize="small" color="primary" />}
        </MenuItem>
      </Menu>
    </>
  );
};

export default LanguageSwitcher; 