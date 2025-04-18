import React from 'react';
import { 
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Box, Typography } from '@mui/material';
import { BaseChartProps, getSortedData, getConsolidatedData } from './ChartTypes';
import { CHART_COLORS } from './ChartColors';

/**
 * BarChart component for visualizing data as vertical bars
 */
const BarChart: React.FC<BaseChartProps> = ({ data, sortByValue, height = 350 }) => {
  // If there's no data or no data series, show empty message
  if (!data || data.length === 0 || !data[0].data || data[0].data.length === 0) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="textSecondary">
          No data available for this question
        </Typography>
      </Box>
    );
  }

  // Handle single data series
  if (data.length === 1) {
    const sortedData = getSortedData(data[0].data, sortByValue);
    
    return (
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            height={80}
            angle={-45}
            textAnchor="end"
            interval={0}
          />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" name={data[0].name} />
        </RechartsBarChart>
      </ResponsiveContainer>
    );
  }
  
  // Handle multiple data series
  const consolidatedData = getConsolidatedData(data, sortByValue);
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={consolidatedData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          height={80}
          angle={-45}
          textAnchor="end"
          interval={0}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        {data.map((series, index) => (
          <Bar 
            key={series.name}
            dataKey={series.name} 
            fill={CHART_COLORS[index % CHART_COLORS.length]}
            name={series.name}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart; 