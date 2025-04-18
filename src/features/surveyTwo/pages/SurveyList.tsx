import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Paper, Box, Button,
  CircularProgress, TableContainer, Table,
  TableHead, TableRow, TableCell, TableBody,
  Chip, Alert,
  Divider, LinearProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import useSurveyTwo from '../hooks/useSurveyTwo';
import { format } from 'date-fns';
import SurveyDetails from '../components/SurveyDetails';
import { Survey } from '@/store/slices/surveySlice';
import { PATHS } from '@/routes/paths';

const SurveyList: React.FC = () => {
  const { 
    surveys, 
    surveysLoading, 
    error, 
    getSurveys,
    getSurveyById,
    isSurveysLoading, 
    isSurveysFailed, 
    isSurveysSucceeded,
    isSurveyLoading,
    isSurveyFailed,
    isSurveySucceeded,
    LoadingState 
  } = useSurveyTwo();
  
  const navigate = useNavigate();
  // Use useParams to get the surveyId from the URL
  const { surveyId } = useParams<{ surveyId: string }>();
  
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [isLoadingSurvey, setIsLoadingSurvey] = useState(false);

  // Load surveys when component mounts
  useEffect(() => {
    getSurveys();
  }, [getSurveys]);

  // Load specific survey from URL if available
  useEffect(() => {
    const loadSurveyFromUrl = async () => {
      // Check if the URL contains a survey ID
      if (surveyId) {
        setIsLoadingSurvey(true);
        try {
          // Look for the survey in the already loaded surveys first
          const surveyFromList = surveys.find(s => s.id === surveyId);
          
          if (surveyFromList) {
            setSelectedSurvey(surveyFromList);
          } else {
            // If not found in the list, try to fetch it directly
            const response = await getSurveyById(surveyId);
            if (response.payload) {
              setSelectedSurvey(response.payload as Survey);
            }
          }
        } catch (error) {
          console.error('Failed to load survey from URL:', error);
        } finally {
          setIsLoadingSurvey(false);
        }
      }
    };

    if (isSurveysSucceeded) {
      loadSurveyFromUrl();
    }
  }, [surveyId, surveys, getSurveyById, isSurveysSucceeded]);

  if (isSurveysLoading) {
    return (
      <Container maxWidth="lg" sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: 'calc(100vh)' 
      }}>
        <Paper elevation={3} sx={{ p: 4, my: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Survey Management
          </Typography>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Loading surveys...</Typography>
        </Paper>
      </Container>
    );
  }

  if (isSurveysFailed) {
    return (
      <Container maxWidth="lg" sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: 'calc(100vh)' 
      }}>
        <Paper elevation={3} sx={{ p: 4, my: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Survey Management
          </Typography>
          <Alert severity="error">Error: {error}</Alert>
        </Paper>
      </Container>
    );
  }

  // Only render content when loading state is SUCCEEDED
  if (!isSurveysSucceeded) {
    return (
      <Container maxWidth="lg" sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: 'calc(100vh)' 
      }}>
        <Paper elevation={3} sx={{ p: 4, my: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Survey Management
          </Typography>
          <Alert severity="info">Waiting for data...</Alert>
        </Paper>
      </Container>
    );
  }

  const handleSurveySelect = (survey: Survey) => {
    setSelectedSurvey(survey);
    // Update the URL to include the selected survey ID without reloading the page
    if (survey.id) {
      navigate(PATHS.PUBLIC.SURVEYS_V2_DETAIL.path.replace(':surveyId', survey.id), { replace: true });
    }
  };

  const handleSurveyDeleted = async () => {
    // Clear the selected survey
    setSelectedSurvey(null);
    // Refresh the surveys list first
    await getSurveys();
    // Update URL to remove the survey ID
    navigate(PATHS.PUBLIC.SURVEYS_V2.path, { replace: true });
  };

  const renderSurveyTable = () => {
    if (surveys && surveys.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
          <Typography variant="h6" color="primary" gutterBottom>
            No Surveys Found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create your first survey to get started.
          </Typography>
        </Paper>
      );
    }

    return (
      <TableContainer sx={{ height: '100%', overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {surveys.map((survey) => (
              <TableRow 
                key={survey.id} 
                hover
                onClick={() => handleSurveySelect(survey)}
                sx={{ 
                  cursor: 'pointer',
                  bgcolor: selectedSurvey && selectedSurvey.id === survey.id ? 'action.selected' : 'inherit'
                }}
              >
                <TableCell>{survey.title}</TableCell>
                <TableCell>
                  <Chip 
                    label={survey.is_active ? "Active" : "Inactive"} 
                    color={survey.is_active ? "success" : "default"} 
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {survey.date_created ? format(new Date(survey.date_created), 'MMM d, yyyy') : 'Unknown'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img src="/images/owl.png" alt="Owl" style={{ height: '64px' }} />
            <Typography variant="h4" component="span">
              Survey Management
            </Typography>
          </Box>
        </Typography>
      </Box>
      
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 3, 
          minHeight: '70vh'
        }}
      >
        {/* Left Column - Survey List */}
        <Box 
          sx={{ 
            width: { xs: '100%', md: '30%' }, 
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            component={Link}
            to={PATHS.PUBLIC.SURVEYS_V2_CREATE.path}
            sx={{ mb: 2 }}
          >
            Create New Survey
          </Button>
          <Divider />
          <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>
            Available Surveys
          </Typography>
          {renderSurveyTable()}
        </Box>
        
        {/* Right Column - Survey Details */}
        <Box sx={{ flexGrow: 1, width: { xs: '100%', md: '70%' } }}>
          {isLoadingSurvey ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <SurveyDetails 
              survey={selectedSurvey} 
              loading={isLoadingSurvey}
              onComplete={handleSurveyDeleted}
            />
          )}
        </Box>
      </Box>
    </>
  );
};

export default SurveyList;
