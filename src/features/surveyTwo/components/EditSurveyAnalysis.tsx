import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  OutlinedInput,
  SelectChangeEvent
} from '@mui/material';
import { PATHS } from '@/routes/paths';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchChartTypes, 
  updateSurveyAnalysis,
  updateSurveyAnalysisQuestion,
  createSurveyAnalysisQuestion,
  deleteSurveyAnalysisQuestion,
  fetchSurveyQuestionTopics,
  fetchSurveyReportSegments,
  fetchSurveyAnalysisById,
  fetchSurveyAnalysisFilters,
  createSurveyAnalysisFilter,
  updateSurveyAnalysisFilter,
  deleteSurveyAnalysisFilter,
  ChartType,
  SurveyQuestionTopic,
  SurveyReportSegment,
  SurveyAnalysisFilter,
  FilterCriterion,
  SurveyAnalysisQuestion
} from '@/store/slices/surveyAnalysisSlice';
import { fetchSurveyById } from '@/store/slices/surveySlice';
import { getQuestionTypeById } from '@/constants/questionTypes';

// Define interfaces for our component
interface AnalysisFormData {
  title: string;
  description: string;
  analysisQuestionId: string;
}

// Interface for filter criteria management
interface FilterCriteriaState {
  values: string[];
  newValue: string;
}

interface QuestionSettings {
  chartTypeId: number;
  sortByValue: boolean;
  isDemographic: boolean;
  topicIds: string[];
  segmentIds: string[];
}

interface FormErrors {
  title: string;
  questions: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

// Component for rendering question settings
interface QuestionSettingsProps {
  questionId: string;
  settings: QuestionSettings;
  chartTypes: ChartType[];
  topics: SurveyQuestionTopic[];
  segments: SurveyReportSegment[];
  isSubmitting: boolean;
  chartTypesLoading: boolean;
  topicsLoading: boolean;
  segmentsLoading: boolean;
  onChartTypeChange: (questionId: string, chartTypeId: number) => void;
  onSortByValueChange: (questionId: string, sortByValue: boolean) => void;
  onDemographicChange: (questionId: string, isDemographic: boolean) => void;
  onTopicChange: (questionId: string, topicIds: string[]) => void;
  onSegmentChange: (questionId: string, segmentIds: string[]) => void;
}

// Get the first criterion value from a filter or empty string if not available
const getFilterCriterionValue = (filter?: SurveyAnalysisFilter): string => {
  if (!filter || !filter.criteria || filter.criteria.length === 0) {
    return '';
  }
  return filter.criteria[0].value || '';
};

// Check if a filter has a criterion matching a specific value
const hasFilterCriterionMatchingValue = (filter: SurveyAnalysisFilter, value: string): boolean => {
  return filter.criteria && filter.criteria.some(criterion => criterion.value === value);
};

// Utility function to find an analysis question with a specific base question ID
const findAnalysisQuestionByBaseQuestionId = (
  analysisQuestions: SurveyAnalysisQuestion[] | undefined, 
  baseQuestionId: string
): SurveyAnalysisQuestion | undefined => {
  return analysisQuestions?.find(aq => aq.question.id === baseQuestionId);
};

const QuestionSettingsPanel: React.FC<QuestionSettingsProps> = ({
  questionId,
  settings,
  chartTypes,
  topics,
  segments,
  isSubmitting,
  chartTypesLoading,
  topicsLoading,
  segmentsLoading,
  onChartTypeChange,
  onSortByValueChange,
  onDemographicChange,
  onTopicChange,
  onSegmentChange
}) => (
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
          onChange={(e) => onChartTypeChange(questionId, Number(e.target.value))}
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
          onChange={(e) => onSortByValueChange(questionId, e.target.value === 'value')}
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
          onChange={(e) => onTopicChange(questionId, e.target.value as string[])}
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

      <FormControl sx={{ minWidth: 200 }} size="small">
        <InputLabel>Report Segments</InputLabel>
        <Select
          multiple
          value={settings.segmentIds}
          onChange={(e) => onSegmentChange(questionId, e.target.value as string[])}
          input={<OutlinedInput label="Report Segments" />}
          disabled={isSubmitting || segmentsLoading}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((segmentId) => {
                const segment = segments.find(s => s.id === segmentId);
                return segment ? (
                  <Chip key={segmentId} label={segment.name} size="small" />
                ) : null;
              })}
            </Box>
          )}
        >
          {segmentsLoading ? (
            <MenuItem disabled>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Loading segments...
            </MenuItem>
          ) : segments.length === 0 ? (
            <MenuItem disabled>No segments available</MenuItem>
          ) : (
            segments.map((segment) => (
              <MenuItem key={segment.id} value={segment.id}>
                {segment.name}
              </MenuItem>
            ))
          )}
        </Select>
        <FormHelperText>Assign report segments to this question</FormHelperText>
      </FormControl>
      
      <FormControl sx={{ minWidth: 200, display: 'flex', flexDirection: 'row', alignItems: 'center' }} size="small">
        <Checkbox
          checked={settings.isDemographic}
          onChange={(e) => onDemographicChange(questionId, e.target.checked)}
          disabled={isSubmitting}
          sx={{ mr: 1 }}
        />
        <Box>
          <Typography variant="body2">Demographic Question</Typography>
          <FormHelperText sx={{ ml: 0, pl: 0 }}>Can be used for filtering and segmentation</FormHelperText>
        </Box>
      </FormControl>
    </Box>
  </Box>
);

const EditSurveyAnalysis: React.FC = () => {
  const { surveyId, analysisId } = useParams<{ surveyId: string; analysisId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get data from Redux store
  const { chartTypes, error: analysisError, topics, segments, currentAnalysis } = useAppSelector((state) => state.surveyAnalysis);
  const { currentSurvey, loadingStates: surveyLoadingStates } = useAppSelector((state) => state.survey);
  const chartTypesLoading = useAppSelector((state) => state.surveyAnalysis.loadingStates.chartTypes);
  const updateAnalysisLoading = useAppSelector((state) => state.surveyAnalysis.loadingStates.updateAnalysis);
  const updateQuestionLoading = useAppSelector((state) => state.surveyAnalysis.loadingStates.updateQuestion);
  const filtersLoading = useAppSelector((state) => state.surveyAnalysis.loadingStates.filters);
  const createFilterLoading = useAppSelector((state) => state.surveyAnalysis.loadingStates.createFilter);
  const updateFilterLoading = useAppSelector((state) => state.surveyAnalysis.loadingStates.updateFilter);
  const deleteFilterLoading = useAppSelector((state) => state.surveyAnalysis.loadingStates.deleteFilter);
  const topicsLoading = useAppSelector((state) => state.surveyAnalysis.loadingStates.topics);
  const segmentsLoading = useAppSelector((state) => state.surveyAnalysis.loadingStates.segments);
  
  // Local form state
  const [formData, setFormData] = useState<AnalysisFormData>({
    title: '',
    description: '',
    analysisQuestionId: ''
  });
  // New state for filter criteria
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteriaState>({
    values: [],
    newValue: ''
  });
  
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [questionSettings, setQuestionSettings] = useState<Map<string, QuestionSettings>>(new Map());
  const [formErrors, setFormErrors] = useState<FormErrors>({
    title: '',
    questions: ''
  });
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [success, setSuccess] = useState(false);

  // Derived state
  const isSurveyLoading = surveyLoadingStates.survey === 'loading';
  const isSubmitting = updateAnalysisLoading || updateQuestionLoading || createFilterLoading || updateFilterLoading || deleteFilterLoading;
  const isLoading = isSurveyLoading || chartTypesLoading || isSubmitting || filtersLoading;

  // Get demographic questions
  const demographicQuestions = React.useMemo(() => {
    if (!currentSurvey || !currentSurvey.questions) return [];
    
    // Get all questions that have been marked as demographic in any analysis question
    const questionsWithDemographicSettings = currentAnalysis?.analysis_questions
      ?.filter(aq => aq.is_demographic)
      .map(aq => aq.question_id) || [];
    
    // Get currently selected questions with isDemographic=true
    const selectedDemographicQuestions = Array.from(questionSettings.entries())
      .filter(([_, settings]) => settings.isDemographic)
      .map(([questionId]) => questionId);
    
    // Combine both sets of demographic question IDs
    const allDemographicIds = new Set([
      ...questionsWithDemographicSettings,
      ...selectedDemographicQuestions
    ]);
    
    // Return the full question objects for each demographic question
    return currentSurvey.questions.filter(question => {
      const questionId = question.id as string;
      return allDemographicIds.has(questionId) || 
        (currentAnalysis?.filters && 
          currentAnalysis.filters.some(filter => hasFilterCriterionMatchingValue(filter, questionId))
        );
    });
  }, [currentSurvey, currentAnalysis, questionSettings]);

  // Get analysis questions that can be used for filtering (demographic questions)
  const analysisQuestionsForFiltering = React.useMemo(() => {
    if (!currentAnalysis?.analysis_questions) return [];
    return currentAnalysis.analysis_questions.filter(aq => aq.is_demographic);
  }, [currentAnalysis]);

  // Effects
  useEffect(() => {
    if (!surveyId) return;
    
    // Fetch survey data, topics, and segments
    dispatch(fetchSurveyById({ surveyId, forceRefresh: true }));
    dispatch(fetchSurveyQuestionTopics({ surveyId, forceRefresh: true }));
    dispatch(fetchSurveyReportSegments({ surveyId, forceRefresh: true }));
  }, [surveyId, dispatch]);

  useEffect(() => {
    if (!analysisId) return;
    
    // Fetch analysis data
    dispatch(fetchSurveyAnalysisById({ analysisId, forceRefresh: true }));
  }, [analysisId, dispatch]);

  useEffect(() => {
    if (analysisId) {
      // Fetch filters for this analysis
      dispatch(fetchSurveyAnalysisFilters({ analysisId, forceRefresh: true }));
    }
  }, [analysisId, dispatch]);

  useEffect(() => {
    // Fetch chart types
    dispatch(fetchChartTypes({ forceRefresh: true }));
  }, [dispatch]);

  useEffect(() => {
    if (!currentAnalysis) return;

    // Find the filter that contains question ID info (if any)
    const questionFilter = currentAnalysis.filters?.find(filter => 
      filter.criteria && filter.criteria.length > 0
    );

    // Initialize form data and selections
    setFormData({
      title: currentAnalysis.title,
      description: currentAnalysis.description || '',
      analysisQuestionId: questionFilter?.survey_analysis_question_id || ''
    });

    // Initialize filter criteria from existing filter
    if (questionFilter?.criteria && questionFilter.criteria.length > 0) {
      setFilterCriteria({
        values: questionFilter.criteria.map(criterion => criterion.value || ''),
        newValue: ''
      });
    } else {
      setFilterCriteria({
        values: [],
        newValue: ''
      });
    }

    // Initialize selected questions and their settings
    const selectedIds: string[] = [];
    const settings = new Map<string, QuestionSettings>();

    currentAnalysis.analysis_questions?.forEach(aq => {
      if (aq.question.id) {
        selectedIds.push(aq.question.id);
        settings.set(aq.question.id, {
          chartTypeId: aq.chart_type_id,
          sortByValue: aq.sort_by_value,
          isDemographic: aq.is_demographic,
          topicIds: aq.topics?.map(t => t.id as string) || [],
          segmentIds: aq.report_segments?.map(s => s.id as string) || []
        });
      }
    });

    setSelectedQuestions(selectedIds);
    setQuestionSettings(settings);
  }, [currentAnalysis]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = { title: '', questions: '' };
    let isValid = true;

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

  // Event handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'title') {
      setFormErrors(prev => ({ ...prev, title: '' }));
    }
  };

  const handleFilterQuestionChange = (e: SelectChangeEvent<string>) => {
    // When changing the question, reset the filter criteria
    setFormData(prev => ({ ...prev, analysisQuestionId: e.target.value }));
    setFilterCriteria({
      values: [],
      newValue: ''
    });
  };

  const handleFilterValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterCriteria(prev => ({
      ...prev,
      newValue: e.target.value
    }));
  };

  const handleAddFilterValue = () => {
    // Don't add empty values or duplicates
    if (!filterCriteria.newValue.trim() || 
        filterCriteria.values.includes(filterCriteria.newValue.trim())) {
      return;
    }
    
    setFilterCriteria(prev => ({
      values: [...prev.values, prev.newValue.trim()],
      newValue: '' // Clear the input field after adding
    }));
  };

  const handleRemoveFilterValue = (valueToRemove: string) => {
    setFilterCriteria(prev => ({
      ...prev,
      values: prev.values.filter(value => value !== valueToRemove)
    }));
  };

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        // Remove question
        const newSelected = prev.filter(id => id !== questionId);
        const newSettings = new Map(questionSettings);
        newSettings.delete(questionId);
        setQuestionSettings(newSettings);
        
        if (newSelected.length > 0) {
          setFormErrors(prev => ({ ...prev, questions: '' }));
        }
        
        return newSelected;
      } else {
        // Add question
        const defaultChartTypeId = chartTypes.length > 0 ? chartTypes[0].id : 1;
        const newSettings = new Map(questionSettings);
        newSettings.set(questionId, { 
          chartTypeId: defaultChartTypeId, 
          sortByValue: false,
          isDemographic: false,
          topicIds: [],
          segmentIds: []
        });
        setQuestionSettings(newSettings);
        setFormErrors(prev => ({ ...prev, questions: '' }));
        
        return [...prev, questionId];
      }
    });
  };

  const handleChartTypeChange = (questionId: string, chartTypeId: number) => {
    setQuestionSettings(prev => {
      const newSettings = new Map(prev);
      const current = newSettings.get(questionId) || { 
        chartTypeId: 1, 
        sortByValue: false, 
        isDemographic: false,
        topicIds: [],
        segmentIds: []
      };
      newSettings.set(questionId, { ...current, chartTypeId });
      return newSettings;
    });
  };

  const handleSortByValueChange = (questionId: string, sortByValue: boolean) => {
    setQuestionSettings(prev => {
      const newSettings = new Map(prev);
      const current = newSettings.get(questionId) || { 
        chartTypeId: 1, 
        sortByValue: false, 
        isDemographic: false,
        topicIds: [],
        segmentIds: []
      };
      newSettings.set(questionId, { ...current, sortByValue });
      return newSettings;
    });
  };

  const handleDemographicChange = (questionId: string, isDemographic: boolean) => {
    setQuestionSettings(prev => {
      const newSettings = new Map(prev);
      const current = newSettings.get(questionId) || { 
        chartTypeId: 1, 
        sortByValue: false,
        isDemographic: false,
        topicIds: [],
        segmentIds: []
      };
      newSettings.set(questionId, { ...current, isDemographic });
      return newSettings;
    });
  };

  const handleTopicChange = (questionId: string, topicIds: string[]) => {
    setQuestionSettings(prev => {
      const newSettings = new Map(prev);
      const current = newSettings.get(questionId) || { 
        chartTypeId: chartTypes[0]?.id || 1, 
        sortByValue: false,
        isDemographic: false,
        topicIds: [],
        segmentIds: []
      };
      newSettings.set(questionId, { ...current, topicIds });
      return newSettings;
    });
  };

  const handleSegmentChange = (questionId: string, segmentIds: string[]) => {
    setQuestionSettings(prev => {
      const newSettings = new Map(prev);
      const current = newSettings.get(questionId) || { 
        chartTypeId: chartTypes[0]?.id || 1, 
        sortByValue: false,
        isDemographic: false,
        topicIds: [],
        segmentIds: []
      };
      newSettings.set(questionId, { ...current, segmentIds });
      return newSettings;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !surveyId || !analysisId || !currentAnalysis) {
      return;
    }

    try {
      // Update analysis
      await dispatch(updateSurveyAnalysis({
        analysisId,
        analysisData: {
          title: formData.title,
          description: formData.description || null
        }
      })).unwrap();

      // Handle questions first so we have valid analysis question IDs for filters
      // Get current question IDs
      const currentQuestionIds = new Set(
        currentAnalysis.analysis_questions?.map(aq => aq.question.id as string) || []
      );

      // Update or add questions
      for (const questionId of selectedQuestions) {
        const settings = questionSettings.get(questionId) || {
          chartTypeId: chartTypes[0]?.id || 1,
          sortByValue: false,
          isDemographic: false,
          topicIds: [],
          segmentIds: []
        };

        const existingQuestion = currentAnalysis.analysis_questions?.find(
          aq => aq.question.id === questionId
        );

        if (existingQuestion) {
          // Update existing question
          const updateData = {
            chart_type_id: settings.chartTypeId,
            sort_by_value: settings.sortByValue,
            is_demographic: settings.isDemographic,
            topic_ids: settings.topicIds.length > 0 ? settings.topicIds : null,
            report_segment_ids: settings.segmentIds.length > 0 ? settings.segmentIds : null
          };
          
          await dispatch(updateSurveyAnalysisQuestion({
            questionId: existingQuestion.id as string,
            questionData: updateData
          })).unwrap();
        } else {
          // Add new question
          await dispatch(createSurveyAnalysisQuestion({
            survey_analysis_id: analysisId,
            question_id: questionId,
            chart_type_id: settings.chartTypeId,
            sort_by_value: settings.sortByValue,
            is_demographic: settings.isDemographic,
            topic_ids: settings.topicIds.length > 0 ? settings.topicIds : null,
            report_segment_ids: settings.segmentIds.length > 0 ? settings.segmentIds : null
          })).unwrap();
        }
      }

      // Remove questions
      for (const existingQuestionId of currentQuestionIds) {
        if (!selectedQuestions.includes(existingQuestionId)) {
          const questionToRemove = currentAnalysis.analysis_questions?.find(
            aq => aq.question.id === existingQuestionId
          );
          if (questionToRemove?.id) {
            await dispatch(deleteSurveyAnalysisQuestion(questionToRemove.id)).unwrap();
          }
        }
      }

      // Refresh analysis to get updated analysis questions
      const updatedAnalysisResponse = await dispatch(fetchSurveyAnalysisById({ 
        analysisId, 
        forceRefresh: true 
      })).unwrap();
      
      // Now handle filters with the updated analysis
      const hasFilterData = formData.analysisQuestionId && filterCriteria.values.length > 0;
      const existingFilters: SurveyAnalysisFilter[] = updatedAnalysisResponse.filters || [];
      
      if (hasFilterData) {
        // We have filter data to save
        if (existingFilters.length > 0) {
          // Update existing filter(s)
          for (const filter of existingFilters) {
            // If this is the filter for our selected analysis question, update it
            if (filter.survey_analysis_question_id === formData.analysisQuestionId) {
              await dispatch(updateSurveyAnalysisFilter({
                filterId: filter.id,
                filterData: {
                  criteria: filterCriteria.values.map(value => ({ value }))
                }
              })).unwrap();
            } else {
              // If this is a different filter, delete it (we only support one filter at a time in the UI)
              await dispatch(deleteSurveyAnalysisFilter(filter.id)).unwrap();
            }
          }
          
          // If we didn't find a filter for this analysis question, create a new one
          if (!existingFilters.some(f => f.survey_analysis_question_id === formData.analysisQuestionId)) {
            await dispatch(createSurveyAnalysisFilter({
              survey_analysis_id: analysisId,
              survey_analysis_question_id: formData.analysisQuestionId,
              criteria: filterCriteria.values.map(value => ({ value }))
            })).unwrap();
          }
        } else {
          // No existing filters, create a new one
          await dispatch(createSurveyAnalysisFilter({
            survey_analysis_id: analysisId,
            survey_analysis_question_id: formData.analysisQuestionId,
            criteria: filterCriteria.values.map(value => ({ value }))
          })).unwrap();
        }
      } else if (existingFilters.length > 0) {
        // No filter data but we have existing filters, delete them all
        await Promise.all(
          existingFilters.map(filter => 
            dispatch(deleteSurveyAnalysisFilter(filter.id)).unwrap()
          )
        );
      }

      setSuccess(true);
      setSnackbar({
        open: true,
        message: 'Survey analysis updated successfully!',
        severity: 'success'
      });

      // Navigate back after success
      setTimeout(() => {
        navigate(surveyId ? `${PATHS.PUBLIC.SURVEYS_V2.path}/${surveyId}` : PATHS.PUBLIC.SURVEYS_V2.path);
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

  const handleCancel = () => navigate(-1);
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  // Loading state
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

  // Error state
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

  // Get sorted questions
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
          {/* Analysis Details Section */}
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

            <FormControl fullWidth margin="normal">
              <InputLabel id="filter-question-label">Filter Question (Optional)</InputLabel>
              <Select
                labelId="filter-question-label"
                id="filter-question-select"
                value={formData.analysisQuestionId}
                onChange={handleFilterQuestionChange}
                label="Filter Question (Optional)"
                disabled={isSubmitting || analysisQuestionsForFiltering.length === 0}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {analysisQuestionsForFiltering.map((analysisQuestion) => (
                  <MenuItem key={analysisQuestion.id} value={analysisQuestion.id as string}>
                    {analysisQuestion.question.title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select a demographic question to filter analysis results</FormHelperText>
            </FormControl>
            
            {formData.analysisQuestionId && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Filter Criteria Values
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <TextField
                    name="newFilterValue"
                    label="Add Filter Value"
                    value={filterCriteria.newValue}
                    onChange={handleFilterValueChange}
                    sx={{ flexGrow: 1, mr: 1 }}
                    disabled={isSubmitting}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddFilterValue}
                    disabled={isSubmitting || !filterCriteria.newValue.trim()}
                    sx={{ mt: 1 }}
                  >
                    Add
                  </Button>
                </Box>
                
                {filterCriteria.values.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {filterCriteria.values.map((value, index) => (
                      <Chip
                        key={index}
                        label={value}
                        onDelete={() => handleRemoveFilterValue(value)}
                        disabled={isSubmitting}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    No filter values added yet. Add at least one value to enable filtering.
                  </Typography>
                )}
                
                <FormHelperText>
                  Add one or more values to filter on. Records matching any of these values will be included.
                </FormHelperText>
              </Box>
            )}
          </Box>
          
          {/* Questions Section */}
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
                    isDemographic: false,
                    topicIds: [],
                    segmentIds: []
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
                        <QuestionSettingsPanel
                          questionId={questionId}
                          settings={settings}
                          chartTypes={chartTypes}
                          topics={topics}
                          segments={segments}
                          isSubmitting={isSubmitting}
                          chartTypesLoading={chartTypesLoading}
                          topicsLoading={topicsLoading}
                          segmentsLoading={segmentsLoading}
                          onChartTypeChange={handleChartTypeChange}
                          onSortByValueChange={handleSortByValueChange}
                          onDemographicChange={handleDemographicChange}
                          onTopicChange={handleTopicChange}
                          onSegmentChange={handleSegmentChange}
                        />
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
          
          {/* Action Buttons */}
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