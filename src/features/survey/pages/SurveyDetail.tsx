import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Paper, Box, CircularProgress, 
  Breadcrumbs, Link as MuiLink, Chip, Grid, Card, CardContent,
  Divider, Button, Switch, FormControlLabel, Fab, IconButton
} from '@mui/material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import useSurvey from '../hooks/useSurvey';
import { ArrowBack, Edit, Assessment, Add, CloudUpload } from '@mui/icons-material';
import { format } from 'date-fns';
import AddQuestionForm from '../components/AddQuestionForm';
import EditQuestionForm from '../components/EditQuestionForm';
import SurveyResponseUpload from '../components/SurveyResponseUpload';
import { getQuestionTypeById } from '@/constants/questionTypes';
import { SurveyQuestion } from '@/store/slices/surveySlice';

const SurveyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    currentSurvey, 
    surveyByIdLoading, 
    error, 
    getSurveyById,
    editSurvey,
    addQuestionToSurvey,
    editQuestion,
    removeQuestion,
    addQuestionLoading,
    updateQuestionLoading,
    deleteQuestionLoading
  } = useSurvey();
  
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
  const [showUploadResponses, setShowUploadResponses] = useState(false);

  useEffect(() => {
    if (id) {
      getSurveyById(id, true);
    }
  }, [getSurveyById, id]);

  const handleViewResponses = () => {
    if (id) {
      navigate(PATHS.PUBLIC.SURVEY_RESPONSES.path.replace(':id', id));
    }
  };

  const handleToggleActive = async () => {
    if (currentSurvey && id) {
      await editSurvey(id, { is_active: !currentSurvey.is_active });
      getSurveyById(id, true);
    }
  };

  const handleAddQuestion = async (surveyId: string, questionData: any) => {
    await addQuestionToSurvey(surveyId, questionData);
    // Refresh survey data
    getSurveyById(surveyId, true);
    // Hide the form
    setShowAddQuestion(false);
  };

  const handleShowAddQuestion = (sectionId?: string) => {
    setEditingQuestion(null);
    setActiveSectionId(sectionId || null);
    setShowAddQuestion(true);
  };

  const handleCancelAddQuestion = () => {
    setShowAddQuestion(false);
    setActiveSectionId(null);
  };

  const handleEditQuestion = (question: SurveyQuestion) => {
    setShowAddQuestion(false);
    setEditingQuestion(question);
  };

  const handleUpdateQuestion = async (questionId: string, questionData: Partial<SurveyQuestion>) => {
    await editQuestion(questionId, questionData);
    // Refresh survey data
    if (id) {
      await getSurveyById(id, true);
    }
    // Close edit form
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = async (surveyId: string, questionId: string) => {
    await removeQuestion(surveyId, questionId);
    // Refresh survey data
    await getSurveyById(surveyId, true);
    // Close edit form
    setEditingQuestion(null);
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
  };

  // Survey Response Upload handlers
  const handleShowUploadResponses = () => {
    setShowUploadResponses(true);
  };

  const handleCancelUpload = () => {
    setShowUploadResponses(false);
  };

  const handleUploadComplete = (data: any) => {
    console.log('Upload complete with data:', data);
    // Here you would typically process the data or update the store
    // For now we just log it and close the upload component after a delay
    setTimeout(() => {
      setShowUploadResponses(false);
    }, 2000);
  };

  if (surveyByIdLoading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error" variant="h6">Error: {error}</Typography>
      </Container>
    );
  }

  if (!currentSurvey) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6">Survey not found</Typography>
      </Container>
    );
  }

  const renderQuestionItem = (question: SurveyQuestion, index: number, sectionId?: string) => (
    <Paper key={question.id} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box flex={1}>
          <Typography variant="subtitle1">
            {index + 1}. {question.title}
            {question.is_required && (
              <Chip size="small" label="Required" color="error" sx={{ ml: 1 }} />
            )}
          </Typography>
          {question.description && (
            <Typography variant="body2" color="textSecondary">
              {question.description}
            </Typography>
          )}
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Type: {getQuestionTypeById(question.type_id).name}
          </Typography>
          {question.options && question.options.length > 0 && (
            <Box mt={1}>
              <Typography variant="body2" color="textSecondary">Options:</Typography>
              <ul style={{ marginTop: 4 }}>
                {question.options.map((option) => (
                  <li key={`${question.id}-${option.order_index}`}>
                    <Typography variant="body2">
                      {option.text}
                      {option.is_other_option && (
                        <Chip size="small" label="Other" sx={{ ml: 1 }} />
                      )}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </Box>
        <IconButton 
          size="small" 
          color="primary" 
          onClick={() => handleEditQuestion(question)}
          sx={{ ml: 1 }}
        >
          <Edit />
        </IconButton>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <MuiLink component={Link} to={PATHS.PUBLIC.SURVEYS.path} underline="hover" color="inherit">
            Surveys
          </MuiLink>
          <Typography color="text.primary">{currentSurvey.title}</Typography>
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
            {currentSurvey.title}
          </Typography>
        </Box>
        <Box>
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<CloudUpload />} 
            onClick={handleShowUploadResponses}
            sx={{ mr: 1 }}
          >
            Upload Responses
          </Button>
          <Button 
            variant="contained" 
            color="info" 
            startIcon={<Assessment />} 
            onClick={handleViewResponses}
            sx={{ ml: 1 }}
          >
            View Responses
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Survey Information</Typography>
          <FormControlLabel
            control={
              <Switch 
                checked={currentSurvey.is_active || false} 
                onChange={handleToggleActive}
                color="success"
              />
            }
            label={currentSurvey.is_active ? "Active" : "Inactive"}
          />
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">Description</Typography>
            <Typography variant="body1" paragraph>
              {currentSurvey.description || "No description provided"}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Created At</Typography>
                <Typography variant="body1">
                  {currentSurvey.created_at ? 
                    format(new Date(currentSurvey.created_at), 'MMM d, yyyy HH:mm') : 
                    'Unknown'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Updated At</Typography>
                <Typography variant="body1">
                  {currentSurvey.updated_at ? 
                    format(new Date(currentSurvey.updated_at), 'MMM d, yyyy HH:mm') : 
                    'Unknown'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Start Date</Typography>
                <Typography variant="body1">
                  {currentSurvey.survey_start ? 
                    format(new Date(currentSurvey.survey_start), 'MMM d, yyyy') : 
                    'Not set'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">End Date</Typography>
                <Typography variant="body1">
                  {currentSurvey.survey_end ? 
                    format(new Date(currentSurvey.survey_end), 'MMM d, yyyy') : 
                    'Not set'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Survey Response Upload Component */}
      {showUploadResponses && id && (
        <SurveyResponseUpload
          surveyId={id}
          onUploadComplete={handleUploadComplete}
          onCancel={handleCancelUpload}
        />
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Survey Structure</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleShowAddQuestion()}
        >
          Add Question
        </Button>
      </Box>
      
      {/* Show Add Question Form if needed */}
      {showAddQuestion && id && (
        <AddQuestionForm
          surveyId={id}
          onAddQuestion={handleAddQuestion}
          onCancel={handleCancelAddQuestion}
          sectionId={activeSectionId || undefined}
          isLoading={addQuestionLoading}
        />
      )}

      {/* Show Edit Question Form if needed */}
      {editingQuestion && id && (
        <EditQuestionForm
          surveyId={id}
          question={editingQuestion}
          onUpdateQuestion={handleUpdateQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onCancel={handleCancelEdit}
          isUpdateLoading={updateQuestionLoading}
          isDeleteLoading={deleteQuestionLoading}
        />
      )}
      
      {/* Show sections if they exist */}
      {currentSurvey.sections && currentSurvey.sections.length > 0 ? (
        currentSurvey.sections.map((section) => (
          <Card key={section.id} sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" gutterBottom>
                  Section: {section.title}
                </Typography>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => handleShowAddQuestion(section.id)}
                >
                  Add Question
                </Button>
              </Box>
              {section.description && (
                <Typography variant="body2" color="textSecondary" paragraph>
                  {section.description}
                </Typography>
              )}
              
              {section.questions && section.questions.length > 0 ? (
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Questions in this section
                  </Typography>
                  {section.questions.map((question, index) => renderQuestionItem(question, index, section.id))}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No questions in this section yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        ))
      ) : currentSurvey.questions && currentSurvey.questions.length > 0 ? (
        // Show questions directly if they exist but are not in sections
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Questions
            </Typography>
            
            {currentSurvey.questions.map((question, index) => renderQuestionItem(question, index))}
          </CardContent>
        </Card>
      ) : (
        // No questions or sections yet
        <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary" paragraph>
            This survey doesn't have any questions yet.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default SurveyDetail; 