import React from 'react';
import { Box, Typography } from '@mui/material';
import { ChartDataSeries, ChartTypeId } from './ChartTypes';
import BarChart from './BarChart';
import PieChart from './PieChart';
import HorizontalBarChart from './HorizontalBarChart';

interface AnalysisChartProps {
  chartTypeId: number;
  data: ChartDataSeries[];
  sortByValue: boolean;
}

/**
 * AnalysisChart component for displaying the appropriate chart based on chart type ID
 */
const AnalysisChart: React.FC<AnalysisChartProps> = ({ chartTypeId, data, sortByValue }) => {
  // If there's no data or no data series, show empty message
  if (!data || data.length === 0 || !data[0]?.data || data[0].data.length === 0) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="textSecondary">
          No data available for this question
        </Typography>
      </Box>
    );
  }
  // Select the appropriate chart based on chart type ID
  switch (chartTypeId) {
    case ChartTypeId.BarChart:
      return <BarChart data={data} sortByValue={sortByValue} height={450} />;
    
    case ChartTypeId.PieChart:
      return <PieChart data={data} sortByValue={sortByValue} />;
    
    case ChartTypeId.HorizontalBarChart:
      return <HorizontalBarChart data={data} sortByValue={sortByValue} height={450} />;
    
    default:
      return (
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="textSecondary">
            Unsupported chart type
          </Typography>
        </Box>
      );
  }
};

export default AnalysisChart; 