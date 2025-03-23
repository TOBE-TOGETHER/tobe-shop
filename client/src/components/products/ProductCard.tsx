import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';

// Product interface to be shared across components
export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  status?: string;
  shopId?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { t } = useTranslation();

  return (
    <Card 
      sx={{ 
        height: '380px', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 4,
        },
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <CardActionArea 
        component={RouterLink} 
        to={`/products/${product.id}`}
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          alignItems: 'stretch'
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            image={product.image}
            alt={product.name}
            sx={{ 
              height: '200px',
              width: '100%',
              objectFit: 'cover'
            }}
          />
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            <Chip 
              label={t(`product.categories.${product.category}`, product.category)}
              size="small"
              color="primary"
              sx={{ bgcolor: 'rgba(25, 118, 210, 0.8)', color: 'white' }}
            />
          </Box>
        </Box>
        
        <CardContent sx={{ flexGrow: 1, p: 2, pb: 3 }}>
          <Typography 
            variant="h6" 
            component="div" 
            noWrap 
            sx={{ mb: 1 }}
          >
            {product.name}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              height: '42px',
              mb: 2
            }}
          >
            {product.description}
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#00c853', 
              fontWeight: 'bold',
              mt: 'auto'
            }}
          >
            ${product.price.toFixed(2)}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProductCard; 