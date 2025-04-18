import { SurveyAnalysisQuestion } from '@/store/slices/surveyAnalysisSlice';
import { ChartDataSeries, ChartDataPoint } from '../components/subcomponents/ChartTypes';

// Interface for insight data
export interface InsightData {
  surveyQuestion: any;
  surveyResponses: any[]; // Array of answers to the specific question
  chartData: ChartDataSeries[];
  questionType?: string;
  responseCount: number;
  uniqueValues: number;
  filterName?: string; // Name of the filter applied to this data set
  filterValue?: string; // Value of the filter applied to this data set
}

// Interface for a group of insight data objects
export interface InsightDataGroup {
  allResponses: InsightData; // Insight data for all responses without filtering
  filteredResponses: InsightData[]; // Array of insight data for each filter value
  hasFilters: boolean; // Whether filters are applied
}

/**
 * Helper function to create a data series from a Map of counts
 * @param name Name for the data series
 * @param valueCountMap Map of values and their counts
 * @returns ChartDataSeries object
 */
export const createDataSeries = (name: string, valueCountMap: Map<string, number>): ChartDataSeries => {
  return {
    name,
    data: Array.from(valueCountMap.entries()).map(([name, value]) => ({
      name,
      value
    }))
  };
};

/**
 * Helper function to process an answer and update the count map
 * @param answer Survey answer to process
 * @param valueCountMap Map of values and their counts to update
 */
export const processAnswer = (answer: any, valueCountMap: Map<string, number>) => {
  if (answer.value) {
    // Handle single value answers
    const value = answer.value;
    valueCountMap.set(value, (valueCountMap.get(value) || 0) + 1);
  } else if (answer.selected_options) {
    // Handle multiple choice answers
    Object.keys(answer.selected_options).forEach(optionId => {
      valueCountMap.set(optionId, (valueCountMap.get(optionId) || 0) + 1);
    });
  }
};

/**
 * Helper function to process survey responses without filtering
 * @param paginatedResponses The survey responses to process
 * @param questionId ID of the question to process
 * @returns Array with a single data series containing all responses
 */
export const processAllResponses = (paginatedResponses: any, questionId: string): ChartDataSeries[] => {
  const valueCountMap = new Map<string, number>();
  
  paginatedResponses?.items?.forEach((response: any) => {
    const answer = response.answers?.find((a: any) => a.question_id === questionId);
    if (answer) {
      processAnswer(answer, valueCountMap);
    }
  });
  
  return [createDataSeries('All Responses', valueCountMap)];
};

/**
 * Process survey responses for visualization
 * @param paginatedResponses The survey responses data
 * @param currentAnalysis The current analysis configuration
 * @param questionId ID of the question to visualize
 * @returns Array of data series for chart visualization
 */
export const getQuestionData = (
  paginatedResponses: any,
  currentAnalysis: any,
  questionId: string
): ChartDataSeries[] => {
  if (!paginatedResponses?.items) return [];

  // Get filters from the current analysis
  const filters = currentAnalysis?.filters || [];
  
  // If no filters, just process all responses
  if (filters.length === 0) {
    return processAllResponses(paginatedResponses, questionId);
  }
  
  // Get the first filter
  const firstFilter = filters[0]; 
  
  // If the filter has no criteria, process all responses
  if (!firstFilter.criteria || firstFilter.criteria.length === 0) {
    return processAllResponses(paginatedResponses, questionId);
  }
  
  // Get the filter question ID
  const filterQuestionId = firstFilter.survey_analysis_question_id;
  
  // Find the corresponding analysis question to get the base question ID
  const filterAnalysisQuestion = currentAnalysis?.analysis_questions?.find(
    (q: any) => q.id === filterQuestionId
  );
  
  if (!filterAnalysisQuestion) {
    // If we can't find the filter question, fall back to all responses
    return processAllResponses(paginatedResponses, questionId);
  }
  
  const filterBaseQuestionId = filterAnalysisQuestion.question_id;
  
  // Create a data series for each filter value
  return firstFilter.criteria.map((criterion: any) => {
    const filterValue = criterion.value;
    
    // Filter responses based on this filter value
    const filteredResponses = paginatedResponses?.items?.filter((response: any) => {
      const filterAnswer = response.answers?.find((a: any) => a.question_id === filterBaseQuestionId);
      
      if (!filterAnswer) return false;
      
      // Check if the answer matches the filter value
      if (filterAnswer.value) {
        return filterAnswer.value === filterValue;
      } else if (filterAnswer.selected_options) {
        // For multiple choice questions, check if the filter value is in the selected options
        return Object.prototype.hasOwnProperty.call(filterAnswer.selected_options, filterValue);
      }
      
      return false;
    }) || [];
    
    // Process the filtered responses
    const seriesValueCountMap = new Map<string, number>();
    
    filteredResponses.forEach((response: any) => {
      const answer = response.answers?.find((a: any) => a.question_id === questionId);
      if (answer) {
        processAnswer(answer, seriesValueCountMap);
      }
    });
    
    return createDataSeries(filterValue, seriesValueCountMap);
  });
};

/**
 * Fetch comprehensive data for generating insights
 * @param analysisQuestion The analysis question to fetch data for
 * @param paginatedResponses The survey responses data
 * @param currentAnalysis The current analysis configuration
 * @returns Object containing insight data for all responses and each filter value
 */
export const fetchInsightData = (
  analysisQuestion: any,
  paginatedResponses: any,
  currentAnalysis: any
): InsightDataGroup => {
  // Get the original survey question
  const surveyQuestion = analysisQuestion.question;
  const questionId = analysisQuestion.question_id;
  
  // Get question type
  const questionType = surveyQuestion?.type?.name || 'Unknown';
  
  // Get chart data for visualization
  const chartData = getQuestionData(paginatedResponses, currentAnalysis, questionId);
  
  // Get filters from the current analysis
  const filters = currentAnalysis?.filters || [];
  const hasFilters = filters.length > 0 && filters[0].criteria?.length > 0;
  
  // Initialize result object
  const result: InsightDataGroup = {
    allResponses: {} as InsightData,
    filteredResponses: [],
    hasFilters
  };
  
  // Process all responses (unfiltered)
  const allAnswers = paginatedResponses?.items
    ?.map((response: any) => response.answers?.find((a: any) => a.question_id === questionId))
    .filter((answer: any) => answer !== undefined) || [];
  
  // Count unique values in all data
  const allUniqueValues = new Set();
  allAnswers.forEach((answer: any) => {
    if (answer && answer.value) {
      allUniqueValues.add(answer.value);
    } else if (answer && answer.selected_options) {
      Object.keys(answer.selected_options).forEach(option => allUniqueValues.add(option));
    }
  });
  
  // Create insight data for all responses
  result.allResponses = {
    surveyQuestion,
    surveyResponses: allAnswers,
    chartData: processAllResponses(paginatedResponses, questionId),
    questionType,
    responseCount: allAnswers.length,
    uniqueValues: allUniqueValues.size
  };
  
  // If we have filters, process each filter value
  if (hasFilters) {
    const firstFilter = filters[0];
    const filterQuestionId = firstFilter.survey_analysis_question_id;
    
    // Find the filter analysis question to get information about it
    const filterAnalysisQuestion = currentAnalysis?.analysis_questions?.find(
      (q: any) => q.id === filterQuestionId
    );
    
    if (filterAnalysisQuestion) {
      const filterBaseQuestionId = filterAnalysisQuestion.question_id;
      const filterName = filterAnalysisQuestion.question.title || 'Filter';
      
      // Process each filter criterion
      result.filteredResponses = firstFilter.criteria.map((criterion: any) => {
        const filterValue = criterion.value;
        
        // Filter responses based on this filter value
        const filteredResponses = paginatedResponses?.items?.filter((response: any) => {
          const filterAnswer = response.answers?.find((a: any) => a.question_id === filterBaseQuestionId);
          
          if (!filterAnswer) return false;
          
          // Check if the answer matches the filter value
          if (filterAnswer.value) {
            return filterAnswer.value === filterValue;
          } else if (filterAnswer.selected_options) {
            // For multiple choice questions, check if the filter value is in the selected options
            return Object.prototype.hasOwnProperty.call(filterAnswer.selected_options, filterValue);
          }
          
          return false;
        }) || [];
        
        // Extract just the answers for our question from these filtered responses
        const filteredAnswers = filteredResponses
          .map((response: any) => response.answers?.find((a: any) => a.question_id === questionId))
          .filter((answer: any) => answer !== undefined);
        
        // Create value count map for this filter value
        const valueCountMap = new Map<string, number>();
        filteredAnswers.forEach((answer: any) => {
          if (answer) {
            processAnswer(answer, valueCountMap);
          }
        });
        
        // Count unique values for this filter
        const uniqueValues = valueCountMap.size;
        
        // Find display name for filter value (might be an ID that needs to be mapped)
        let displayFilterValue = filterValue;
        
        // Try to get the actual option text if this is a multi-choice question
        const filterQuestion = filterAnalysisQuestion.question;
        if (filterQuestion && filterQuestion.options) {
          const option = filterQuestion.options.find((opt: any) => opt.id === filterValue);
          if (option) {
            displayFilterValue = option.text || option.title || filterValue;
          }
        }
        
        // Return insight data for this filter value
        return {
          surveyQuestion,
          surveyResponses: filteredAnswers,
          chartData: [createDataSeries(displayFilterValue, valueCountMap)],
          questionType,
          responseCount: filteredAnswers.length,
          uniqueValues,
          filterName,
          filterValue: displayFilterValue
        };
      });
    }
  }
  
  return result;
};

/**
 * Generate insights for a question based on its properties
 * @param analysisQuestion The analysis question to generate insights for
 * @param paginatedResponses The survey responses data
 * @param currentAnalysis The current analysis configuration
 * @returns Array of insight strings to be displayed as bullets
 */
export const getInsights = (
  analysisQuestion: SurveyAnalysisQuestion,
  paginatedResponses: any,
  currentAnalysis: any
): string[] => {
  const insights: string[] = [];
  
  // Fetch detailed data for insights
  const insightDataGroup = fetchInsightData(analysisQuestion, paginatedResponses, currentAnalysis);

  if (insightDataGroup.hasFilters) {
    const insightData = insightDataGroup.filteredResponses;
    // Create a new combined data array that is the sum of all the values in chartData[0].data from each filtered response.
    // First, create a map to track combined values by name
    const combinedMap = new Map<string, number>();
    
    // Iterate through all filtered responses and aggregate values by name
    insightData.forEach(response => {
      if (response.chartData[0] && response.chartData[0].data) {
        response.chartData[0].data.forEach(dataPoint => {
          const currentValue = combinedMap.get(dataPoint.name) || 0;
          combinedMap.set(dataPoint.name, currentValue + dataPoint.value);
        });
      }
    });
    
    // Convert the map to an array of ChartDataPoints
    const combinedData: ChartDataPoint[] = Array.from(combinedMap.entries())
      .map(([name, value]) => ({ name, value }));
    
    // 1. Identify the most common response from each filteredResponse
    const mostCommonByFilter: Array<{filterName: string, filterValue: string, mostCommonResponse: ChartDataPoint}> = [];
    
    insightData.forEach(filterResponse => {
      if (filterResponse.chartData[0] && filterResponse.chartData[0].data && filterResponse.chartData[0].data.length > 0) {
        // Sort data to find the most common response for this filter
        const sortedData = [...filterResponse.chartData[0].data].sort((a, b) => b.value - a.value);
        const mostCommon = sortedData[0];
        
        mostCommonByFilter.push({
          filterName: filterResponse.filterName || 'Filter',
          filterValue: filterResponse.filterValue || 'Unknown',
          mostCommonResponse: mostCommon
        });
      }
    });
    
    // 2 & 3. Compare the most common responses and add appropriate insights
    if (mostCommonByFilter.length > 0) {
      // Check if all filters have the same most common response
      const firstMostCommonName = mostCommonByFilter[0].mostCommonResponse.name;
      const allSameMostCommon = mostCommonByFilter.every(item => 
        item.mostCommonResponse.name === firstMostCommonName
      );
      
      if (allSameMostCommon) {
        // If they are the same name, push a single insight
        insights.push(`The most common response across all filters is "${firstMostCommonName}"`);
      } else {
        // If they are different, push an insight for each filter
        mostCommonByFilter.forEach(item => {
          insights.push(
            `The most common response for "${item.filterValue}" is ` + 
            `"${item.mostCommonResponse.name}" (${item.mostCommonResponse.value} responses)`
          );
        });
      }
    }
    
    // Identify the most common response across all filters (combined data)
    if (combinedData.length > 0) {
      const sortedCombinedData = [...combinedData].sort((a, b) => b.value - a.value);
      const mostCommonOverall = sortedCombinedData[0];
      
      insights.push(`Most common response overall: "${mostCommonOverall.name}" (${mostCommonOverall.value} total responses)`);
    }
  } else {
    const insightData = insightDataGroup.allResponses.chartData[0].data;
    if (insightData.length > 0) {
      // Keep this conditional logic for sorting by value.  It will be used later to display different insights.
      if(analysisQuestion.sort_by_value) {
        //looking at allResponses.chartData[0].data.  Identify the highest value. Push the name and value of that data point to the insights array.
        const highestValue = insightData.reduce((max, current) => {
          return current.value > max.value ? current : max;
        }, insightData[0]);
        
        insights.push(`The most common response is "${highestValue.name}" with ${highestValue.value} responses`);
        
        //Compare the highest value to the next highest value.  Deliver a message about how close the values are.
        if (insightData.length > 1) {
          // Sort data points by value in descending order to find the second highest
          const sortedData = [...insightData].sort((a, b) => b.value - a.value);
          const secondHighestValue = sortedData[1]; // Second element is the second highest
          const valueDifference = highestValue.value - secondHighestValue.value;
          
          insights.push(`The difference between the most common response and the second most common response is ${valueDifference}`);
        }

        //Identify the least common value.  Push the name and value of that data point to the insights array.
        const leastCommonValue = insightData.reduce((min, current) => {
          return current.value < min.value ? current : min;
        }, insightData[0]);
        
        insights.push(`The least common response is "${leastCommonValue.name}" with ${leastCommonValue.value} responses`);
        
        //If the first and last results are close in value, include an additional insight about that.
        if(highestValue.value - leastCommonValue.value < 10) {
          insights.push("The results are very close in value");
        }
      } else {
        //looking at allResponses.chartData[0].data.  Identify the highest value. Push the name and value of that data point to the insights array.
        const highestValue = insightData.reduce((max, current) => {
          return current.value > max.value ? current : max;
        }, insightData[0]);
        
        insights.push(`The most common response is "${highestValue.name}" with ${highestValue.value} responses`);
        
        //Compare the highest value to the next highest value.  Deliver a message about how close the values are.
        if (insightData.length > 1) {
          // Sort data points by value in descending order to find the second highest
          const sortedData = [...insightData].sort((a, b) => b.value - a.value);
          const secondHighestValue = sortedData[1]; // Second element is the second highest
          const valueDifference = highestValue.value - secondHighestValue.value;
          
          insights.push(`The difference between the most common response and the second most common response is ${valueDifference}`);
        }

        //Identify the least common value.  Push the name and value of that data point to the insights array.
        const leastCommonValue = insightData.reduce((min, current) => {
          return current.value < min.value ? current : min;
        }, insightData[0]);
        
        insights.push(`The least common response is "${leastCommonValue.name}" with ${leastCommonValue.value} responses`);
        
        //If the first and last results are close in value, include an additional insight about that.
        if(highestValue.value - leastCommonValue.value < 10) {
          insights.push("The results are very close in value");
        }
      }
    }
  }

  const insightData = insightDataGroup.hasFilters && insightDataGroup.filteredResponses.length > 0 
    ? insightDataGroup.filteredResponses[0] // Use the first filtered data if filters are applied
    : insightDataGroup.allResponses; // Otherwise use all responses
  
  // Add insight about sort order
  if (analysisQuestion.sort_by_value) {
    insights.push("Results are sorted by value (highest to lowest)");
  } else {
    insights.push("Results are displayed in original order (not sorted by value)");
  }
  
  // Add insight about chart type
  switch(analysisQuestion.chart_type_id) {
    case 1:
      insights.push("Vertical bar chart is used for easy comparison of values");
      break;
    case 2:
      insights.push("Pie chart is used to show proportion of each value to the whole");
      break;
    case 3:
      insights.push("Horizontal bar chart is used for better readability with many categories");
      break;
    default:
      insights.push("Custom chart type is being used");
  }
  
  // Add insight about response data
  insights.push(`This question received ${insightData.responseCount} responses with ${insightData.uniqueValues} unique values`);
  
  // Add insight about question type if available
  if (insightData.questionType && insightData.questionType !== 'Unknown') {
    insights.push(`Question type: ${insightData.questionType}`);
  }
  
  // If filters are applied, add information about the filter
  if (insightDataGroup.hasFilters && insightData.filterName && insightData.filterValue) {
    insights.push(`Filtered by ${insightData.filterName}: "${insightData.filterValue}"`);
    
    // Add comparison with all responses if significant difference
    const allResponsesCount = insightDataGroup.allResponses.responseCount;
    const percentOfTotal = Math.round((insightData.responseCount / allResponsesCount) * 100);
    insights.push(`This filter represents ${percentOfTotal}% of all responses (${insightData.responseCount} out of ${allResponsesCount})`);
  }
  
  // Add information about the most common response if available
  if (insightData.chartData.length > 0 && insightData.chartData[0].data.length > 0) {
    // Find the most common response across all series
    const allDataPoints = insightData.chartData.flatMap(series => series.data);
    if (allDataPoints.length > 0) {
      const sortedByFrequency = [...allDataPoints].sort((a, b) => b.value - a.value);
      const mostCommon = sortedByFrequency[0];
      if (mostCommon) {
        insights.push(`Most common response: "${mostCommon.name}" (${mostCommon.value} responses)`);
      }
    }
  }
  
  return insights;
}; 