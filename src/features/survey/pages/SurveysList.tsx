import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Box, 
  CircularProgress, Chip, IconButton, Tooltip, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, 
  Visibility as VisibilityIcon, Assessment as AssessmentIcon,
  Analytics as AnalyticsIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { format } from 'date-fns';
import useSurvey from '../hooks/useSurveys';
import { Survey } from '@/store/slices/surveySlice';

const SurveysList: React.FC = () => {
  const navigate = useNavigate();
  const { 
    surveys, 
    surveysLoading, 
    error, 
    getSurveys,
    removeSurvey 
  } = useSurvey();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    getSurveys(false, true);
  }, [getSurveys]);

  const handleViewResponses = (surveyId: string) => {
    navigate(PATHS.PUBLIC.SURVEY_RESPONSES.path.replace(':id', surveyId));
  };

  const handleViewSurvey = (surveyId: string) => {
    navigate(PATHS.PUBLIC.SURVEY_DETAIL.path.replace(':id', surveyId));
  };

  const handleViewAnalysis = (surveyId: string) => {
    navigate(PATHS.PUBLIC.SURVEY_ANALYSIS.path.replace(':id', surveyId));
  };

  const handleDeleteDialogOpen = (surveyId: string) => {
    setSurveyToDelete(surveyId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSurveyToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (surveyToDelete) {
      await removeSurvey(surveyToDelete);
      handleDeleteDialogClose();
      // Refresh surveys after deletion
      getSurveys(false, true);
    }
  };

  if (surveysLoading) {
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Survey Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          component={Link}
          to={PATHS.PUBLIC.SURVEY_CREATE.path}
        >
          Create New Survey
        </Button>
      </Box>
      
      {surveys && surveys.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No surveys found. Create your first survey to get started.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {surveys && surveys.map((survey: Survey) => (
                <TableRow key={survey.id}>
                  <TableCell>{survey.title}</TableCell>
                  <TableCell>
                    {survey.description ? 
                      (survey.description.length > 100 ? 
                        `${survey.description.substring(0, 100)}...` : 
                        survey.description) : 
                      'No description'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={survey.is_active ? "Active" : "Inactive"} 
                      color={survey.is_active ? "success" : "default"} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {survey.created_at ? format(new Date(survey.created_at), 'MMM d, yyyy') : 'Unknown'}
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center">
                      <Tooltip title="View Survey">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleViewSurvey(survey.id!)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Responses">
                        <IconButton 
                          color="info" 
                          onClick={() => handleViewResponses(survey.id!)}
                        >
                          <AssessmentIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Survey Analysis">
                        <IconButton 
                          color="secondary" 
                          onClick={() => handleViewAnalysis(survey.id!)}
                        >
                          <AnalyticsIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Survey">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteDialogOpen(survey.id!)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this survey? This action cannot be undone and all responses will be lost.
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

export default SurveysList; 