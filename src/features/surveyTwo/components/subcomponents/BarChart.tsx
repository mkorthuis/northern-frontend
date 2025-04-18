import React from 'react';
import { 
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { Box, Typography } from '@mui/material';
import { BaseChartProps, getSortedData, getConsolidatedData } from './ChartTypes';
import { CHART_COLORS } from './ChartColors';

// Custom tooltip component to display percentage values
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                backgroundColor: entry.color,
                mr: 1
              }}
            />
            <Typography variant="body2">
              {entry.name}: {entry.value !== undefined ? entry.value.toFixed(1) : '0.0'}%
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

/**
 * BarChart component for visualizing data as vertical bars
 */
const BarChart: React.FC<BaseChartProps> = ({ data, sortByValue, height = 350 }) => {
  // If there's no data or no data series, show empty message
  if (!data || data.length === 0 || !data[0].data || data[0].data.length === 0) {
    return (
      <Box sx={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="textSecondary">
          No data available for this question
        </Typography>
      </Box>
    );
  }

  // Handle single data series
  if (data.length === 1) {
    const sortedData = getSortedData(data[0].data, sortByValue);
    
    // Calculate the maximum value for the domain
    const maxValue = Math.max(...sortedData.map(item => item.value));
    // Round up to nearest 10 for a cleaner axis
    const roundedMaxValue = Math.ceil(maxValue / 10) * 10;
    
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
          <YAxis 
            domain={[0, roundedMaxValue]} 
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill={CHART_COLORS[0]} name={data[0].name} />
        </RechartsBarChart>
      </ResponsiveContainer>
    );
  }
  
  // Handle multiple data series
  const consolidatedData = getConsolidatedData(data, sortByValue);
  
  // Calculate the maximum value across all series
  let maxValue = 0;
  data.forEach(series => {
    series.data.forEach(item => {
      if (item.value > maxValue) {
        maxValue = item.value;
      }
    });
  });
  // Round up to nearest 10 for a cleaner axis
  const roundedMaxValue = Math.ceil(maxValue / 10) * 10;
  
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
        <YAxis 
          domain={[0, roundedMaxValue]} 
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend layout="horizontal" verticalAlign="top" align="center" height={56} />
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