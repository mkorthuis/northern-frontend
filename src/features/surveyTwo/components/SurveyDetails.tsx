import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Chip, 
  Divider, 
  Card, 
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { Survey } from '@/store/slices/surveySlice';
import { getQuestionTypeById } from '@/constants/questionTypes';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddIcon from '@mui/icons-material/Add';
import { surveyAnalysisApi } from '@/services/api/endpoints/surveyAnalysis';

// Add interface for survey analysis data
interface SurveyAnalysis {
  id: string;
  title: string;
  description?: string | null;
  date_created: string;
  date_updated: string;
  analysis_questions: any[];
}

interface SurveyDetailsProps {
  survey: Survey | null;
  loading?: boolean;
}

const SurveyDetails: React.FC<SurveyDetailsProps> = ({ survey, loading = false }) => {
  const navigate = useNavigate();
  
  // Add state for survey analyses
  const [analyses, setAnalyses] = useState<SurveyAnalysis[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Fetch survey analyses when survey changes
  useEffect(() => {
    const fetchAnalyses = async () => {
      if (!survey?.id) return;
      
      setLoadingAnalyses(true);
      setAnalysisError(null);
      
      try {
        const response = await surveyAnalysisApi.getSurveyAnalyses(survey.id, true);
        setAnalyses(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Failed to fetch survey analyses:', error);
        setAnalysisError('Failed to load survey analyses. Please try again later.');
      } finally {
        setLoadingAnalyses(false);
      }
    };
    
    fetchAnalyses();
  }, [survey?.id]);

  const handleEditSurvey = () => {
    if (survey && survey.id) {
      navigate(`${PATHS.PUBLIC.SURVEYS_V2.path}/edit/${survey.id}`);
    }
  };
  
  const handleViewAnalysis = (analysisId: string) => {
    if (survey?.id) {
      navigate(PATHS.PUBLIC.SURVEYS_V2_ANALYSIS_VIEW.path
        .replace(':surveyId', survey.id)
        .replace(':analysisId', analysisId));
    }
  };
  
  const handleCreateAnalysis = () => {
    if (survey?.id) {
      navigate(PATHS.PUBLIC.SURVEYS_V2_ANALYSIS_CREATE.path.replace(':surveyId', survey.id));
    }
  };

  if (!survey) {
    return (
      <Card sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CardContent>
          <Typography variant="body1" color="textSecondary" align="center">
            Select a survey from the list to view details.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Get sorted questions if they exist
  const sortedQuestions = survey.questions 
    ? [...survey.questions].sort((a, b) => a.order_index - b.order_index) 
    : [];

  return (
    <> 
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            {survey.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label={survey.is_active ? "Active" : "Inactive"} 
              color={survey.is_active ? "success" : "default"} 
              size="small"
            />
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEditSurvey}
              size="small"
            >
              Edit Survey
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Description
          </Typography>
          <Typography variant="body1">
            {survey.description || "No description provided."}
          </Typography>
        </Box>
        
        {survey.date_created && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Created
            </Typography>
            <Typography variant="body1">
              {new Date(survey.date_created).toLocaleDateString()}
            </Typography>
          </Box>
        )}
        
        {/* Survey Analysis Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Survey Analysis
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleCreateAnalysis}
            >
              Create Analysis
            </Button>
          </Box>
          
          {loadingAnalyses ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : analysisError ? (
            <Typography variant="body2" color="error">
              {analysisError}
            </Typography>
          ) : analyses.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No analyses have been created for this survey yet.
            </Typography>
          ) : (
            <List sx={{ bgcolor: 'background.paper', border: '1px solid #e0e0e0', borderRadius: 1 }}>
              {analyses.map((analysis) => (
                <ListItem
                  key={analysis.id}
                  secondaryAction={
                    <Tooltip title="View Analysis">
                      <IconButton 
                        edge="end" 
                        aria-label="view" 
                        onClick={() => handleViewAnalysis(analysis.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  }
                  divider
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssessmentIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle2">{analysis.title}</Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        {analysis.description && (
                          <Typography variant="body2" color="textSecondary">
                            {analysis.description}
                          </Typography>
                        )}
                        <Typography variant="caption" color="textSecondary">
                          Created: {new Date(analysis.date_created).toLocaleDateString()} | 
                          Questions: {analysis.analysis_questions?.length || 0}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
        
        {/* Questions Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Questions ({sortedQuestions.length})
          </Typography>
          
          {sortedQuestions.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No questions available for this survey.
            </Typography>
          ) : (
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width="5%">#</TableCell>
                    <TableCell width="20%">Question ID</TableCell>
                    <TableCell width="40%">Title</TableCell>
                    <TableCell width="15%">Type</TableCell>
                    <TableCell width="10%">Options</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedQuestions.map((question, index) => (
                    <TableRow key={question.id || index} hover>
                      <TableCell>{question.order_index}</TableCell>
                      <TableCell>
                        {question.external_question_id || 'N/A'}
                      </TableCell>
                      <TableCell>{question.title}</TableCell>
                      <TableCell>
                        {getQuestionTypeById(question.type.id).name}
                      </TableCell>
                      <TableCell>
                        {question.options?.length || 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          )}
        </Box>
    </>
  );
};

export default SurveyDetails; 