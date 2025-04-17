import React from 'react';
import { Box, Grid } from '@mui/material';
import FeatureCard from './FeatureCard';

interface FeatureGridProps {
  features: {
    title: string;
    description: string;
    icon: React.ReactNode;
    buttonText: string;
    buttonLink: string;
  }[];
}

/**
 * A grid layout for feature cards on the survey dashboard
 */
const FeatureGrid: React.FC<FeatureGridProps> = ({ features }) => {
  return (
    <Box>
      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={6} key={index}>
            <FeatureCard
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              buttonText={feature.buttonText}
              buttonLink={feature.buttonLink}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeatureGrid; 