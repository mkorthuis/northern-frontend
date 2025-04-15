import React from 'react';
import { 
  Typography, Card, CardContent, CardActions, Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import { SvgIconComponent } from '@mui/icons-material';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  buttonLink: string;
}

/**
 * A card component displaying a feature with an icon, description, and action button
 */
const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon, 
  buttonText, 
  buttonLink 
}) => {
  return (
    <Card 
      sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: 3,
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
        {icon}
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          to={buttonLink}
          size="large"
        >
          {buttonText}
        </Button>
      </CardActions>
    </Card>
  );
};

export default FeatureCard; 