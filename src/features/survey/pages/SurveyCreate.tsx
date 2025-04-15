import React, { useState } from 'react';
import { 
  Container, Typography, Paper, Box, CircularProgress, 
  Breadcrumbs, Link as MuiLink, TextField, Button, 
  FormControlLabel, Switch, Grid, Snackbar, Alert,
  Divider, Collapse
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import useSurvey from '../hooks/useSurvey';
import { ArrowBack, Save, ContentPaste, Upload } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Survey, SurveyQuestion } from '@/store/slices/surveySlice';

// Import components
import JsonInputPanel from '../components/JsonInputPanel';
import CsvUploadPanel from '../components/CsvUploadPanel';
import QuestionSummary from '../components/QuestionSummary';

/**
 * Survey creation page component
 */
const SurveyCreate: React.FC = () => {
  const navigate = useNavigate();
  const { addSurvey, createSurveyLoading } = useSurvey();
  
  // Basic survey info state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // UI state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showJsonInput, setShowJsonInput] = useState(false);
  const [showCsvUpload, setShowCsvUpload] = useState(false);
  
  // Questions state
  const [parsedQuestions, setParsedQuestions] = useState<SurveyQuestion[]>([]);
  
  // Handler for adding questions from JSON or CSV
  const handleQuestionsAdded = (questions: SurveyQuestion[]) => {
    setParsedQuestions(prevQuestions => [...prevQuestions, ...questions]);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };
  
  // Handler for clearing all questions
  const handleClearQuestions = () => {
    setParsedQuestions([]);
  };
  
  // Form submission handler
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Basic validation
    if (!title.trim()) {
      setError('Survey title is required');
      return;
    }
    
    // Check that end date is after start date
    if (startDate && endDate && endDate < startDate) {
      setError('End date must be after start date');
      return;
    }
    
    try {
      const surveyData: Survey = {
        title,
        description: description || null,
        is_active: isActive,
        survey_start: startDate ? startDate.toISOString() : null,
        survey_end: endDate ? endDate.toISOString() : null,
        sections: [],
        questions: parsedQuestions
      };
      
      const result = await addSurvey(surveyData);
      
      if (result.meta.requestStatus === 'fulfilled') {
        setSuccess(true);
        // Navigate to the detail page after a short delay
        setTimeout(() => {
          navigate(PATHS.PUBLIC.SURVEY_DETAIL.path.replace(':id', result.payload.id));
        }, 1500);
      } else {
        setError('Failed to create survey. Please try again.');
      }
    } catch (err) {
      console.error('Error creating survey:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <MuiLink component={Link} to={PATHS.PUBLIC.SURVEYS.path} underline="hover" color="inherit">
            Surveys
          </MuiLink>
          <Typography color="text.primary">Create New Survey</Typography>
        </Breadcrumbs>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button 
            component={Link} 
            to={PATHS.PUBLIC.SURVEYS.path}
            startIcon={<ArrowBack />} 
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            Create New Survey
          </Typography>
        </Box>
      </Box>

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Information Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              id="title"
              name="title"
              label="Survey Title"
              fullWidth
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              helperText="A clear, descriptive title for your survey"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              id="description"
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              helperText="Provide details about the purpose of this survey"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  helperText: 'When this survey becomes available'
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  helperText: 'When this survey will close'
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch 
                  checked={isActive} 
                  onChange={(e) => setIsActive(e.target.checked)}
                  color="primary"
                />
              }
              label="Active Survey"
            />
            <Typography variant="caption" color="textSecondary" display="block">
              If active, the survey will be available for responses (within the date range, if specified)
            </Typography>
          </Grid>
          
          {/* Questions Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Questions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ContentPaste />}
                onClick={() => {
                  setShowJsonInput(!showJsonInput);
                  if (showCsvUpload) setShowCsvUpload(false);
                }}
              >
                {showJsonInput ? 'Hide JSON Input' : 'Paste Question JSON'}
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Upload />}
                onClick={() => {
                  setShowCsvUpload(!showCsvUpload);
                  if (showJsonInput) setShowJsonInput(false);
                }}
              >
                {showCsvUpload ? 'Hide CSV Upload' : 'Upload Questions CSV'}
              </Button>
              
              {parsedQuestions.length > 0 && (
                <Typography variant="body2" sx={{ ml: 'auto', alignSelf: 'center' }}>
                  <strong>{parsedQuestions.length}</strong> questions added
                </Typography>
              )}
            </Box>
            
            {/* JSON Input Panel */}
            <Collapse in={showJsonInput}>
              <JsonInputPanel onQuestionsAdded={handleQuestionsAdded} />
            </Collapse>
            
            {/* CSV Upload Panel */}
            <Collapse in={showCsvUpload}>
              <CsvUploadPanel onQuestionsAdded={handleQuestionsAdded} />
            </Collapse>
            
            {/* Questions Summary */}
            <QuestionSummary 
              questions={parsedQuestions} 
              onClearQuestions={handleClearQuestions} 
            />
          </Grid>
          
          {/* Form Actions */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button 
                variant="outlined"
                component={Link}
                to={PATHS.PUBLIC.SURVEYS.path}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<Save />}
                disabled={createSurveyLoading || !title.trim()}
              >
                {createSurveyLoading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Creating...
                  </>
                ) : 'Create Survey'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Notifications */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          {createSurveyLoading ? 'Creating survey...' : 
            (parsedQuestions.length > 0 && !error ? 
              `${parsedQuestions.length} questions ready to be added to survey` : 
              'Survey created successfully! Redirecting to survey details...')}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SurveyCreate; 