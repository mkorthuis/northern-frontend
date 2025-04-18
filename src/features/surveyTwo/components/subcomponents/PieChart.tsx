import React from 'react';
import { 
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { Box, Typography } from '@mui/material';
import { BaseChartProps, getSortedData } from './ChartTypes';
import { CHART_COLORS } from './ChartColors';

// Custom tooltip component to display percentage values
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
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
          {payload[0]?.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              backgroundColor: payload[0]?.color,
              mr: 1
            }}
          />
          <Typography variant="body2">
            {payload[0]?.value !== undefined ? payload[0]?.value.toFixed(1) : '0.0'}%
          </Typography>
        </Box>
      </Box>
    );
  }
  return null;
};

/**
 * PieChart component for visualizing data as pie segments
 */
const PieChart: React.FC<BaseChartProps> = ({ data, sortByValue, height = 350 }) => {
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

  // Custom label formatter for pie slices
  const renderCustomizedLabel = (entry: any) => {
    // Don't show labels for very small slices (less than 5%)
    if (entry.value < 5) return null;
    
    // Truncate long labels to prevent overcrowding
    const name = typeof entry.name === 'string' ? entry.name : String(entry.name);
    const displayName = name.length > 20 ? name.substring(0, 17) + '...' : name;
    
    return `${displayName}: ${entry.value.toFixed(1)}%`;
  };

  // Handle single data series
  if (data.length === 1) {
    const sortedData = getSortedData(data[0].data, sortByValue);
    
    return (
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <Pie
            data={sortedData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill={CHART_COLORS[0]}
            label={renderCustomizedLabel}
            labelLine={true}
          >
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ overflowY: 'auto', maxHeight: 100 }} formatter={(value, entry) => `${value}`} />
        </RechartsPieChart>
      </ResponsiveContainer>
    );
  }
  
  // Handle multiple data series - display multiple pie charts
  return (
    <Box>
      <Typography variant="subtitle1" align="center" sx={{ mb: 2 }}>
        Comparison by Filter Values
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
        {data.map((series, seriesIndex) => {
          // Sort data if needed
          const seriesData = getSortedData(series.data, sortByValue);
          
          return (
            <Box key={series.name} sx={{ width: '45%', minWidth: '300px', mb: 3 }}>
              <Typography variant="subtitle2" align="center" gutterBottom>
                {series.name}
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Pie
                    data={seriesData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill={CHART_COLORS[0]}
                    label={renderCustomizedLabel}
                    labelLine={true}
                  >
                    {seriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </Box>
          );
        })}
      </Box>
      <Legend wrapperStyle={{ overflowY: 'auto', maxHeight: 60, marginTop: 10 }} />
    </Box>
  );
};

export default PieChart; 