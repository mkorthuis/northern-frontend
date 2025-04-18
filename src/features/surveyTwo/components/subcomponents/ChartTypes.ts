// Shared types and interfaces for chart components

/**
 * Represents a data point for visualization
 */
export interface ChartDataPoint {
  name: string;
  value: number;
}

/**
 * Represents a data series with a name and array of data points
 */
export interface ChartDataSeries {
  name: string;
  data: ChartDataPoint[];
}

/**
 * Base props shared across all chart components
 */
export interface BaseChartProps {
  data: ChartDataSeries[];
  sortByValue: boolean;
  height?: number;
}

/**
 * Chart type IDs used in the application
 */
export enum ChartTypeId {
  BarChart = 1,
  PieChart = 2,
  HorizontalBarChart = 3
}

/**
 * Returns a sorted or unsorted copy of the data based on the sortByValue parameter
 * @param data Data to be sorted
 * @param sortByValue Whether to sort by value
 * @returns Sorted or original data
 */
export const getSortedData = (data: ChartDataPoint[], sortByValue: boolean): ChartDataPoint[] => {
  return sortByValue && data.length > 1
    ? [...data].sort((a, b) => b.value - a.value)
    : data;
};

/**
 * Creates a consolidated data structure for multiple data series
 * @param dataSeries Array of chart data series
 * @param sortByValue Whether to sort by total value
 * @returns Consolidated data structure for recharts
 */
export const getConsolidatedData = (dataSeries: ChartDataSeries[], sortByValue: boolean): any[] => {
  // Find all unique categories across all series
  const allCategories = new Set<string>();
  dataSeries.forEach(series => {
    series.data.forEach(item => {
      allCategories.add(item.name);
    });
  });
  
  // Create a consolidated data structure for charts
  const consolidatedData = Array.from(allCategories).map(category => {
    const item: any = { name: category };
    dataSeries.forEach(series => {
      const match = series.data.find(d => d.name === category);
      item[series.name] = match ? match.value : 0;
    });
    return item;
  });
  
  // Sort the consolidated data if needed
  if (sortByValue) {
    return [...consolidatedData].sort((a, b) => {
      // Calculate total values for each category
      const totalA = dataSeries.reduce((sum, series) => {
        const match = series.data.find(d => d.name === a.name);
        return sum + (match ? match.value : 0);
      }, 0);
      const totalB = dataSeries.reduce((sum, series) => {
        const match = series.data.find(d => d.name === b.name);
        return sum + (match ? match.value : 0);
      }, 0);
      return totalB - totalA;
    });
  }
  
  return consolidatedData;
}; 