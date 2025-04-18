// Export all chart components
export { default as BarChart } from './BarChart';
export { default as PieChart } from './PieChart';
export { default as HorizontalBarChart } from './HorizontalBarChart';
export { default as AnalysisChart } from './AnalysisChart';
export { CHART_COLORS } from './ChartColors';
export * from './ChartTypes';

// Export an object that maps chart type IDs to chart components for easier use
import { ChartTypeId } from './ChartTypes';
import BarChart from './BarChart';
import PieChart from './PieChart';
import HorizontalBarChart from './HorizontalBarChart';

/**
 * Function to get the chart component based on chart type ID
 * @param chartTypeId The chart type ID
 * @returns The corresponding chart component
 */
export const getChartComponent = (chartTypeId: number) => {
  switch (chartTypeId) {
    case ChartTypeId.BarChart:
      return BarChart;
    case ChartTypeId.PieChart:
      return PieChart;
    case ChartTypeId.HorizontalBarChart:
      return HorizontalBarChart;
    default:
      return null;
  }
}; 