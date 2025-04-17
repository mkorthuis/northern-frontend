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
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useSurveyTwo from '../hooks/useSurveyTwo';
import { PATHS } from '@/routes/paths';
import AddQuestionForm from './AddQuestionForm';
import QuestionTopicsManager from './QuestionTopicsManager';
import { Survey, SurveyQuestion } from '@/store/slices/surveySlice';
import { getQuestionTypeById, QUESTION_TYPES } from '@/constants/questionTypes';

// Extended question type that includes type_id and potentially nested question data
interface ExtendedSurveyQuestion extends Omit<SurveyQuestion, 'type_id'> {
  type_id?: number;
  question?: SurveyQuestion; // For nested question structure from API
  surveyId?: string;
}

const CreateSurvey: React.FC = () => {
  // Step handling
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Survey Details', 'Add Questions', 'Manage Topics'];

  // Survey details form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  
  // Survey questions state
  const [questions, setQuestions] = useState<ExtendedSurveyQuestion[]>([]);
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  // Notification state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const navigate = useNavigate();
  const { 
    addSurvey, 
    createSurveyLoading, 
    addQuestionToSurvey,
    addQuestionLoading,
    LoadingState 
  } = useSurveyTwo();
  
  // Check if operations are in progress
  const isCreateLoading = createSurveyLoading === LoadingState.LOADING;
  const isAddQuestionLoading = addQuestionLoading === LoadingState.LOADING;
  const isAnyLoading = isCreateLoading || isAddQuestionLoading;

  // Effect to log added questions for debugging
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

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSurveyDetails()) {
      return;
    }

    try {
      const newSurvey = {
        title,
        description,
        is_active: true, // Set surveys to active by default
      };

      const resultAction = await addSurvey(newSurvey);
      
      if (resultAction.meta.requestStatus === 'fulfilled') {
        setSnackbarMessage('Survey created successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Store the created survey for adding questions
        setCurrentSurvey(resultAction.payload);
        
        // Move to the questions step
        setActiveStep(1);
      } else {
        setSnackbarMessage('Failed to create survey');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage('An error occurred while creating the survey');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleAddQuestion = async (questionData: ExtendedSurveyQuestion) => {
    if (!currentSurvey?.id) {
      setSnackbarMessage('No survey found to add questions to');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      // Store question data before sending to API for comparison
      const originalQuestionData = { ...questionData };
      console.log('Sending question data:', originalQuestionData);
      
      // Ensure type_id is always set before sending to API
      const apiQuestionData: SurveyQuestion = {
        ...questionData,
        type_id: questionData.type_id || (questionData.type?.id as number),
      };
      
      const resultAction = await addQuestionToSurvey(currentSurvey.id, apiQuestionData);
      
      if (resultAction.meta.requestStatus === 'fulfilled') {
        // Log the response to help debug
        console.log('API response:', resultAction.payload);
        
        // Add the new question to our local state
        const addedQuestion = resultAction.payload as ExtendedSurveyQuestion;
        
        // Store the complete question data, properly handling the nested structure
        setQuestions(prev => [...prev, addedQuestion]);
        
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

  const handleFinish = () => {
    navigate(PATHS.PUBLIC.SURVEYS_V2.path);
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

  // Render the survey details form (step 1)
  const renderSurveyDetailsForm = () => {
    return (
      <Box component="form" onSubmit={handleCreateSurvey} sx={{ mt: 3 }}>
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
          disabled={isCreateLoading}
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
          disabled={isCreateLoading}
        />
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={handleCancel}
            disabled={isCreateLoading}
          >
            Cancel
          </Button>
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isCreateLoading}
            startIcon={isCreateLoading ? <CircularProgress size={20} /> : null}
          >
            {isCreateLoading ? 'Creating...' : 'Continue to Questions'}
          </Button>
        </Box>
      </Box>
    );
  };

  // Render the questions step (step 2)
  const renderQuestionsStep = () => {
    return (
      <Box sx={{ mt: 3 }}>
        {questions.length > 0 ? (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Questions ({questions.length})
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              {questions.map((question, index) => {
                // Extract question data, handling the nested structure
                const { 
                  title, 
                  description, 
                  external_question_id, 
                  order_index, 
                  options, 
                  typeName 
                } = getQuestionData(question);
                
                return (
                  <Box key={index} sx={{ mb: 2, p: 2, borderBottom: index < questions.length - 1 ? '1px solid #eee' : 'none' }}>
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
            disabled={isAnyLoading || !currentSurvey?.id}
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
        
        {currentSurvey?.id ? (
          <QuestionTopicsManager surveyId={currentSurvey.id} />
        ) : (
          <Alert severity="warning" sx={{ mb: 3 }}>
            You need to create a survey before adding topics.
          </Alert>
        )}

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
            onClick={handleFinish} 
            variant="contained" 
            color="primary"
            disabled={isAnyLoading}
          >
            Finish
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Survey
        </Typography>
        
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

export default CreateSurvey; 