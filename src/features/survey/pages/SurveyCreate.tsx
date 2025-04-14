import React, { useState } from 'react';
import { 
  Container, Typography, Paper, Box, CircularProgress, 
  Breadcrumbs, Link as MuiLink, TextField, Button, 
  FormControlLabel, Switch, Grid, Snackbar, Alert,
  FormControl, InputLabel, Select, MenuItem,
  Divider
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import useSurvey from '../hooks/useSurvey';
import { ArrowBack, Save } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Survey } from '@/store/slices/surveySlice';

const defaultSection = {
  title: '',
  description: '',
  order_index: 0,
  questions: []
};

const defaultQuestion = {
  title: '',
  description: '',
  is_required: false,
  order_index: 0,
  type_id: 1, // Default to text type
  options: []
};

const SurveyCreate: React.FC = () => {
  const navigate = useNavigate();
  const { addSurvey, createSurveyLoading } = useSurvey();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
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
      // Get current user ID (This would normally come from authentication)
      // const createdBy = 'user123'; // Placeholder - would come from auth - No longer needed
      
      const surveyData: Survey = {
        title,
        description: description || null,
        is_active: isActive,
        survey_start: startDate ? startDate.toISOString() : null,
        survey_end: endDate ? endDate.toISOString() : null,
        sections: [],
        questions: []
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

      {/* Error and Success messages */}
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
          Survey created successfully! Redirecting to survey details...
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SurveyCreate; 