import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  LinearProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSurveyAnalysisById } from '@/store/slices/surveyAnalysisSlice';
import { fetchSurveyById, fetchPaginatedSurveyResponses } from '@/store/slices/surveySlice';
import { AnalysisChart } from './subcomponents';
import { getInsights, getQuestionData, groupAndSortQuestionsByTopic } from '../utils/surveyAnalysisInsights';

const OutputSurveyAnalysis: React.FC = () => {
  const { surveyId, analysisId } = useParams<{ surveyId: string; analysisId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get data from Redux store
  const { currentAnalysis } = useAppSelector((state) => state.surveyAnalysis);
  const { currentSurvey, paginatedResponses, loadingStates: surveyLoadingStates } = useAppSelector((state) => state.survey);
  const analysisLoadingStates = useAppSelector((state) => state.surveyAnalysis.loadingStates);

  // Loading states
  const isSurveyLoading = surveyLoadingStates.survey === 'loading';
  const isAnalysisLoading = analysisLoadingStates.analysis;
  const isResponsesLoading = surveyLoadingStates.paginatedResponses === 'loading';
  const isLoading = isSurveyLoading || isAnalysisLoading || isResponsesLoading;

  // Fetch data when component mounts
  useEffect(() => {
    if (surveyId) {
      dispatch(fetchSurveyById({ surveyId, forceRefresh: true }));
    }
  }, [surveyId, dispatch]);

  useEffect(() => {
    if (analysisId) {
      dispatch(fetchSurveyAnalysisById({ analysisId, forceRefresh: true }));
    }
  }, [analysisId, dispatch]);

  useEffect(() => {
    if (surveyId) {
      dispatch(fetchPaginatedSurveyResponses({ 
        surveyId, 
        options: { 
          page: 1,
          page_size: 1000, // Get a large number of responses for analysis
          completed_only: true 
        },
        forceRefresh: true 
      }));
    }
  }, [surveyId, dispatch]);

  // Helper function to check if a question is being used as a filter
  const isFilterQuestion = (questionId: string): boolean => {
    return questionId === currentAnalysis?.filters?.[0]?.survey_analysis_question_id;
  };

  // Group and filter analysis questions
  const getGroupedAnalysisQuestions = () => {
    // Filter out questions used as filters
    const filteredQuestions = currentAnalysis?.analysis_questions?.filter(
      question => !isFilterQuestion(question.id || '')
    ) || [];
    
    // Group by topic and sort by order_index
    return groupAndSortQuestionsByTopic(filteredQuestions);
  };

  // Handle back navigation
  const handleBack = () => {
    if (surveyId && analysisId) {
      navigate(`${PATHS.PUBLIC.SURVEYS_V2_ANALYSIS_VIEW.path.replace(':surveyId', surveyId).replace(':analysisId', analysisId)}`);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Survey Analysis Output
          </Typography>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Generating analysis output...</Typography>
        </Paper>
      </Container>
    );
  }

  if (!currentAnalysis || !currentSurvey) {
    return (
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Survey Analysis Output
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

  // Get grouped and sorted questions
  const groupedQuestions = getGroupedAnalysisQuestions();

  return (
    <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {currentAnalysis.title} - Output
          </Typography>
          <Button variant="outlined" onClick={handleBack}>
            Back to Analysis
          </Button>
        </Box>

        {/* Analysis Output Content */}
        <Box sx={{ mt: 4 }}>
          {groupedQuestions.length === 0 ? (
            <Alert severity="info">No analysis questions available.</Alert>
          ) : (
            groupedQuestions.map((group, groupIndex) => (
              <Box key={group.topicName} sx={{ mb: 5 }}>
                {/* Topic heading */}
                <Typography variant="h5" sx={{ mb: 2, borderBottom: '1px solid #eeeeee', pb: 1 }}>
                  {group.topicName}
                </Typography>
                
                {/* Questions in this topic */}
                {group.questions.map((analysisQuestion) => {
                  // Get insights for this question using the utility function
                  const insights = getInsights(analysisQuestion, paginatedResponses, currentAnalysis);
                  
                  return (
                    <Box key={analysisQuestion.id} sx={{ mb: 6 }}>
                      <Typography variant="h6" gutterBottom>
                        {analysisQuestion.question.title}
                      </Typography>
                      
                      {/* Display insights as bullet points */}
                      {insights.length > 0 && (
                        <Box sx={{ mb: 2, pl: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Insights:
                          </Typography>
                          <List dense disablePadding>
                            {insights.map((insight, index) => (
                              <ListItem key={index} sx={{ py: 0.5 }}>
                                <ListItemText 
                                  primary={
                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                      • {insight}
                                    </Typography>
                                  } 
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                      
                      <Box sx={{ height: 'auto', mt: 3, mb: 3 }}>
                        <AnalysisChart
                          chartTypeId={analysisQuestion.chart_type_id}
                          data={getQuestionData(paginatedResponses, currentAnalysis, analysisQuestion.question_id)}
                          sortByValue={analysisQuestion.sort_by_value}
                        />
                      </Box>
                    </Box>
                  );
                })}
                
                {/* Add divider if not the last group */}
                {groupIndex < groupedQuestions.length - 1 && <Divider sx={{ my: 3 }} />}
              </Box>
            ))
          )}
        </Box>
    </Container>
  );
};

export default OutputSurveyAnalysis; 