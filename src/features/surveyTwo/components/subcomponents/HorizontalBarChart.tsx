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
  ResponsiveContainer
} from 'recharts';
import { Box, Typography } from '@mui/material';
import { BaseChartProps, getSortedData, getConsolidatedData } from './ChartTypes';
import { CHART_COLORS } from './ChartColors';

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
    
    // Calculate dynamic height based on number of items
    // Minimum height of 350px, and each item adds 50px
    const dynamicHeight = Math.max(height, Math.min(1200, 150 + sortedData.length * 50));
    
    return (
      <ResponsiveContainer width="100%" height={dynamicHeight}>
        <RechartsBarChart 
          data={sortedData} 
          layout="vertical"
          margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={140}
            tick={{ width: 135, textAnchor: 'end' }}
          />
          <Tooltip />
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
  
  // Calculate dynamic height based on number of categories
  // Minimum height of 350px, and each category adds 50px
  const dynamicHeight = Math.max(height, Math.min(1200, 150 + consolidatedData.length * 50));
  
  return (
    <ResponsiveContainer width="100%" height={dynamicHeight}>
      <RechartsBarChart 
        data={consolidatedData} 
        layout="vertical"
        margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={140}
          tick={{ width: 135, textAnchor: 'end' }}
        />
        <Tooltip />
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