import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Survey, 
  fetchPaginatedSurveyResponses, 
  selectPaginatedResponses,
  selectPaginatedResponsesLoading,
  SurveyResponse,
  LoadingState
} from '@/store/slices/surveySlice';
import { AppDispatch } from '@/store/store';

interface SurveyResultsProps {
  survey: Survey;
  loading?: boolean;
}

const SurveyResults: React.FC<SurveyResultsProps> = ({ survey }) => {
  const dispatch = useDispatch<AppDispatch>();
  const paginatedResponses = useSelector(selectPaginatedResponses);
  const loadingState = useSelector(selectPaginatedResponsesLoading);

  useEffect(() => {
    if (survey?.id) {
      dispatch(fetchPaginatedSurveyResponses({ 
        surveyId: survey.id, 
        options: { completed_only: true, page: 1, page_size: 50 } 
      }));
    }
  }, [survey?.id, dispatch]);

  // Calculate survey statistics
  const calculateStats = () => {
    if (!paginatedResponses) {
      return {
        totalResponses: 0,
        completionRate: 0,
        averageTimeToComplete: '0 minutes'
      };
    }

    const totalResponses = paginatedResponses.total;
    const completedResponses = paginatedResponses.items.filter(r => r.is_complete).length;
    const completionRate = Math.round((completedResponses / paginatedResponses.items.length) * 100);

    // Calculate average completion time for the current page
    const completionTimes = paginatedResponses.items
      .filter(r => r.started_at && r.completed_at)
      .map(r => {
        const start = new Date(r.started_at!).getTime();
        const end = new Date(r.completed_at!).getTime();
        return (end - start) / (1000 * 60); // Convert to minutes
      });

    const avgTime = completionTimes.length 
      ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
      : 0;

    return {
      totalResponses,
      completionRate,
      averageTimeToComplete: `${avgTime} minutes`
    };
  };

  // Calculate response rates per question
  const calculateQuestionStats = (questionId: string) => {
    if (!paginatedResponses?.items.length) return { responseRate: 0, uniqueResponses: 0 };

    const questionResponses = paginatedResponses.items.filter(response => 
      response.answers?.some(answer => answer.question_id === questionId)
    );

    const responseRate = Math.round((questionResponses.length / paginatedResponses.items.length) * 100);
    
    // Count unique responses (excluding nulls and empty strings)
    const uniqueValues = new Set(
      questionResponses
        .map(response => 
          response.answers?.find(a => a.question_id === questionId)?.value
        )
        .filter(value => value != null && value !== '')
    );

    return {
      responseRate,
      uniqueResponses: uniqueValues.size
    };
  };

  const stats = calculateStats();

  if (loadingState === LoadingState.LOADING) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  // Show error state if the fetch failed
  if (loadingState === LoadingState.FAILED) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <Typography color="error">
          Failed to load survey results. Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Survey Results
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Total Responses: {stats.totalResponses}
        </Typography>
      </Box>
    </Box>
  );
};

export default SurveyResults; 