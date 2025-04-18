import React from 'react';
import { 
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Box, Typography } from '@mui/material';
import { BaseChartProps, getSortedData } from './ChartTypes';
import { CHART_COLORS } from './ChartColors';

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
            label={(entry) => {
              // Truncate long labels to prevent overcrowding
              const name = typeof entry.name === 'string' ? entry.name : String(entry.name);
              return name.length > 20 ? name.substring(0, 17) + '...' : name;
            }}
          >
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{ overflowY: 'auto', maxHeight: 100 }} />
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
                    label={(entry) => {
                      // Truncate long labels
                      const name = typeof entry.name === 'string' ? entry.name : String(entry.name);
                      return name.length > 15 ? name.substring(0, 12) + '...' : name;
                    }}
                  >
                    {seriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
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