import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Container,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  LinearProgress,
  Chip,
  OutlinedInput
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchChartTypes, 
  updateSurveyAnalysis,
  updateSurveyAnalysisQuestion,
  createSurveyAnalysisQuestion,
  deleteSurveyAnalysisQuestion,
  fetchSurveyQuestionTopics,
  fetchSurveyAnalysisById,
  ChartType,
  SurveyAnalysis,
  SurveyAnalysisQuestion,
  SurveyQuestionTopic
} from '@/store/slices/surveyAnalysisSlice';
import { fetchSurveyById } from '@/store/slices/surveySlice';
import { getQuestionTypeById } from '@/constants/questionTypes';

// Define interfaces for our component
interface AnalysisFormData {
  title: string;
  description: string;
}

interface QuestionSettings {
  chartTypeId: number;
  sortByValue: boolean;
  topicIds: string[];
}

const EditSurveyAnalysis: React.FC = () => {
  const { surveyId, analysisId } = useParams<{ surveyId: string; analysisId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get data from Redux store
  const { chartTypes, error: analysisError, topics, currentAnalysis } = useAppSelector((state) => state.surveyAnalysis);
  const { currentSurvey, loadingStates: surveyLoadingStates } = useAppSelector((state) => state.survey);
  const chartTypesLoading = useAppSelector((state) => state.surveyAnalysis.loadingStates.chartTypes);
  const updateAnalysisLoading = useAppSelector((state) => state.surveyAnalysis.loadingStates.updateAnalysis);
  const updateQuestionLoading = useAppSelector((state) => state.surveyAnalysis.loadingStates.updateQuestion);
  const topicsLoading = useAppSelector((state) => state.surveyAnalysis.loadingStates.topics);
  
  // Local form state
  const [formData, setFormData] = useState<AnalysisFormData>({
    title: '',
    description: ''
  });
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [questionSettings, setQuestionSettings] = useState<Map<string, QuestionSettings>>(new Map());
  const [formErrors, setFormErrors] = useState({
    title: '',
    questions: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'info' | 'warning'
  });
  const [success, setSuccess] = useState(false);

  // Derived state
  const isSurveyLoading = surveyLoadingStates.survey === 'loading';
  const isSubmitting = updateAnalysisLoading || updateQuestionLoading;
  const isLoading = isSurveyLoading || chartTypesLoading || isSubmitting;

  // Fetch initial data
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

  // Initialize form data when currentAnalysis is loaded
  useEffect(() => {
    if (currentAnalysis) {
      setFormData({
        title: currentAnalysis.title,
        description: currentAnalysis.description || ''
      });

      // Initialize selected questions and their settings
      const selectedIds: string[] = [];
      const settings = new Map<string, QuestionSettings>();

      currentAnalysis.analysis_questions?.forEach(aq => {
        if (aq.question.id) {
          selectedIds.push(aq.question.id);
          settings.set(aq.question.id, {
            chartTypeId: aq.chart_type_id,
            sortByValue: aq.sort_by_value,
            topicIds: aq.topics?.map(t => t.id as string) || []
          });
        }
      });

      setSelectedQuestions(selectedIds);
      setQuestionSettings(settings);
    }
  }, [currentAnalysis]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear validation error when field is changed
    if (name === 'title') {
      setFormErrors(prev => ({ ...prev, title: '' }));
    }
  };

  // Handle question selection
  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        // Remove from selected
        const newSelected = prev.filter(id => id !== questionId);
        
        // Also remove from question settings
        const newSettings = new Map(questionSettings);
        newSettings.delete(questionId);
        setQuestionSettings(newSettings);
        
        // Clear questions error if there are now selected questions
        if (newSelected.length > 0) {
          setFormErrors(prev => ({ ...prev, questions: '' }));
        }
        
        return newSelected;
      } else {
        // Add to selected with default settings
        const defaultChartTypeId = chartTypes.length > 0 ? chartTypes[0].id : 1;
        const newSettings = new Map(questionSettings);
        newSettings.set(questionId, { 
          chartTypeId: defaultChartTypeId, 
          sortByValue: false,
          topicIds: [] 
        });
        setQuestionSettings(newSettings);
        
        // Clear questions error
        setFormErrors(prev => ({ ...prev, questions: '' }));
        
        return [...prev, questionId];
      }
    });
  };

  // Handle chart type selection for a question
  const handleChartTypeChange = (questionId: string, chartTypeId: number) => {
    setQuestionSettings(prev => {
      const newSettings = new Map(prev);
      const current = newSettings.get(questionId) || { chartTypeId: 1, sortByValue: false, topicIds: [] };
      newSettings.set(questionId, { ...current, chartTypeId });
      return newSettings;
    });
  };

  // Handle sort by value toggle for a question
  const handleSortByValueChange = (questionId: string, sortByValue: boolean) => {
    setQuestionSettings(prev => {
      const newSettings = new Map(prev);
      const current = newSettings.get(questionId) || { chartTypeId: 1, sortByValue: false, topicIds: [] };
      newSettings.set(questionId, { ...current, sortByValue });
      return newSettings;
    });
  };

  // Handle topic selection
  const handleTopicChange = (questionId: string, topicIds: string[]) => {
    setQuestionSettings(prev => {
      const newSettings = new Map(prev);
      const current = newSettings.get(questionId) || { 
        chartTypeId: chartTypes[0]?.id || 1, 
        sortByValue: false,
        topicIds: []
      };
      newSettings.set(questionId, { ...current, topicIds });
      return newSettings;
    });
  };

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { title: '', questions: '' };

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (selectedQuestions.length === 0) {
      newErrors.questions = 'At least one question must be selected';
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !surveyId || !analysisId || !currentAnalysis) {
      return;
    }

    try {
      // Update the survey analysis
      const surveyAnalysisData = {
        survey_id: surveyId,
        title: formData.title,
        description: formData.description || null
      };

      await dispatch(updateSurveyAnalysis({
        analysisId,
        analysisData: surveyAnalysisData
      }));

      // Get current question IDs in the analysis
      const currentQuestionIds = new Set(
        currentAnalysis.analysis_questions?.map(aq => aq.question.id as string) || []
      );

      // Handle questions to be added or updated
      for (const questionId of selectedQuestions) {
        const settings = questionSettings.get(questionId) || {
          chartTypeId: 1,
          sortByValue: false,
          topicIds: []
        };

        const existingQuestion = currentAnalysis.analysis_questions?.find(
          aq => aq.question.id === questionId
        );

        if (existingQuestion) {
          // Update existing question
          await dispatch(updateSurveyAnalysisQuestion({
            questionId: existingQuestion.id as string,
            questionData: {
              chart_type_id: settings.chartTypeId,
              sort_by_value: settings.sortByValue,
              topic_ids: settings.topicIds.length > 0 ? settings.topicIds : null
            }
          }));
        } else {
          // Add new question
          await dispatch(createSurveyAnalysisQuestion({
            survey_analysis_id: analysisId,
            question_id: questionId,
            chart_type_id: settings.chartTypeId,
            sort_by_value: settings.sortByValue,
            topic_ids: settings.topicIds.length > 0 ? settings.topicIds : null,
            report_segment_ids: null
          }));
        }
      }

      // Handle questions to be removed
      for (const existingQuestionId of currentQuestionIds) {
        if (!selectedQuestions.includes(existingQuestionId)) {
          const questionToRemove = currentAnalysis.analysis_questions?.find(
            aq => aq.question.id === existingQuestionId
          );
          if (questionToRemove?.id) {
            await dispatch(deleteSurveyAnalysisQuestion(questionToRemove.id));
          }
        }
      }

      setSuccess(true);
      setSnackbar({
        open: true,
        message: 'Survey analysis updated successfully!',
        severity: 'success'
      });

      // Navigate back to the survey details page after a short delay
      setTimeout(() => {
        if (surveyId) {
          navigate(`${PATHS.PUBLIC.SURVEYS_V2.path}/${surveyId}`);
        } else {
          navigate(PATHS.PUBLIC.SURVEYS_V2.path);
        }
      }, 1500);
    } catch (error) {
      console.error('Error updating survey analysis:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update survey analysis. Please try again.',
        severity: 'error'
      });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(-1);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Render loading state
  if (isSurveyLoading) {
    return (
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Edit Survey Analysis
          </Typography>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Loading survey data...</Typography>
        </Paper>
      </Container>
    );
  }

  // Render error state
  if (!currentSurvey || !surveyId || !currentAnalysis) {
    return (
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Edit Survey Analysis
          </Typography>
          <Alert severity="error" sx={{ mt: 2 }}>
            {analysisError || 'Survey or analysis not found'}
          </Alert>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  // Get sorted questions for display
  const sortedQuestions = currentSurvey.questions 
    ? [...currentSurvey.questions].sort((a, b) => a.order_index - b.order_index) 
    : [];

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Analysis for "{currentSurvey.title}"
        </Typography>
        
        {isLoading && <LinearProgress sx={{ mb: 2 }} />}
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Analysis Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TextField
              name="title"
              label="Analysis Title"
              value={formData.title}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
              error={!!formErrors.title}
              helperText={formErrors.title || 'Enter a descriptive title for this analysis'}
              disabled={isSubmitting}
            />
            
            <TextField
              name="description"
              label="Description (Optional)"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
              margin="normal"
              helperText="Provide additional details about this analysis"
              disabled={isSubmitting}
            />
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Select Questions to Analyze
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {formErrors.questions && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formErrors.questions}
              </Alert>
            )}
            
            {chartTypesLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                <CircularProgress size={20} />
                <Typography>Loading chart types...</Typography>
              </Box>
            ) : (
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {sortedQuestions.map((question) => {
                  const questionId = question.id as string;
                  const isSelected = selectedQuestions.includes(questionId);
                  const settings = questionSettings.get(questionId) || { 
                    chartTypeId: chartTypes[0]?.id || 1, 
                    sortByValue: false, 
                    topicIds: [] 
                  };
                  
                  return (
                    <React.Fragment key={questionId}>
                      <ListItem>
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={isSelected}
                            onChange={() => handleQuestionToggle(questionId)}
                            disabled={isSubmitting}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={question.title}
                          secondary={`Type: ${getQuestionTypeById(question.type.id).name} | Options: ${question.options?.length || 0}`}
                        />
                      </ListItem>
                      
                      {isSelected && (
                        <Box sx={{ pl: 7, pr: 2, pb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Chart Settings
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <FormControl sx={{ minWidth: 200 }} size="small">
                              <InputLabel>Chart Type</InputLabel>
                              <Select
                                value={settings.chartTypeId}
                                label="Chart Type"
                                onChange={(e) => handleChartTypeChange(questionId, Number(e.target.value))}
                                disabled={isSubmitting || chartTypes.length === 0}
                              >
                                {chartTypes.map((type) => (
                                  <MenuItem key={type.id} value={type.id}>
                                    {type.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            
                            <FormControl sx={{ minWidth: 200 }} size="small">
                              <InputLabel>Sort Options</InputLabel>
                              <Select
                                value={settings.sortByValue ? 'value' : 'order'}
                                label="Sort Options"
                                onChange={(e) => handleSortByValueChange(questionId, e.target.value === 'value')}
                                disabled={isSubmitting}
                              >
                                <MenuItem value="order">By Original Order</MenuItem>
                                <MenuItem value="value">By Value (Count/Percentage)</MenuItem>
                              </Select>
                              <FormHelperText>How to sort options in the chart</FormHelperText>
                            </FormControl>

                            <FormControl sx={{ minWidth: 200 }} size="small">
                              <InputLabel>Topics</InputLabel>
                              <Select
                                multiple
                                value={settings.topicIds}
                                onChange={(e) => handleTopicChange(questionId, e.target.value as string[])}
                                input={<OutlinedInput label="Topics" />}
                                disabled={isSubmitting || topicsLoading}
                                renderValue={(selected) => (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((topicId) => {
                                      const topic = topics.find(t => t.id === topicId);
                                      return topic ? (
                                        <Chip key={topicId} label={topic.name} size="small" />
                                      ) : null;
                                    })}
                                  </Box>
                                )}
                              >
                                {topicsLoading ? (
                                  <MenuItem disabled>
                                    <CircularProgress size={20} sx={{ mr: 1 }} />
                                    Loading topics...
                                  </MenuItem>
                                ) : topics.length === 0 ? (
                                  <MenuItem disabled>No topics available</MenuItem>
                                ) : (
                                  topics.map((topic) => (
                                    <MenuItem key={topic.id} value={topic.id}>
                                      {topic.name}
                                    </MenuItem>
                                  ))
                                )}
                              </Select>
                              <FormHelperText>Assign topics to this question</FormHelperText>
                            </FormControl>
                          </Box>
                        </Box>
                      )}
                      <Divider component="li" />
                    </React.Fragment>
                  );
                })}
              </List>
            )}
            
            {sortedQuestions.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                This survey has no questions available for analysis.
              </Alert>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting || success || sortedQuestions.length === 0}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditSurveyAnalysis; 