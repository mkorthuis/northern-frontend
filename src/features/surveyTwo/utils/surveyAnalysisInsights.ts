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

/** START OF INSIGHTS GENERATION */


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
  // Generate insights based on whether we have filters or not
  if (insightDataGroup.hasFilters) {
    generateFilteredInsights(insightDataGroup, insights);
  } else {
    const insightData = insightDataGroup.allResponses.chartData[0].data;
    generateNonFilteredInsights(insightData, insights);
  }
  console.log(analysisQuestion);
  return insights;
}; 

/**
 * Generate filter-specific insights
 * @param insightDataGroup The data group containing filtered and unfiltered data
 * @param insights Array to add insights to
 */
const generateFilteredInsights = (
    insightDataGroup: InsightDataGroup,
    insights: string[]
  ) => {
    const insightData = insightDataGroup.filteredResponses;
    
    // Skip if no filtered data available
    if (!insightData || insightData.length === 0) {
      return;
    }
    
    // Prepare data for analysis
    const {answersByFilter, mostCommonByFilter, filterValues } = prepareFilterAnalysisData(insightData);
    
    // Add insights about most common responses across filters
    addCommonResponseInsights(mostCommonByFilter, filterValues, insights);
    
    // Add insights about biggest differences between filters
    addBiggestDifferenceInsights(answersByFilter, insights);
    
    // Add insight about whether variations are significant
    addVariationSignificanceInsight(answersByFilter, filterValues, insights);

    // Add insights about value ranges within each filter
    //addValueRangeInsights(insightData, insights);
    
    // Add insights about combined data across all filters
    //addCombinedDataInsights(insightData, insights);
  };


/**
 * Prepare data structures for filter analysis
 * @param insightData Array of filtered insight data
 * @returns Object containing analysis structures
 */
const prepareFilterAnalysisData = (insightData: InsightData[]) => {
    // Create a map structure to store answer data by filter
    // { answerName: { filterName: { value: number, percentage: number } } }
    const answersByFilter: { [key: string]: { [key: string]: { value: number, percentage: number } } } = {};
  
    // Find the most common response for each filter
    const mostCommonByFilter: { [key: string]: { answer: string, value: number } } = {};
    
    // Track total responses for each filter to calculate percentages
    const totalResponsesByFilter: { [key: string]: number } = {};
    
    // Process each filter response to collect data and calculate totals
    insightData.forEach(response => {
      if (response.chartData[0]?.data && response.filterValue) {
        // Get the data for this filter
        const data = response.chartData[0].data;
        
        // Calculate total responses for this filter
        const filterTotal = data.reduce((sum, dataPoint) => sum + dataPoint.value, 0);
        totalResponsesByFilter[response.filterValue] = filterTotal;
        
        // Sort data points by value for this filter
        const sortedData = [...data].sort((a, b) => b.value - a.value);
        
        // Record most common answer for this filter
        if (sortedData[0]) {
          mostCommonByFilter[response.filterValue] = {
            answer: sortedData[0].name,
            value: sortedData[0].value
          };
        }
        
        // Populate the answers by filter map with initial values
        data.forEach(dataPoint => {
          // Initialize answer entry if it doesn't exist
          if (!answersByFilter[dataPoint.name]) {
            answersByFilter[dataPoint.name] = {};
          }
          
          // Add filter data for this answer
          if (response.filterValue) {
            answersByFilter[dataPoint.name][response.filterValue] = {
              value: dataPoint.value,
              percentage: 0 // Will calculate after collecting all data
            };
          }
        });
      }
    });
    
    // Calculate percentages now that we have all the totals
    Object.entries(answersByFilter).forEach(([answer, filterValues]) => {
      Object.entries(filterValues).forEach(([filterName, data]) => {
        const filterTotal = totalResponsesByFilter[filterName];
        // Calculate percentage (avoid division by zero)
        if (filterTotal > 0) {
          data.percentage = Math.round((data.value / filterTotal) * 100);
        } else {
          data.percentage = 0;
        }
      });
    });
    
    return {
      answersByFilter,
      mostCommonByFilter,
      filterValues: Object.keys(mostCommonByFilter)
    };
  };
  
  /**
   * Add insights about most common responses across filters
   * @param mostCommonByFilter Map of most common answer for each filter
   * @param filterValues Array of filter value names
   * @param insights Array to add insights to
   */
  const addCommonResponseInsights = (
    mostCommonByFilter: { [key: string]: { answer: string, value: number } },
    filterValues: string[],
    insights: string[]
  ) => {
    if (filterValues.length <= 0) return;
    
    if (filterValues.length === 1) {
      // Just one filter, simple case
      const filter = filterValues[0];
      insights.push(
        `The most common response for "${filter}" is "${mostCommonByFilter[filter].answer}" with ${mostCommonByFilter[filter].value} responses`
      );
      return;
    }
    
    // Multiple filters - check if they all have the same most common answer
    const firstAnswer = mostCommonByFilter[filterValues[0]].answer;
    const allSame = filterValues.every(filter => 
      mostCommonByFilter[filter].answer === firstAnswer
    );
  
    if (allSame) {
      insights.push(
        `"${firstAnswer}" is the most common response across all filters`
      );
    } else {
      const differences = filterValues.map(filter => 
        `"${mostCommonByFilter[filter].answer}" (${mostCommonByFilter[filter].value} responses) for "${filter}"`
      );
      insights.push(
        `Most common responses differ by filter: ${differences.join('; ')}`
      );
    }
  };


  /**
   * Add insights about the biggest differences between filters for each answer
   * @param answersByFilter Map of answers with their values for each filter
   * @param insights Array to add insights to
   */
  const addBiggestDifferenceInsights = (
    answersByFilter: { [key: string]: { [key: string]: { value: number, percentage: number } } },
    insights: string[]
  ) => {
    // Find the biggest percentage difference between filters for each answer
    let maxPercentageDifference = 0;
    let maxDiffAnswer = '';
    let maxDiffFilters: string[] = [];
    let maxDiffValues: number[] = []; // Store actual percentages for reporting

    // Iterate through each answer
    Object.entries(answersByFilter).forEach(([answer, filterValues]) => {
      const filterEntries = Object.entries(filterValues);
      
      // Compare each pair of filters for this answer
      for (let i = 0; i < filterEntries.length; i++) {
        for (let j = i + 1; j < filterEntries.length; j++) {
          const [filter1, data1] = filterEntries[i];
          const [filter2, data2] = filterEntries[j];
          
          // Use percentage instead of absolute value
          const percentageDifference = Math.abs(data1.percentage - data2.percentage);
          
          if (percentageDifference > maxPercentageDifference) {
            maxPercentageDifference = percentageDifference;
            maxDiffAnswer = answer;
            maxDiffFilters = [filter1, filter2];
            maxDiffValues = [data1.percentage, data2.percentage];
          }
        }
      }
    });

    // Add insight about the biggest difference if found
    if (maxPercentageDifference > 0) {
      insights.push(
        `The answer "${maxDiffAnswer}" shows the biggest variation between filters, ` +
        `with a difference of ${maxPercentageDifference} percentage points (${maxDiffValues[0]}% vs ${maxDiffValues[1]}%) ` +
        `between "${maxDiffFilters[0]}" and "${maxDiffFilters[1]}"`
      );
    }
  };

  
  /**
   * Add insights about value ranges within each filter
   * @param insightData Array of filtered insight data
   * @param insights Array to add insights to
   */
  const addValueRangeInsights = (
    insightData: InsightData[],
    insights: string[]
  ) => {
    insightData.forEach(response => {
      if (response.chartData[0]?.data && response.filterValue) {
        const data = response.chartData[0].data;
        if (data.length >= 2) {
          // Find largest difference between most and least common
          const sortedData = [...data].sort((a, b) => b.value - a.value);
          const largestDiff = sortedData[0].value - sortedData[sortedData.length - 1].value;
          
          // Only add this insight if we have a meaningful difference
          if (largestDiff > 0) {
            insights.push(
              `For "${response.filterValue}", the difference between the most common answer "${sortedData[0].name}" (${sortedData[0].value} responses) and least common "${sortedData[sortedData.length-1].name}" (${sortedData[sortedData.length-1].value} responses) is ${largestDiff} responses`
            );
          }
          
          // Check if all answers are within 10% of each other
          const maxValue = Math.max(...data.map(d => d.value));
          const minValue = Math.min(...data.map(d => d.value));
          const threshold = maxValue * 0.1; // 10% of max value
          
          if (maxValue - minValue <= threshold && data.length > 2) {
            insights.push(
              `For "${response.filterValue}", all answers are within 10% of each other (range: ${minValue}-${maxValue} responses)`
            );
          }
        }
      }
    });
  };
  
  /**
   * Add insights about combined data across all filters
   * @param insightData Array of filtered insight data
   * @param insights Array to add insights to
   */
  const addCombinedDataInsights = (
    insightData: InsightData[],
    insights: string[]
  ) => {
    // Create a map to combine values with the same name
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
    
    // Add insight about the most common response overall
    if (combinedData.length > 0) {
      const sortedCombinedData = [...combinedData].sort((a, b) => b.value - a.value);
      const mostCommonOverall = sortedCombinedData[0];
      
      insights.push(`Most common response overall: "${mostCommonOverall.name}" (${mostCommonOverall.value} total responses)`);
      
      // If we have at least 3 data points, add insight about top 3
      if (sortedCombinedData.length >= 3) {
        const top3 = sortedCombinedData.slice(0, 3);
        const top3Text = top3.map(item => `"${item.name}" (${item.value})`).join(', ');
        insights.push(`Top 3 responses across all filters: ${top3Text}`);
      }
    }
  };

/**
 * Add insight about whether there is significant variation (>10%) between groups
 * @param answersByFilter Map of answers with their values for each filter
 * @param filterValues Array of filter value names 
 * @param insights Array to add insights to
 */
const addVariationSignificanceInsight = (
  answersByFilter: { [key: string]: { [key: string]: { value: number, percentage: number } } },
  filterValues: string[],
  insights: string[]
) => {
  // Skip if we have fewer than 2 filters
  if (filterValues.length < 2) {
    return;
  }

  // Flag to track if we found any significant variation
  let hasSignificantVariation = false;

  // For each answer, check if there's significant variation between filter groups
  Object.entries(answersByFilter).forEach(([answer, filterValues]) => {
    const filterEntries = Object.entries(filterValues);
    
    // Get all percentages for this answer across filters
    const percentages = filterEntries.map(([_, data]) => data.percentage);
    
    // If we have at least one value
    if (percentages.length > 0) {
      // Calculate the absolute percentage point difference threshold for significance (10 percentage points)
      const significanceThreshold = 10;
      
      // Compare each pair of filters for this answer
      for (let i = 0; i < filterEntries.length && !hasSignificantVariation; i++) {
        for (let j = i + 1; j < filterEntries.length && !hasSignificantVariation; j++) {
          const [filter1, data1] = filterEntries[i];
          const [filter2, data2] = filterEntries[j];
          
          // Calculate the absolute difference in percentages
          const percentageDifference = Math.abs(data1.percentage - data2.percentage);
          
          // If the difference exceeds our threshold, mark as significant
          if (percentageDifference > significanceThreshold) {
            hasSignificantVariation = true;
            console.log(`Significant variation found: Answer "${answer}" between "${filter1}" (${data1.percentage}%) and "${filter2}" (${data2.percentage}%)`);
            break;
          }
        }
      }
    }
  });

  // Add insight based on our findings
  if (!hasSignificantVariation) {
    insights.push("There is no significant variation between groups (all variations are within 10 percentage points)");
  }
};

/**
 * Generate insights for non-filtered data
 * @param insightData The chart data to analyze
 * @param insights Array to add insights to
 */
const generateNonFilteredInsights = (insightData: ChartDataPoint[], insights: string[]) => {
    if (insightData.length === 0) return;
    
    const analysis = analyzeDataPoints(insightData);
    if (!analysis) return;
    
    const { highestValue, secondHighestValue, leastCommonValue, valueDifference, rangeIsSmall } = analysis;
    
    // Add insight about most common response
    insights.push(`The most common response is "${highestValue.name}" with ${highestValue.value} responses`);
    
    // Add insight about difference between highest and second highest if available
    if (secondHighestValue) {
      insights.push(`The difference between the most common response and the second most common response is ${valueDifference}`);
    }
    
    // Add insight about least common response
    insights.push(`The least common response is "${leastCommonValue.name}" with ${leastCommonValue.value} responses`);
    
    // Add insight if values are close
    if (rangeIsSmall) {
      insights.push("The results are very close in value");
    }
  };


/**
 * Find the most common, second most common, and least common data points
 * @param dataPoints Array of chart data points to analyze
 * @returns Object containing the analysis results
 */
const analyzeDataPoints = (dataPoints: ChartDataPoint[]) => {
    if (!dataPoints || dataPoints.length === 0) {
      return null;
    }
  
    // Sort data points by value in descending order
    const sortedData = [...dataPoints].sort((a, b) => b.value - a.value);
    
    const highestValue = sortedData[0];
    const secondHighestValue = sortedData.length > 1 ? sortedData[1] : null;
    const leastCommonValue = sortedData[sortedData.length - 1];
    
    const valueDifference = secondHighestValue 
      ? highestValue.value - secondHighestValue.value 
      : 0;
    
    const rangeIsSmall = (highestValue.value - leastCommonValue.value) < 10;
  
    return {
      highestValue,
      secondHighestValue,
      leastCommonValue,
      valueDifference,
      rangeIsSmall
    };
  };

/** 
 * Groups analysis questions by their topics and sorts them by order_index within each group
 * @param analysisQuestions Array of survey analysis questions to organize
 * @returns Object containing grouped and sorted questions
 */
export interface TopicQuestionsGroup {
  topicName: string;
  questions: SurveyAnalysisQuestion[];
}

export const groupAndSortQuestionsByTopic = (
  analysisQuestions: SurveyAnalysisQuestion[] | undefined
): TopicQuestionsGroup[] => {
  if (!analysisQuestions || analysisQuestions.length === 0) {
    return [];
  }

  // Create a map to group questions by topic
  const topicGroups = new Map<string, TopicQuestionsGroup>();
  
  // Special group for questions without topics
  const noTopicGroup: TopicQuestionsGroup = {
    topicName: 'Other Questions',
    questions: []
  };

  // Process each question
  analysisQuestions.forEach(question => {
    if (!question.topics || question.topics.length === 0) {
      // Add to the "no topic" group
      noTopicGroup.questions.push(question);
    } else {
      // Add to each of its topic groups
      question.topics.forEach(topic => {
        if (!topic.id) return;
        
        const topicId = topic.id;
        if (!topicGroups.has(topicId)) {
          topicGroups.set(topicId, {
            topicName: topic.name,
            questions: []
          });
        }
        
        topicGroups.get(topicId)?.questions.push(question);
      });
    }
  });

  // Sort questions within each group by order_index
  const sortQuestionsByOrderIndex = (questions: SurveyAnalysisQuestion[]): SurveyAnalysisQuestion[] => {
    return [...questions].sort((a, b) => {
      const orderA = a.question?.order_index ?? 0;
      const orderB = b.question?.order_index ?? 0;
      return orderA - orderB;
    });
  };

  // Apply sorting to each group
  noTopicGroup.questions = sortQuestionsByOrderIndex(noTopicGroup.questions);
  for (const group of topicGroups.values()) {
    group.questions = sortQuestionsByOrderIndex(group.questions);
  }

  // Convert map to array and sort groups alphabetically by topic name
  const result: TopicQuestionsGroup[] = Array.from(topicGroups.values())
    .sort((a, b) => a.topicName.localeCompare(b.topicName));
  
  // Add the "no topic" group at the end if it has any questions
  if (noTopicGroup.questions.length > 0) {
    result.push(noTopicGroup);
  }

  return result;
};