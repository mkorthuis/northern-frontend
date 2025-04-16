import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  OutlinedInput
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchChartTypes,
  fetchSurveyAnalysisById,
  fetchSurveyQuestionTopics,
  updateSurveyAnalysisQuestion,
  ChartType,
  SurveyAnalysis,
  SurveyAnalysisQuestion
} from '@/store/slices/surveyAnalysisSlice';
import { fetchSurveyById } from '@/store/slices/surveySlice';
import { getQuestionTypeById } from '@/constants/questionTypes';

const ViewSurveyAnalysis: React.FC = () => {
  const { surveyId, analysisId } = useParams<{ surveyId: string; analysisId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get data from Redux store
  const { chartTypes, currentAnalysis, topics } = useAppSelector((state) => state.surveyAnalysis);
  const { currentSurvey, loadingStates: surveyLoadingStates } = useAppSelector((state) => state.survey);
  const analysisLoadingStates = useAppSelector((state) => state.surveyAnalysis.loadingStates);

  // Loading states
  const isSurveyLoading = surveyLoadingStates.survey === 'loading';
  const isAnalysisLoading = analysisLoadingStates.analysis;
  const isChartTypesLoading = analysisLoadingStates.chartTypes;
  const isTopicsLoading = analysisLoadingStates.topics;
  const isUpdateQuestionLoading = analysisLoadingStates.updateQuestion;

  const isLoading = isSurveyLoading || isAnalysisLoading || isChartTypesLoading || isTopicsLoading;

  // Fetch data when component mounts
  useEffect(() => {
    if (surveyId) {
      dispatch(fetchSurveyById({ surveyId, forceRefresh: true }));
      dispatch(fetchSurveyQuestionTopics({ surveyId, forceRefresh: true }));
    }
  }, [surveyId, dispatch]);

  useEffect(() => {
    if (analysisId) {
      dispatch(fetchSurveyAnalysisById({ analysisId, forceRefresh: true }));
    }
  }, [analysisId, dispatch]);

  useEffect(() => {
    dispatch(fetchChartTypes({ forceRefresh: true }));
  }, [dispatch]);

  // Handle chart type change
  const handleChartTypeChange = async (question: SurveyAnalysisQuestion, chartTypeId: number) => {
    if (!question.id) return;

    try {
      await dispatch(updateSurveyAnalysisQuestion({
        questionId: question.id,
        questionData: {
          chart_type_id: chartTypeId,
          sort_by_value: question.sort_by_value,
          topic_ids: question.topics?.map(t => t.id as string) || null
        }
      }));
    } catch (error) {
      console.error('Failed to update chart type:', error);
    }
  };

  // Handle sort by value change
  const handleSortByValueChange = async (question: SurveyAnalysisQuestion, sortByValue: boolean) => {
    if (!question.id) return;

    try {
      await dispatch(updateSurveyAnalysisQuestion({
        questionId: question.id,
        questionData: {
          chart_type_id: question.chart_type_id,
          sort_by_value: sortByValue,
          topic_ids: question.topics?.map(t => t.id as string) || null
        }
      }));
    } catch (error) {
      console.error('Failed to update sort by value:', error);
    }
  };

  // Handle topic change
  const handleTopicChange = async (question: SurveyAnalysisQuestion, topicIds: string[]) => {
    if (!question.id) return;

    try {
      await dispatch(updateSurveyAnalysisQuestion({
        questionId: question.id,
        questionData: {
          chart_type_id: question.chart_type_id,
          sort_by_value: question.sort_by_value,
          topic_ids: topicIds.length > 0 ? topicIds : null
        }
      }));
    } catch (error) {
      console.error('Failed to update topics:', error);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (surveyId) {
      navigate(`${PATHS.PUBLIC.SURVEYS_V2.path}/${surveyId}`);
    } else {
      navigate(PATHS.PUBLIC.SURVEYS_V2.path);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            View Survey Analysis
          </Typography>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Loading analysis data...</Typography>
        </Paper>
      </Container>
    );
  }

  // Render error state
  if (!currentAnalysis || !currentSurvey) {
    return (
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            View Survey Analysis
          </Typography>
          <Alert severity="error" sx={{ mt: 2 }}>
            Analysis or survey not found
          </Alert>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={handleBack}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {currentAnalysis.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate(`${PATHS.PUBLIC.SURVEYS_V2.path}/${surveyId}/analysis/${analysisId}/edit`)}
            >
              Edit Analysis
            </Button>
            <Button variant="outlined" onClick={handleBack}>
              Back to Survey
            </Button>
          </Box>
        </Box>

        {currentAnalysis.description && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {currentAnalysis.description}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Analysis Questions
          </Typography>

          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {currentAnalysis.analysis_questions?.map((analysisQuestion) => {
              const question = analysisQuestion.question;
              const selectedTopicIds = analysisQuestion.topics?.map(t => t.id as string) || [];
              
              return (
                <React.Fragment key={analysisQuestion.id}>
                  <ListItem>
                    <ListItemText
                      primary={question.title}
                      secondary={`Type: ${getQuestionTypeById(question.type.id).name} | Options: ${question.options?.length || 0}`}
                    />
                  </ListItem>
                  
                  <Box sx={{ pl: 3, pr: 2, pb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Chart Settings
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ minWidth: 200 }}>
                        <Typography variant="caption" color="textSecondary">
                          Chart Type
                        </Typography>
                        <Typography variant="body2">
                          {chartTypes.find(type => type.id === analysisQuestion.chart_type_id)?.name || 'Not set'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ minWidth: 200 }}>
                        <Typography variant="caption" color="textSecondary">
                          Sort Options
                        </Typography>
                        <Typography variant="body2">
                          {analysisQuestion.sort_by_value ? 'By Value (Count/Percentage)' : 'By Original Order'}
                        </Typography>
                      </Box>

                      <Box sx={{ minWidth: 200 }}>
                        <Typography variant="caption" color="textSecondary">
                          Topics
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {analysisQuestion.topics && analysisQuestion.topics.length > 0 ? (
                            analysisQuestion.topics.map((topic) => (
                              <Chip 
                                key={topic.id} 
                                label={topic.name} 
                                size="small" 
                                variant="outlined"
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              No topics assigned
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  <Divider component="li" />
                </React.Fragment>
              );
            })}
          </List>
        </Box>
      </Paper>
    </Container>
  );
};

export default ViewSurveyAnalysis; 