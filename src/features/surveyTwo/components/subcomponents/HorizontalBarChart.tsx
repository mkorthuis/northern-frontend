import React from 'react';
import { 
  BarChart as RechartsBarChart,
  Bar,
  Cell,
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
 * HorizontalBarChart component for visualizing data as horizontal bars
 */
const HorizontalBarChart: React.FC<BaseChartProps> = ({ data, sortByValue, height = 350 }) => {
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
    
    // Calculate the maximum value for the domain
    const maxValue = Math.max(...sortedData.map(item => item.value));
    // Round up to nearest 10 for a cleaner axis
    const roundedMaxValue = Math.ceil(maxValue / 10) * 10;
    
    // Calculate dynamic height based on number of items
    // Minimum height of 350px, and each item adds 50px
    const dynamicHeight = Math.max(height, Math.min(1200, 150 + sortedData.length * 50));
    
    return (
      <ResponsiveContainer width="100%" height={dynamicHeight}>
        <RechartsBarChart 
          data={sortedData} 
          layout="vertical"
          margin={{ top: 20, right: 30, left: -50, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            domain={[0, roundedMaxValue]} 
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={140}
            tick={{ width: 135, textAnchor: 'end' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            fill={CHART_COLORS[0]} // Use first color from our updated palette
            barSize={20}
            name={data[0].name}
          >
            {sortedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Bar>
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
  
  // Calculate dynamic height based on number of categories
  // Minimum height of 350px, and each category adds 50px
  const dynamicHeight = Math.max(height, Math.min(1200, 150 + consolidatedData.length * 50));
  
  return (
    <ResponsiveContainer width="100%" height={dynamicHeight}>
      <RechartsBarChart 
        data={consolidatedData} 
        layout="vertical"
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number" 
          domain={[0, roundedMaxValue]} 
          tickFormatter={(value) => `${value}%`}
        />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={140}
          tick={{ width: 135, textAnchor: 'end' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {data.map((series, index) => (
          <Bar 
            key={series.name}
            dataKey={series.name} 
            fill={CHART_COLORS[index % CHART_COLORS.length]}
            name={series.name}
            barSize={20}
            stackId={undefined}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default HorizontalBarChart; 