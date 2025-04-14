import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Paper, Box, CircularProgress, 
  Breadcrumbs, Link as MuiLink, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip,
  Accordion, AccordionSummary, AccordionDetails, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions,
  IconButton, Tooltip, Grid
} from '@mui/material';
import { 
  ArrowBack, ExpandMore, Delete as DeleteIcon, 
  Visibility as VisibilityIcon 
} from '@mui/icons-material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import useSurvey from '../hooks/useSurvey';
import { format } from 'date-fns';
import { SurveyResponse, SurveyResponseAnswer } from '@/store/slices/surveySlice';

const SurveyResponses: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    currentSurvey,
    surveyResponses, 
    surveyByIdLoading,
    responsesLoading,
    error, 
    getSurveyById,
    getSurveyResponses,
    getSurveyResponse,
    deleteSurveyResponse
  } = useSurvey();

  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [responseToDelete, setResponseToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    if (id) {
      getSurveyById(id);
      getSurveyResponses(id, false, true);
    }
  }, [getSurveyById, getSurveyResponses, id]);

  const handleDeleteDialogOpen = (responseId: string) => {
    setResponseToDelete(responseId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setResponseToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (responseToDelete && id) {
      await deleteSurveyResponse(responseToDelete);
      handleDeleteDialogClose();
      // Refresh the responses list
      getSurveyResponses(id, false, true);
    }
  };

  const handleViewResponse = (response: SurveyResponse) => {
    setSelectedResponse(response);
  };

  const isLoading = surveyByIdLoading || responsesLoading;

  if (isLoading) {
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

  // Helper function to get question title by ID
  const getQuestionTitle = (questionId: string) => {
    // Check in the sections first
    if (currentSurvey.sections) {
      for (const section of currentSurvey.sections) {
        if (section.questions) {
          const question = section.questions.find(q => q.id === questionId);
          if (question) return question.title;
        }
      }
    }
    
    // Then check in direct questions
    if (currentSurvey.questions) {
      const question = currentSurvey.questions.find(q => q.id === questionId);
      if (question) return question.title;
    }
    
    return 'Unknown Question';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <MuiLink component={Link} to={PATHS.PUBLIC.SURVEYS.path} underline="hover" color="inherit">
            Surveys
          </MuiLink>
          <MuiLink 
            component={Link} 
            to={PATHS.PUBLIC.SURVEY_DETAIL.path.replace(':id', id!)} 
            underline="hover" 
            color="inherit"
          >
            {currentSurvey.title}
          </MuiLink>
          <Typography color="text.primary">Responses</Typography>
        </Breadcrumbs>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button 
            component={Link} 
            to={PATHS.PUBLIC.SURVEY_DETAIL.path.replace(':id', id!)}
            startIcon={<ArrowBack />} 
            sx={{ mr: 2 }}
          >
            Back to Survey
          </Button>
          <Typography variant="h4" component="h1">
            Survey Responses
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {currentSurvey.title}
        </Typography>
        {currentSurvey.description && (
          <Typography variant="body1" paragraph>
            {currentSurvey.description}
          </Typography>
        )}
      </Paper>

      {surveyResponses.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No responses have been submitted for this survey yet.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Response ID</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Respondent</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {surveyResponses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell>{response.id}</TableCell>
                  <TableCell>
                    {response.created_at ? 
                      format(new Date(response.created_at), 'MMM d, yyyy HH:mm') : 
                      'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={response.is_complete ? "Complete" : "Incomplete"} 
                      color={response.is_complete ? "success" : "warning"} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {response.respondent_id || 'Anonymous'}
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center">
                      <Tooltip title="View Response">
                        <IconButton 
                          color="primary"
                          onClick={() => handleViewResponse(response)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Response">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteDialogOpen(response.id!)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Response Details Dialog */}
      <Dialog
        open={!!selectedResponse}
        onClose={() => setSelectedResponse(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Response Details
          <Typography variant="subtitle2" color="textSecondary">
            ID: {selectedResponse?.id}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box mb={2}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Submitted</Typography>
                <Typography variant="body1">
                  {selectedResponse?.created_at ? 
                    format(new Date(selectedResponse.created_at), 'MMM d, yyyy HH:mm') : 
                    'Unknown'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                <Chip 
                  label={selectedResponse?.is_complete ? "Complete" : "Incomplete"} 
                  color={selectedResponse?.is_complete ? "success" : "warning"} 
                  size="small"
                />
              </Grid>
              {selectedResponse?.completed_at && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Completed At</Typography>
                  <Typography variant="body1">
                    {format(new Date(selectedResponse.completed_at), 'MMM d, yyyy HH:mm')}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Respondent</Typography>
                <Typography variant="body1">
                  {selectedResponse?.respondent_id || 'Anonymous'}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="h6" gutterBottom mt={2}>
            Answers
          </Typography>
          
          {selectedResponse?.answers && selectedResponse.answers.length > 0 ? (
            selectedResponse.answers.map((answer: SurveyResponseAnswer) => (
              <Accordion key={answer.question_id} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>
                    {getQuestionTitle(answer.question_id)}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {answer.value && (
                    <Typography variant="body1">
                      {answer.value}
                    </Typography>
                  )}
                  
                  {answer.selected_options && (
                    <Box mt={1}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Selected Options:
                      </Typography>
                      <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
                        {JSON.stringify(answer.selected_options, null, 2)}
                      </pre>
                    </Box>
                  )}
                  
                  {answer.items && answer.items.length > 0 && (
                    <Box mt={1}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Items:
                      </Typography>
                      <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Index</TableCell>
                              <TableCell>Value</TableCell>
                              <TableCell>Row</TableCell>
                              <TableCell>Column</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {answer.items.map(item => (
                              <TableRow key={`${answer.question_id}-${item.item_index}`}>
                                <TableCell>{item.item_index}</TableCell>
                                <TableCell>{item.value || '—'}</TableCell>
                                <TableCell>{item.row_identifier || '—'}</TableCell>
                                <TableCell>{item.column_identifier || '—'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                  
                  {!answer.value && !answer.selected_options && 
                   (!answer.items || answer.items.length === 0) && (
                    <Typography variant="body2" color="textSecondary">
                      No answer provided
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No answers available for this response
            </Typography>
          )}
          
          {selectedResponse?.response_metadata && (
            <Box mt={3}>
              <Typography variant="subtitle2" color="textSecondary">
                Response Metadata
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mt: 1, background: '#f5f5f5' }}>
                <pre style={{ margin: 0, overflow: 'auto' }}>
                  {JSON.stringify(selectedResponse.response_metadata, null, 2)}
                </pre>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedResponse(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this response? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SurveyResponses; 