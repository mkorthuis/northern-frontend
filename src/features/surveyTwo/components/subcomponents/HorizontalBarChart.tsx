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
    
    return (
      <ResponsiveContainer width="100%" height={height}>
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
            fill="#8884d8"
            barSize={20}
            name={data[0].name}
          >
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    );
  }
  
  // Handle multiple data series
  const consolidatedData = getConsolidatedData(data, sortByValue);
  
  return (
    <ResponsiveContainer width="100%" height={height}>
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
            stackId={consolidatedData.length > 5 ? "stack" : undefined}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default HorizontalBarChart; 