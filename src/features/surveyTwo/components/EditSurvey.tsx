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
  Stepper,
  Step,
  StepLabel,
  Divider,
  LinearProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import useSurveyTwo from '../hooks/useSurveyTwo';
import { PATHS } from '@/routes/paths';
import AddQuestionForm from './AddQuestionForm';
import EditQuestionForm from './EditQuestionForm';
import QuestionTopicsManager from './QuestionTopicsManager';
import ReportSegmentManager from './ReportSegmentManager';
import { Survey, SurveyQuestion } from '@/store/slices/surveySlice';
import { getQuestionTypeById, QUESTION_TYPES } from '@/constants/questionTypes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchSurveyById as fetchSurveyByIdAction,
  updateSurvey as updateSurveyAction,
  updateQuestion as updateQuestionAction,
  deleteQuestion as deleteQuestionAction,
} from '@/store/slices/surveySlice';

// Fix the ExtendedSurveyQuestion interface to ensure compatibility with SurveyQuestion
interface ExtendedSurveyQuestion extends Omit<SurveyQuestion, 'type_id'> {
  type_id?: number;
  question?: SurveyQuestion; // For nested question structure from API
  surveyId?: string;
}

const EditSurvey: React.FC = () => {
  // Get survey ID from URL params
  const { surveyId } = useParams<{ surveyId: string }>();
  
  // Step handling
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Survey Details', 'Manage Questions', 'Manage Topics', 'Report Segments'];

  // Survey details form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  // Survey questions state
  const [questions, setQuestions] = useState<ExtendedSurveyQuestion[]>([]);
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Notification state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');

  const navigate = useNavigate();
  
  // Update the useSurveyTwo hook destructuring to match what's available
  const { 
    LoadingState,
    addQuestionToSurvey,
    addQuestionLoading,
  } = useSurveyTwo();

  // Add these from Redux directly
  const dispatch = useAppDispatch();
  const { currentSurvey: surveyFromHook, loadingStates } = useAppSelector((state) => state.survey);

  // Replace the loading states using loadingStates from Redux
  const surveyLoading = loadingStates.survey;
  const updateSurveyLoading = loadingStates.updateSurvey;
  const updateQuestionLoading = loadingStates.updateQuestion;
  const deleteQuestionLoading = loadingStates.deleteQuestion;

  // Memoize the fetchSurveyById function so it doesn't change on every render
  const fetchSurveyById = React.useCallback(
    (params: { surveyId: string, forceRefresh?: boolean }) => {
      return dispatch(fetchSurveyByIdAction(params));
    },
    [dispatch]
  );

  // Similarly, memoize the other action dispatch functions
  const updateSurvey = React.useCallback(
    (params: { surveyId: string, surveyData: Partial<Survey> }) => {
      return dispatch(updateSurveyAction(params));
    },
    [dispatch]
  );

  const updateQuestion = React.useCallback(
    (params: { questionId: string, questionData: Partial<SurveyQuestion> }) => {
      return dispatch(updateQuestionAction(params));
    },
    [dispatch]
  );

  const deleteQuestion = React.useCallback(
    (params: { surveyId: string, questionId: string }) => {
      return dispatch(deleteQuestionAction(params));
    },
    [dispatch]
  );
  
  // Check if operations are in progress
  const isUpdateLoading = updateSurveyLoading === LoadingState.LOADING;
  const isFetchLoading = surveyLoading === LoadingState.LOADING;
  const isAddQuestionLoading = addQuestionLoading === LoadingState.LOADING;
  const isUpdateQuestionLoading = updateQuestionLoading === LoadingState.LOADING;
  const isDeleteQuestionLoading = deleteQuestionLoading === LoadingState.LOADING;
  
  const isAnyLoading = isUpdateLoading || isFetchLoading || isAddQuestionLoading || 
                       isUpdateQuestionLoading || isDeleteQuestionLoading;

  // Fix the useEffect to only run when surveyId changes or on mount
  useEffect(() => {
    if (surveyId) {
      // Only force refresh on initial load, not on every render
      fetchSurveyById({ surveyId, forceRefresh: true });
    }
  }, [surveyId, fetchSurveyById]); // Now fetchSurveyById is stable and won't cause re-renders

  // Fix the useEffect that updates local state from survey data
  useEffect(() => {
    if (surveyFromHook) {
      setCurrentSurvey(surveyFromHook);
      setTitle(surveyFromHook.title || '');
      setDescription(surveyFromHook.description || '');
      setIsActive(surveyFromHook.is_active || false);
      
      // Only set questions on initial load or if our local questions array is empty
      // This prevents overwriting questions that were just added
      if (surveyFromHook.questions && (questions.length === 0 || !questions.some(q => q.id))) {
        setQuestions(surveyFromHook.questions);
      }
    }
  }, [surveyFromHook, questions]);

  // Effect to log questions for debugging
  useEffect(() => {
    if (questions.length > 0) {
      console.log('Current questions:', questions);
    }
  }, [questions]);

  const validateSurveyDetails = () => {
    let isValid = true;

    // Validate title
    if (!title.trim()) {
      setTitleError('Title is required');
      isValid = false;
    } else if (title.length > 100) {
      setTitleError('Title must be less than 100 characters');
      isValid = false;
    } else {
      setTitleError('');
    }

    // Validate description (optional but with limit)
    if (description.length > 500) {
      setDescriptionError('Description must be less than 500 characters');
      isValid = false;
    } else {
      setDescriptionError('');
    }

    return isValid;
  };

  const handleUpdateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSurveyDetails() || !surveyId) {
      return;
    }

    try {
      const surveyData = {
        title,
        description,
        is_active: isActive,
      };

      const resultAction = await updateSurvey({ surveyId, surveyData });
      
      if (resultAction.meta.requestStatus === 'fulfilled') {
        setSnackbarMessage('Survey updated successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Store the updated survey
        setCurrentSurvey(resultAction.payload);
        
        // Move to the questions step
        setActiveStep(1);
      } else {
        setSnackbarMessage('Failed to update survey');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage('An error occurred while updating the survey');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Fix the handleAddQuestion function to avoid adding duplicates
  const handleAddQuestion = async (questionData: ExtendedSurveyQuestion) => {
    if (!surveyId) {
      setSnackbarMessage('No survey found to add questions to');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      // Store question data before sending to API for comparison
      const originalQuestionData = { ...questionData };
      console.log('Sending question data:', originalQuestionData);
      
      // Ensure type_id is set before sending to API
      const apiQuestionData = {
        ...questionData,
        type_id: questionData.type_id || questionData.type.id,
      } as SurveyQuestion;
      
      const resultAction = await addQuestionToSurvey(surveyId, apiQuestionData);
      
      if (resultAction.meta.requestStatus === 'fulfilled') {
        // After successfully adding the question, refresh the survey data
        await fetchSurveyById({ surveyId, forceRefresh: true });
        
        setSnackbarMessage('Question added successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Hide the question form
        setShowQuestionForm(false);
      } else {
        setSnackbarMessage('Failed to add question');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage('An error occurred while adding the question');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleUpdateQuestion = async (questionId: string, questionData: Partial<SurveyQuestion>) => {
    if (!questionId) {
      setSnackbarMessage('Question ID is required to update');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      const resultAction = await updateQuestion({ questionId, questionData });
      
      if (resultAction.meta.requestStatus === 'fulfilled') {
        // Refresh the survey data from the server
        if (surveyId) {
          await fetchSurveyById({ surveyId, forceRefresh: true });
        }
        
        setSnackbarMessage('Question updated successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Close the edit form
        setEditingQuestionId(null);
      } else {
        setSnackbarMessage('Failed to update question');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage('An error occurred while updating the question');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!surveyId || !questionId) {
      setSnackbarMessage('Survey ID and Question ID are required to delete');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      const resultAction = await deleteQuestion({ surveyId, questionId });
      
      if (resultAction.meta.requestStatus === 'fulfilled') {
        // Remove the question from our local state
        setQuestions(prev => prev.filter(q => q.id !== questionId));
        
        setSnackbarMessage('Question deleted successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Failed to delete question');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage('An error occurred while deleting the question');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleFinish = () => {
    // If we have a survey ID, navigate to view that specific survey
    if (surveyId) {
      // Assuming there's a route for viewing a single survey
      navigate(`${PATHS.PUBLIC.SURVEYS_V2.path}/${surveyId}`);
    } else {
      // Otherwise just go back to the surveys list
      navigate(PATHS.PUBLIC.SURVEYS_V2.path);
    }
  };

  const handleCancel = () => {
    navigate(PATHS.PUBLIC.SURVEYS_V2.path);
  };

  // Helper function to get question type name
  const getQuestionTypeName = (typeId?: number) => {
    if (!typeId) return 'Unknown';
    const questionType = getQuestionTypeById(typeId);
    return questionType ? questionType.name : 'Unknown';
  };

  // Helper function to extract question data - handles nested structure
  const getQuestionData = (question: ExtendedSurveyQuestion) => {
    // If the response has a nested question property, use that data
    const questionData = question.question || question;
    
    // Get the type information from the appropriate location
    const typeInfo = question.type || questionData.type;
    const typeId = question.type_id || (typeInfo && typeof typeInfo === 'object' ? typeInfo.id : undefined);
    
    return {
      title: questionData.title || '',
      description: questionData.description || '',
      external_question_id: questionData.external_question_id || '',
      order_index: questionData.order_index !== undefined ? questionData.order_index : 0,
      options: questionData.options || [],
      typeName: typeInfo && typeof typeInfo === 'object' ? typeInfo.name : getQuestionTypeName(typeId),
      typeId
    };
  };

  // Render loading state
  if (isFetchLoading && !currentSurvey) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Loading Survey...
          </Typography>
          <LinearProgress />
        </Paper>
      </Container>
    );
  }

  // Render not found message if survey ID is invalid
  if (!isFetchLoading && !currentSurvey && surveyId) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom color="error">
            Survey Not Found
          </Typography>
          <Typography variant="body1">
            The survey you're trying to edit could not be found. It may have been deleted or you don't have permission to access it.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate(PATHS.PUBLIC.SURVEYS_V2.path)}
            sx={{ mt: 3 }}
          >
            Return to Surveys
          </Button>
        </Paper>
      </Container>
    );
  }

  // Render the survey details form (step 1)
  const renderSurveyDetailsForm = () => {
    return (
      <Box component="form" onSubmit={handleUpdateSurvey} sx={{ mt: 3 }}>
        <TextField
          label="Survey Title"
          variant="outlined"
          fullWidth
          required
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={!!titleError}
          helperText={titleError || 'Enter a descriptive title for your survey'}
          disabled={isUpdateLoading}
        />
        
        <TextField
          label="Description"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={!!descriptionError}
          helperText={descriptionError || 'Provide details about the purpose of this survey (optional)'}
          disabled={isUpdateLoading}
        />
        
        <Button
          variant="outlined"
          color={isActive ? "success" : "error"}
          onClick={() => setIsActive(!isActive)}
          sx={{ mt: 2 }}
          disabled={isUpdateLoading}
        >
          Status: {isActive ? "Active" : "Inactive"}
        </Button>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={handleCancel}
            disabled={isUpdateLoading}
          >
            Cancel
          </Button>
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isUpdateLoading}
            startIcon={isUpdateLoading ? <CircularProgress size={20} /> : null}
          >
            {isUpdateLoading ? 'Updating...' : 'Continue to Questions'}
          </Button>
        </Box>
      </Box>
    );
  };

  // Render the questions management step (step 2)
  const renderQuestionsStep = () => {
    // Get the question being edited
    const editingQuestion = questions.find(q => q.id === editingQuestionId);

    return (
      <Box sx={{ mt: 3 }}>
        {editingQuestion ? (
          <EditQuestionForm
            question={editingQuestion as SurveyQuestion & { type_id?: number | undefined; type?: { id: number; name: string; } | undefined; }}
            onUpdateQuestion={handleUpdateQuestion}
            onCancel={() => setEditingQuestionId(null)}
            isLoading={isUpdateQuestionLoading}
          />
        ) : (
          <>
            {questions.length > 0 ? (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Questions ({questions.length})
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  {questions.map((question, index) => {
                    const { 
                      title, 
                      description, 
                      external_question_id, 
                      order_index, 
                      options, 
                      typeName 
                    } = getQuestionData(question);
                    
                    return (
                      <Box key={question.id || index} sx={{ mb: 2, p: 2, borderBottom: index < questions.length - 1 ? '1px solid #eee' : 'none' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {index + 1}. {title}
                        </Typography>
                        
                        {description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {description}
                          </Typography>
                        )}
                        
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          Type: {typeName} • 
                          ID: {external_question_id || 'None'} • 
                          Order: {order_index}
                        </Typography>
                        
                        {options && options.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" fontWeight="bold">
                              Options:
                            </Typography>
                            <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                              {options.map((option, i) => (
                                <li key={i}>
                                  <Typography variant="caption">
                                    {option.text} (Order: {option.order_index})
                                  </Typography>
                                </li>
                              ))}
                            </ul>
                          </Box>
                        )}
                        
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => setEditingQuestionId(question.id || null)}
                            disabled={isAnyLoading}
                          >
                            Edit
                          </Button>
                          
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="error"
                            onClick={() => question.id && handleDeleteQuestion(question.id)}
                            disabled={isAnyLoading || !question.id}
                          >
                            Delete
                          </Button>
                        </Box>
                      </Box>
                    );
                  })}
                </Paper>
              </Box>
            ) : (
              <Alert severity="info" sx={{ mb: 3 }}>
                No questions added yet. Click the button below to add your first question.
              </Alert>
            )}

            {showQuestionForm ? (
              <AddQuestionForm 
                onAddQuestion={handleAddQuestion} 
                onCancel={() => setShowQuestionForm(false)}
                isLoading={isAddQuestionLoading}
              />
            ) : (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setShowQuestionForm(true)}
                sx={{ mb: 3 }}
                disabled={isAnyLoading}
              >
                Add New Question
              </Button>
            )}
          </>
        )}

        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            onClick={() => setActiveStep(0)} 
            variant="outlined"
            disabled={isAnyLoading}
          >
            Back to Survey Details
          </Button>
          
          <Button 
            onClick={() => setActiveStep(2)} 
            variant="contained" 
            color="primary"
            disabled={isAnyLoading}
          >
            Continue to Topics
          </Button>
        </Box>
      </Box>
    );
  };

  // Render the topics management step (step 3)
  const renderTopicsStep = () => {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Manage Question Topics
        </Typography>
        
        <Typography variant="body2" paragraph>
          Topics help organize questions into related groups. You can assign topics to questions during analysis to create focused reports.
        </Typography>
        
        {surveyId && <QuestionTopicsManager surveyId={surveyId} />}

        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            onClick={() => setActiveStep(1)} 
            variant="outlined"
            disabled={isAnyLoading}
          >
            Back to Questions
          </Button>
          
          <Button 
            onClick={() => setActiveStep(3)} 
            variant="contained" 
            color="primary"
            disabled={isAnyLoading}
          >
            Continue to Report Segments
          </Button>
        </Box>
      </Box>
    );
  };

  // Render the report segments management step (step 4)
  const renderReportSegmentsStep = () => {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Manage Report Segments
        </Typography>
        
        <Typography variant="body2" paragraph>
          Report segments allow you to organize your analysis questions into logical sections when creating reports. Each segment creates a separate section in your reports.
        </Typography>
        
        {surveyId && <ReportSegmentManager surveyId={surveyId} />}

        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            onClick={() => setActiveStep(2)} 
            variant="outlined"
            disabled={isAnyLoading}
          >
            Back to Topics
          </Button>
          
          <Button 
            onClick={handleFinish} 
            variant="contained" 
            color="primary"
            disabled={isAnyLoading}
          >
            Save & Finish
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Survey
        </Typography>
        
        {isAnyLoading && <LinearProgress sx={{ mb: 2 }} />}
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === 0 && renderSurveyDetailsForm()}
        {activeStep === 1 && renderQuestionsStep()}
        {activeStep === 2 && renderTopicsStep()}
        {activeStep === 3 && renderReportSegmentsStep()}
      </Paper>
      
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditSurvey; 