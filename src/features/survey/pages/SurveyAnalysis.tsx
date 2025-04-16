import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Paper, Box, Button, TextField, 
  CircularProgress, 
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
  DialogContentText,Snackbar, Alert, Chip, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalOffer as TopicIcon,
  Category as SegmentIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import useSurveyAnalysis from '../hooks/useSurveyAnalysis';
import useSurvey from '../hooks/useSurveys';
import { format } from 'date-fns';
import AnalysisList from '../components/analysis/AnalysisList';
import AnalysisPanel from '../components/analysis/AnalysisPanel';
import TabPanel from '../components/analysis/TabPanel';

const SurveyAnalysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  
  // Topics state
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [editTopicDialogOpen, setEditTopicDialogOpen] = useState(false);
  const [deleteTopicDialogOpen, setDeleteTopicDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topicName, setTopicName] = useState('');
  
  // Report Segments state
  const [segmentDialogOpen, setSegmentDialogOpen] = useState(false);
  const [editSegmentDialogOpen, setEditSegmentDialogOpen] = useState(false);
  const [deleteSegmentDialogOpen, setDeleteSegmentDialogOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [segmentName, setSegmentName] = useState('');
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const { 
    getSurveyById, 
    currentSurvey, 
    surveyByIdLoading,
    error: surveyError
  } = useSurvey();

  const {
    analyses,
    topics,
    segments,
    currentAnalysis,
    loading,
    error,
    analysesLoading,
    topicsLoading,
    segmentsLoading,
    createAnalysisLoading,
    updateAnalysisLoading,
    deleteAnalysisLoading,
    createTopicLoading,
    updateTopicLoading,
    deleteTopicLoading,
    createSegmentLoading,
    updateSegmentLoading,
    deleteSegmentLoading,
    getSurveyAnalyses,
    getAnalysisById,
    addAnalysis,
    editAnalysis,
    removeAnalysis,
    getTopics,
    addTopic,
    editTopic,
    removeTopic,
    getSegments,
    addSegment,
    editSegment,
    removeSegment,
    clearAnalysis,
    getChartTypes
  } = useSurveyAnalysis();

  useEffect(() => {
    if (id) {
      getSurveyById(id, true);
      getSurveyAnalyses(id, true);
      getTopics(id, true);
      getSegments(id, true);
      getChartTypes(true);
    }
    
    return () => {
      clearAnalysis();
    };
  }, [id, getSurveyById, getSurveyAnalyses, getTopics, getSegments, getChartTypes, clearAnalysis]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Topic Handlers
  const handleTopicDialogOpen = () => {
    setTopicName('');
    setTopicDialogOpen(true);
  };

  const handleTopicDialogClose = () => {
    setTopicDialogOpen(false);
  };

  const handleSubmitTopic = async () => {
    if (id && topicName) {
      try {
        await addTopic({
          survey_id: id,
          name: topicName
        });
        setTopicDialogOpen(false);
        showSnackbar('Topic created successfully', 'success');
        await getTopics(id, true);
      } catch (error) {
        console.error('Error creating topic:', error);
        showSnackbar('Failed to create topic', 'error');
      }
    }
  };

  const handleEditTopicDialogOpen = (topicId: string) => {
    const topicToEdit = topics.find(t => t.id === topicId);
    if (topicToEdit) {
      setSelectedTopic(topicId);
      setTopicName(topicToEdit.name);
      setEditTopicDialogOpen(true);
    }
  };

  const handleEditTopicDialogClose = () => {
    setEditTopicDialogOpen(false);
    setSelectedTopic(null);
  };

  const handleSubmitEditTopic = async () => {
    if (selectedTopic && topicName) {
      try {
        await editTopic(selectedTopic, topicName);
        setEditTopicDialogOpen(false);
        showSnackbar('Topic updated successfully', 'success');
        if (id) {
          await getTopics(id, true);
        }
      } catch (error) {
        console.error('Error updating topic:', error);
        showSnackbar('Failed to update topic', 'error');
      }
    }
  };

  const handleDeleteTopicDialogOpen = (topicId: string) => {
    setSelectedTopic(topicId);
    setDeleteTopicDialogOpen(true);
  };

  const handleDeleteTopicDialogClose = () => {
    setDeleteTopicDialogOpen(false);
    setSelectedTopic(null);
  };

  const handleConfirmDeleteTopic = async () => {
    if (selectedTopic) {
      try {
        await removeTopic(selectedTopic);
        setDeleteTopicDialogOpen(false);
        showSnackbar('Topic deleted successfully', 'success');
        if (id) {
          await getTopics(id, true);
        }
      } catch (error) {
        console.error('Error deleting topic:', error);
        showSnackbar('Failed to delete topic', 'error');
      }
    }
  };

  // Report Segment Handlers
  const handleSegmentDialogOpen = () => {
    setSegmentName('');
    setSegmentDialogOpen(true);
  };

  const handleSegmentDialogClose = () => {
    setSegmentDialogOpen(false);
  };

  const handleSubmitSegment = async () => {
    if (id && segmentName) {
      try {
        await addSegment({
          survey_id: id,
          name: segmentName
        });
        setSegmentDialogOpen(false);
        showSnackbar('Segment created successfully', 'success');
        await getSegments(id, true);
      } catch (error) {
        console.error('Error creating segment:', error);
        showSnackbar('Failed to create segment', 'error');
      }
    }
  };

  const handleEditSegmentDialogOpen = (segmentId: string) => {
    const segmentToEdit = segments.find(s => s.id === segmentId);
    if (segmentToEdit) {
      setSelectedSegment(segmentId);
      setSegmentName(segmentToEdit.name);
      setEditSegmentDialogOpen(true);
    }
  };

  const handleEditSegmentDialogClose = () => {
    setEditSegmentDialogOpen(false);
    setSelectedSegment(null);
  };

  const handleSubmitEditSegment = async () => {
    if (selectedSegment && segmentName) {
      try {
        await editSegment(selectedSegment, segmentName);
        setEditSegmentDialogOpen(false);
        showSnackbar('Segment updated successfully', 'success');
        if (id) {
          await getSegments(id, true);
        }
      } catch (error) {
        console.error('Error updating segment:', error);
        showSnackbar('Failed to update segment', 'error');
      }
    }
  };

  const handleDeleteSegmentDialogOpen = (segmentId: string) => {
    setSelectedSegment(segmentId);
    setDeleteSegmentDialogOpen(true);
  };

  const handleDeleteSegmentDialogClose = () => {
    setDeleteSegmentDialogOpen(false);
    setSelectedSegment(null);
  };

  const handleConfirmDeleteSegment = async () => {
    if (selectedSegment) {
      try {
        await removeSegment(selectedSegment);
        setDeleteSegmentDialogOpen(false);
        showSnackbar('Segment deleted successfully', 'success');
        if (id) {
          await getSegments(id, true);
        }
      } catch (error) {
        console.error('Error deleting segment:', error);
        showSnackbar('Failed to delete segment', 'error');
      }
    }
  };

  const handleBackToSurveys = () => {
    navigate(PATHS.PUBLIC.SURVEYS.path);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Handlers for Analysis operations that will be passed to AnalysisPanel/AnalysisList
  const handleCreateAnalysis = async (data: { survey_id: string, title: string, description?: string | null }) => {
    try {
      await addAnalysis(data);
      showSnackbar('Analysis created successfully', 'success');
      if (id) {
        await getSurveyAnalyses(id, true);
      }
    } catch (error) {
      console.error('Error creating analysis:', error);
      showSnackbar('Failed to create analysis', 'error');
    }
  };

  const handleUpdateAnalysis = async (analysisId: string, data: { title?: string | null, description?: string | null }) => {
    try {
      await editAnalysis(analysisId, data);
      showSnackbar('Analysis updated successfully', 'success');
      if (id) {
        await getSurveyAnalyses(id, true);
      }
    } catch (error) {
      console.error('Error updating analysis:', error);
      showSnackbar('Failed to update analysis', 'error');
    }
  };

  const handleDeleteAnalysis = async (analysisId: string) => {
    try {
      await removeAnalysis(analysisId);
      showSnackbar('Analysis deleted successfully', 'success');
      if (id) {
        await getSurveyAnalyses(id, true);
      }
    } catch (error) {
      console.error('Error deleting analysis:', error);
      showSnackbar('Failed to delete analysis', 'error');
    }
  };

  const handleViewAnalysis = (analysisId: string) => {
    // Navigate to detailed analysis view
    navigate(`/surveys/${id}/analysis/${analysisId}`);
  };

  const refreshAnalyses = async () => {
    if (id) {
      await getSurveyAnalyses(id, true);
    }
  };

  const [viewMode, setViewMode] = useState<'panel' | 'list'>('panel');

  if (surveyByIdLoading || analysesLoading || topicsLoading || segmentsLoading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (surveyError || error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error" variant="h6">
          Error: {surveyError || error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToSurveys}
          sx={{ mr: 2 }}
        >
          Back to Surveys
        </Button>
        <Typography variant="h4" component="h1">
          Survey Analysis
        </Typography>
      </Box>

      {/* Survey Info */}
      {currentSurvey && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            {currentSurvey.title}
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {currentSurvey.description || 'No description provided'}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Chip 
              label={currentSurvey.is_active ? "Active" : "Inactive"} 
              color={currentSurvey.is_active ? "success" : "default"} 
              size="small"
            />
            <Typography variant="body2" color="textSecondary">
              Created: {formatDate(currentSurvey.created_at)}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="survey analysis tabs">
          <Tab label="Analysis Reports" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="Question Topics" id="tab-1" aria-controls="tabpanel-1" />
          <Tab label="Report Segments" id="tab-2" aria-controls="tabpanel-2" />
        </Tabs>
      </Box>

      {/* Analysis Tab Panel */}
      <TabPanel value={tabValue} index={0}>
        {id && (
          <>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                onClick={() => setViewMode(viewMode === 'panel' ? 'list' : 'panel')}
                color="primary"
              >
                Switch to {viewMode === 'panel' ? 'List View' : 'Grid View'}
              </Button>
            </Box>
            
            {viewMode === 'panel' ? (
              <AnalysisPanel
                analyses={analyses}
                surveyId={id}
                createAnalysisLoading={createAnalysisLoading}
                updateAnalysisLoading={updateAnalysisLoading}
                deleteAnalysisLoading={deleteAnalysisLoading}
                onCreateAnalysis={handleCreateAnalysis}
                onUpdateAnalysis={handleUpdateAnalysis}
                onDeleteAnalysis={handleDeleteAnalysis}
                onViewAnalysis={handleViewAnalysis}
                refreshAnalyses={refreshAnalyses}
              />
            ) : (
              <AnalysisList
                analyses={analyses.map(analysis => ({
                  id: analysis.id || '',
                  title: analysis.title,
                  description: analysis.description || '',
                  createdAt: analysis.date_created,
                  updatedAt: analysis.date_updated
                }))}
                onCreateAnalysis={async (data) => {
                  if (id) {
                    await handleCreateAnalysis({
                      survey_id: id,
                      title: data.title,
                      description: data.description || null
                    });
                  }
                }}
                onUpdateAnalysis={async (analysisId, data) => {
                  await handleUpdateAnalysis(analysisId, {
                    title: data.title,
                    description: data.description || null
                  });
                }}
                onDeleteAnalysis={handleDeleteAnalysis}
                onViewAnalysis={handleViewAnalysis}
                isLoading={analysesLoading}
              />
            )}
          </>
        )}
      </TabPanel>

      {/* Topics Tab Panel */}
      <TabPanel value={tabValue} index={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">
            Question Topics
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleTopicDialogOpen}
          >
            Create New Topic
          </Button>
        </Box>

        {topics.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No topics found. Create your first topic to help categorize questions for analysis.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="5%">ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell width="15%" align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell>{topic.id?.substring(0, 8)}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <TopicIcon sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
                        {topic.name}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditTopicDialogOpen(topic.id!)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteTopicDialogOpen(topic.id!)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Report Segments Tab Panel */}
      <TabPanel value={tabValue} index={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">
            Report Segments
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleSegmentDialogOpen}
          >
            Create New Segment
          </Button>
        </Box>

        {segments.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No segments found. Create your first segment to organize your analysis reports.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="5%">ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell width="15%" align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {segments.map((segment) => (
                  <TableRow key={segment.id}>
                    <TableCell>{segment.id?.substring(0, 8)}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <SegmentIcon sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
                        {segment.name}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditSegmentDialogOpen(segment.id!)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteSegmentDialogOpen(segment.id!)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Create Topic Dialog */}
      <Dialog open={topicDialogOpen} onClose={handleTopicDialogClose}>
        <DialogTitle>Create New Topic</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Topics help you categorize questions for analysis purposes.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Topic Name"
            fullWidth
            variant="outlined"
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTopicDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSubmitTopic} 
            variant="contained" 
            color="primary"
            disabled={!topicName || createTopicLoading}
          >
            {createTopicLoading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Topic Dialog */}
      <Dialog open={editTopicDialogOpen} onClose={handleEditTopicDialogClose}>
        <DialogTitle>Edit Topic</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Topic Name"
            fullWidth
            variant="outlined"
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditTopicDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSubmitEditTopic} 
            variant="contained" 
            color="primary"
            disabled={!topicName || updateTopicLoading}
          >
            {updateTopicLoading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Topic Confirmation Dialog */}
      <Dialog open={deleteTopicDialogOpen} onClose={handleDeleteTopicDialogClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this topic? This may affect any analyses that use this topic.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteTopicDialogClose}>Cancel</Button>
          <Button 
            onClick={handleConfirmDeleteTopic} 
            color="error"
            disabled={deleteTopicLoading}
          >
            {deleteTopicLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Segment Dialog */}
      <Dialog open={segmentDialogOpen} onClose={handleSegmentDialogClose}>
        <DialogTitle>Create New Segment</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Segments help you organize and structure your analysis reports.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Segment Name"
            fullWidth
            variant="outlined"
            value={segmentName}
            onChange={(e) => setSegmentName(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSegmentDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSubmitSegment} 
            variant="contained" 
            color="primary"
            disabled={!segmentName || createSegmentLoading}
          >
            {createSegmentLoading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Segment Dialog */}
      <Dialog open={editSegmentDialogOpen} onClose={handleEditSegmentDialogClose}>
        <DialogTitle>Edit Segment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Segment Name"
            fullWidth
            variant="outlined"
            value={segmentName}
            onChange={(e) => setSegmentName(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditSegmentDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSubmitEditSegment} 
            variant="contained" 
            color="primary"
            disabled={!segmentName || updateSegmentLoading}
          >
            {updateSegmentLoading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Segment Confirmation Dialog */}
      <Dialog open={deleteSegmentDialogOpen} onClose={handleDeleteSegmentDialogClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this segment? This may affect any analyses that use this segment.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteSegmentDialogClose}>Cancel</Button>
          <Button 
            onClick={handleConfirmDeleteSegment} 
            color="error"
            disabled={deleteSegmentLoading}
          >
            {deleteSegmentLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SurveyAnalysis; 