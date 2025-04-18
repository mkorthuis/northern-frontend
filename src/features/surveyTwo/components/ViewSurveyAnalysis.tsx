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
  OutlinedInput,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchChartTypes,
  fetchSurveyAnalysisById,
  fetchSurveyQuestionTopics,
  fetchSurveyReportSegments,
  updateSurveyAnalysisQuestion,
  deleteSurveyAnalysis,
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

  // Add state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get data from Redux store
  const { chartTypes, currentAnalysis, topics, segments } = useAppSelector((state) => state.surveyAnalysis);
  const { currentSurvey, loadingStates: surveyLoadingStates } = useAppSelector((state) => state.survey);
  const analysisLoadingStates = useAppSelector((state) => state.surveyAnalysis.loadingStates);

  // Loading states
  const isSurveyLoading = surveyLoadingStates.survey === 'loading';
  const isAnalysisLoading = analysisLoadingStates.analysis;
  const isChartTypesLoading = analysisLoadingStates.chartTypes;
  const isTopicsLoading = analysisLoadingStates.topics;
  const isSegmentsLoading = analysisLoadingStates.segments;
  const isUpdateQuestionLoading = analysisLoadingStates.updateQuestion;

  const isLoading = isSurveyLoading || isAnalysisLoading || isChartTypesLoading || isTopicsLoading || isSegmentsLoading;

  // Fetch data when component mounts
  useEffect(() => {
    if (surveyId) {
      dispatch(fetchSurveyById({ surveyId, forceRefresh: true }));
      dispatch(fetchSurveyQuestionTopics({ surveyId, forceRefresh: true }));
      dispatch(fetchSurveyReportSegments({ surveyId, forceRefresh: true }));
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
          is_demographic: question.is_demographic,
          topic_ids: question.topics?.map(t => t.id as string) || null,
          report_segment_ids: question.report_segments?.map(s => s.id as string) || null
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
          is_demographic: question.is_demographic,
          topic_ids: question.topics?.map(t => t.id as string) || null,
          report_segment_ids: question.report_segments?.map(s => s.id as string) || null
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
          is_demographic: question.is_demographic,
          topic_ids: topicIds.length > 0 ? topicIds : null,
          report_segment_ids: question.report_segments?.map(s => s.id as string) || null
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

  // Handle delete analysis
  const handleDeleteAnalysis = async () => {
    if (!analysisId) return;
    
    setIsDeleting(true);
    try {
      const resultAction = await dispatch(deleteSurveyAnalysis(analysisId));
      if (resultAction.meta.requestStatus === 'fulfilled') {
        // Navigate back to survey page after successful deletion
        navigate(`${PATHS.PUBLIC.SURVEYS_V2.path}/${surveyId}`);
      }
    } catch (error) {
      console.error('Failed to delete analysis:', error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Find the analysis question by ID
  const findAnalysisQuestionById = (questionId: string) => {
    return currentAnalysis?.analysis_questions?.find(q => q.id === questionId);
  };

  // Render loading state
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: 'calc(100vh)' 
      }}>
        <Paper elevation={3} sx={{ p: 4, my: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              View Survey Analysis
            </Typography>
          </Box>
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
    <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <img src="/images/owl.png" alt="Owl" style={{ height: '64px' }} />
          <Typography variant="h4" component="h1" sx={{ paddingLeft: '16px', marginRight: 'auto' }}>
            {currentAnalysis.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate(`${PATHS.PUBLIC.SURVEYS_V2_ANALYSIS_EDIT.path.replace(':surveyId', surveyId || '').replace(':analysisId', analysisId || '')}`)}
            >
              Edit Analysis
            </Button>
            <Button 
              variant="contained"
              color="secondary"
              onClick={() => navigate(`${PATHS.PUBLIC.SURVEYS_V2_ANALYSIS_OUTPUT.path.replace(':surveyId', surveyId || '').replace(':analysisId', analysisId || '')}`)}
            >
              Generate Output
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Analysis
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

        {/* Filter Section */}
        {currentAnalysis.filters && currentAnalysis.filters.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Analysis Filters
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {currentAnalysis.filters.map((filter) => {
              const filterQuestion = findAnalysisQuestionById(filter.survey_analysis_question_id);
              
              return (
                <Box key={filter.id} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Filter Question: {filterQuestion?.question.title || 'Unknown Question'}
                  </Typography>
                  
                  <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>
                    Filter Values:
                  </Typography>
                  
                  {filter.criteria && filter.criteria.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {filter.criteria.map((criterion, index) => (
                        <Chip 
                          key={index}
                          label={criterion.value}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No filter values specified
                    </Typography>
                  )}
                </Box>
              );
            })}
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
              const selectedSegmentIds = analysisQuestion.report_segments?.map(s => s.id as string) || [];
              
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

                      <Box sx={{ minWidth: 200 }}>
                        <Typography variant="caption" color="textSecondary">
                          Report Segments
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {analysisQuestion.report_segments && analysisQuestion.report_segments.length > 0 ? (
                            analysisQuestion.report_segments.map((segment) => (
                              <Chip 
                                key={segment.id} 
                                label={segment.name} 
                                size="small" 
                                variant="outlined"
                                color="secondary"
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              No segments assigned
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ minWidth: 200 }}>
                        <Typography variant="caption" color="textSecondary">
                          Question Type
                        </Typography>
                        <Typography variant="body2">
                          {analysisQuestion.is_demographic ? 'Demographic Question' : 'Standard Question'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Divider component="li" />
                </React.Fragment>
              );
            })}
          </List>
        </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Analysis</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this analysis? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAnalysis} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewSurveyAnalysis; 