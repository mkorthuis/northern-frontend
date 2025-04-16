import React, { useEffect, useState, useMemo } from 'react';
import { 
  Container, Typography, Paper, Box, Button, CircularProgress, 
  Divider, Breadcrumbs, Chip, Card, CardContent, Grid, IconButton,
  Tabs, Tab
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  DonutLarge as DonutChartIcon,
  TableChart as TableChartIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import useSurveyAnalysis from '../hooks/useSurveyAnalysis';
import useSurvey from '../hooks/useSurveys';
import { format } from 'date-fns';
import { TabPanel, AnalysisFormDialog, AnalysisQuestionFormDialog } from '../components/analysis';
import { SurveyQuestion } from '@/store/slices/surveySlice';

const AnalysisDetails: React.FC = () => {
  const { surveyId, analysisId } = useParams<{ surveyId: string; analysisId: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addQuestionDialogOpen, setAddQuestionDialogOpen] = useState(false);

  // Fetch data
  const { 
    getSurveyById, 
    currentSurvey, 
    surveyByIdLoading,
    error: surveyError
  } = useSurvey();

  const {
    currentAnalysis,
    chartTypes,
    topics,
    segments,
    loading,
    error,
    analysisByIdLoading,
    topicsLoading,
    segmentsLoading,
    chartTypesLoading,
    updateAnalysisLoading,
    createQuestionLoading,
    getChartTypes,
    getAnalysisById,
    editAnalysis,
    getAnalysisQuestions,
    addAnalysisQuestion,
    getTopics,
    getSegments,
  } = useSurveyAnalysis();

  useEffect(() => {
    if (surveyId && analysisId) {
      getSurveyById(surveyId);
      getAnalysisById(analysisId, true);
      getAnalysisQuestions(analysisId, true);
      getChartTypes(true);
      getTopics(surveyId);
      getSegments(surveyId);
    }
  }, [
    surveyId, 
    analysisId, 
    getSurveyById,
    getAnalysisById, 
    getAnalysisQuestions, 
    getChartTypes,
    getTopics, 
    getSegments
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBackToAnalyses = () => {
    navigate(`/surveys/${surveyId}/analysis`);
  };

  const handleEditDialogOpen = () => {
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  // Memoize the filtered questions to prevent re-renders
  const filteredAvailableQuestions = useMemo(() => {
    if (!currentAnalysis?.analysis_questions || !currentSurvey?.questions) {
      console.log("Missing required data for filtering questions", { 
        hasAnalysisQuestions: !!currentAnalysis?.analysis_questions, 
        hasCurrentSurveyQuestions: !!currentSurvey?.questions 
      });
      return [];
    }
    
    const existingQuestionIds = currentAnalysis.analysis_questions.map(
      aq => aq.question_id
    );
    
    console.log("Filtering questions:", {
      totalSurveyQuestions: currentSurvey.questions.length,
      existingAnalysisQuestions: existingQuestionIds.length,
      existingIds: existingQuestionIds
    });
    
    // Make sure we're only getting questions with valid IDs
    const availableQs = currentSurvey.questions
      .filter(question => question.id) // Ensure it has an ID
      .filter(question => !existingQuestionIds.includes(question.id || ''));
    
    console.log("Available questions after filtering:", {
      count: availableQs.length,
      questions: availableQs.map(q => ({ id: q.id, title: q.title }))
    });
    
    return availableQs;
  }, [currentAnalysis?.analysis_questions, currentSurvey?.questions]);

  const handleAddQuestionDialogOpen = () => {
    console.log("Opening add question dialog with:", {
      availableQuestionsCount: filteredAvailableQuestions.length,
      chartTypesCount: chartTypes?.length || 0,
      topicsCount: topics?.length || 0,
      segmentsCount: segments?.length || 0
    });
    setAddQuestionDialogOpen(true);
  };

  const handleAddQuestionDialogClose = () => {
    setAddQuestionDialogOpen(false);
  };

  const handleUpdateAnalysis = async (data: { title: string; description: string }) => {
    if (analysisId) {
      try {
        await editAnalysis(analysisId, {
          title: data.title,
          description: data.description || null
        });
        setEditDialogOpen(false);
        // Refresh analysis data
        getAnalysisById(analysisId, true);
      } catch (error) {
        console.error('Error updating analysis:', error);
      }
    }
  };

  const handleAddQuestion = async (data: {
    question_id: string;
    chart_type_id: number;
    sort_by_value: boolean;
    topic_ids?: string[] | null;
    report_segment_ids?: string[] | null;
  }) => {
    if (analysisId) {
      try {
        await addAnalysisQuestion({
          survey_analysis_id: analysisId,
          ...data
        });
        setAddQuestionDialogOpen(false);
        // Refresh questions data
        getAnalysisQuestions(analysisId, true);
      } catch (error) {
        console.error('Error adding analysis question:', error);
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Map chart type ID to an icon
  const getChartIcon = (chartTypeId: number) => {
    switch (chartTypeId) {
      case 1:
        return <BarChartIcon />;
      case 2:
        return <PieChartIcon />;
      case 3:
        return <DonutChartIcon />;
      case 4:
        return <TableChartIcon />;
      default:
        return <BarChartIcon />;
    }
  };

  if (analysisByIdLoading || surveyByIdLoading || loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || surveyError || !currentAnalysis) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error" variant="h6">
          Error: {error || surveyError || 'Analysis not found'}
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackToAnalyses}
          sx={{ mt: 2 }}
        >
          Back to Analyses
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link to={PATHS.PUBLIC.SURVEYS.path} style={{ textDecoration: 'none', color: 'inherit' }}>
          Surveys
        </Link>
        <Link to={`/surveys/${surveyId}/analysis`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {currentSurvey?.title || 'Survey Analysis'}
        </Link>
        <Typography color="text.primary">{currentAnalysis.title}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToAnalyses}
          sx={{ mr: 2 }}
        >
          Back to Analyses
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Analysis Details
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<EditIcon />}
          onClick={handleEditDialogOpen}
        >
          Edit Analysis
        </Button>
      </Box>

      {/* Analysis Info Card */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {currentAnalysis.title}
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              {currentAnalysis.description || 'No description provided'}
            </Typography>
          </Box>
          <Box>
            <Chip 
              label={`ID: ${currentAnalysis.id?.substring(0, 8)}`} 
              color="default" 
              size="small"
              sx={{ mr: 1 }}
            />
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">
              Created: {formatDate(currentAnalysis.date_created)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">
              Last Updated: {formatDate(currentAnalysis.date_updated)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="analysis details tabs">
          <Tab label="Questions" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="Charts" id="tab-1" aria-controls="tabpanel-1" />
          <Tab label="Settings" id="tab-2" aria-controls="tabpanel-2" />
        </Tabs>
      </Box>

      {/* Questions Tab Panel */}
      <TabPanel value={tabValue} index={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Analysis Questions
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleAddQuestionDialogOpen}
            disabled={filteredAvailableQuestions.length === 0}
          >
            Add Question
          </Button>
        </Box>

        {currentAnalysis.analysis_questions && currentAnalysis.analysis_questions.length > 0 ? (
          <Grid container spacing={3}>
            {currentAnalysis.analysis_questions.map((question) => (
              <Grid item xs={12} md={6} key={question.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" gutterBottom>
                        {question.question?.title || 'Question'}
                      </Typography>
                      {getChartIcon(question.chart_type_id)}
                    </Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {question.question?.description || 'No description'}
                    </Typography>
                    {question.topics && question.topics.length > 0 && (
                      <Box mt={2}>
                        <Typography variant="caption" display="block" gutterBottom>
                          Topics:
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {question.topics.map((topic) => (
                            <Chip 
                              key={topic.id} 
                              label={topic.name} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No questions have been added to this analysis yet. Add questions to start analyzing your survey data.
            </Typography>
          </Paper>
        )}
      </TabPanel>

      {/* Charts Tab Panel */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Analysis Charts
        </Typography>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Charts visualization will be implemented in a future update.
          </Typography>
        </Paper>
      </TabPanel>

      {/* Settings Tab Panel */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Analysis Settings
        </Typography>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Additional settings will be implemented in a future update.
          </Typography>
        </Paper>
      </TabPanel>

      {/* Edit Analysis Dialog */}
      <AnalysisFormDialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        onSubmit={handleUpdateAnalysis}
        isLoading={updateAnalysisLoading}
        title="Edit Analysis"
        submitButtonText="Update"
        initialTitle={currentAnalysis.title}
        initialDescription={currentAnalysis.description || ''}
      />

      {/* Add Question Dialog */}
      {addQuestionDialogOpen && (
        <AnalysisQuestionFormDialog
          open={addQuestionDialogOpen}
          onClose={handleAddQuestionDialogClose}
          onSubmit={handleAddQuestion}
          isLoading={createQuestionLoading}
          title="Add Analysis Question"
          submitButtonText="Add Question"
          analysisId={analysisId || ''}
          chartTypes={chartTypes || []}
          availableQuestions={filteredAvailableQuestions}
          availableTopics={topics || []}
          availableSegments={segments || []}
        />
      )}
    </Container>
  );
};

export default AnalysisDetails; 