import React from 'react';
import { Typography, Box } from '@mui/material';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

/**
 * The header component for the survey dashboard
 */
const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle }) => {
  return (
    <Box textAlign="center" mb={6}>
      <Typography 
        variant="h2" 
        component="h1" 
        gutterBottom
        sx={{ 
          fontWeight: 700,
          color: '#333',
          mb: 2
        }}
      >
        {title}
      </Typography>
      <Typography 
        variant="h5" 
        color="textSecondary"
        sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
};

export default DashboardHeader; 