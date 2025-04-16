import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchSurveyQuestionTopics, 
  createSurveyQuestionTopic, 
  updateSurveyQuestionTopic, 
  deleteSurveyQuestionTopic,
  SurveyQuestionTopic
} from '@/store/slices/surveyAnalysisSlice';

interface QuestionTopicsManagerProps {
  surveyId: string;
}

const QuestionTopicsManager: React.FC<QuestionTopicsManagerProps> = ({ surveyId }) => {
  const dispatch = useAppDispatch();
  const { topics } = useAppSelector((state) => state.surveyAnalysis);
  const loadingStates = useAppSelector((state) => state.surveyAnalysis.loadingStates);
  
  // Local state for topic management
  const [topicName, setTopicName] = useState('');
  const [topicNameError, setTopicNameError] = useState('');
  const [editingTopic, setEditingTopic] = useState<SurveyQuestionTopic | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<SurveyQuestionTopic | null>(null);
  
  // Check if operations are in progress
  const isTopicsLoading = loadingStates.topics;
  const isCreateTopicLoading = loadingStates.createTopic;
  const isUpdateTopicLoading = loadingStates.updateTopic;
  const isDeleteTopicLoading = loadingStates.deleteTopic;
  const isAnyLoading = isTopicsLoading || isCreateTopicLoading || isUpdateTopicLoading || isDeleteTopicLoading;

  // Load topics when surveyId changes
  useEffect(() => {
    if (surveyId) {
      dispatch(fetchSurveyQuestionTopics({ surveyId, forceRefresh: true }));
    }
  }, [surveyId, dispatch]);

  const validateTopicName = (name: string): boolean => {
    if (!name.trim()) {
      setTopicNameError('Topic name is required');
      return false;
    }
    if (name.length > 50) {
      setTopicNameError('Topic name must be less than 50 characters');
      return false;
    }
    
    // Check for duplicate names (only when creating new topics, not when editing)
    if (!editingTopic && topics.some(topic => topic.name.toLowerCase() === name.toLowerCase().trim())) {
      setTopicNameError('A topic with this name already exists');
      return false;
    }
    
    setTopicNameError('');
    return true;
  };

  const handleAddTopic = async () => {
    if (!validateTopicName(topicName)) {
      return;
    }

    try {
      await dispatch(createSurveyQuestionTopic({
        survey_id: surveyId,
        name: topicName.trim()
      }));
      
      // Clear the input field after successful addition
      setTopicName('');
    } catch (error) {
      console.error('Failed to add topic:', error);
    }
  };

  const handleUpdateTopic = async () => {
    if (!editingTopic || !validateTopicName(topicName)) {
      return;
    }

    try {
      await dispatch(updateSurveyQuestionTopic({
        topicId: editingTopic.id!,
        name: topicName.trim()
      }));
      
      // Clear editing state after successful update
      setEditingTopic(null);
      setTopicName('');
    } catch (error) {
      console.error('Failed to update topic:', error);
    }
  };

  const handleDeleteTopic = async () => {
    if (!topicToDelete) {
      return;
    }

    try {
      await dispatch(deleteSurveyQuestionTopic(topicToDelete.id!));
      
      // Close the confirmation dialog
      setDeleteDialogOpen(false);
      setTopicToDelete(null);
    } catch (error) {
      console.error('Failed to delete topic:', error);
    }
  };

  const startEditingTopic = (topic: SurveyQuestionTopic) => {
    setEditingTopic(topic);
    setTopicName(topic.name);
    setTopicNameError('');
  };

  const cancelEditingTopic = () => {
    setEditingTopic(null);
    setTopicName('');
    setTopicNameError('');
  };

  const confirmDeleteTopic = (topic: SurveyQuestionTopic) => {
    setTopicToDelete(topic);
    setDeleteDialogOpen(true);
  };

  return (
    <Box sx={{ mt: 2 }}>
      {isTopicsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {topics.length > 0 ? (
            <Paper variant="outlined" sx={{ mb: 3 }}>
              <List>
                {topics.map((topic) => (
                  <ListItem key={topic.id} divider>
                    <ListItemText primary={topic.name} />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="edit" 
                        onClick={() => startEditingTopic(topic)}
                        disabled={isAnyLoading}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={() => confirmDeleteTopic(topic)}
                        disabled={isAnyLoading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              No topics have been created yet. Topics help you organize questions for analysis.
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1">
              {editingTopic ? 'Edit Topic' : 'Add New Topic'}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                fullWidth
                label="Topic Name"
                variant="outlined"
                size="small"
                value={topicName}
                onChange={(e) => {
                  setTopicName(e.target.value);
                  if (e.target.value.trim()) {
                    setTopicNameError('');
                  }
                }}
                error={!!topicNameError}
                helperText={topicNameError}
                disabled={isAnyLoading}
              />
              
              {editingTopic ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateTopic}
                    disabled={isAnyLoading}
                    startIcon={isUpdateTopicLoading ? <CircularProgress size={20} /> : undefined}
                  >
                    Update
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={cancelEditingTopic}
                    disabled={isAnyLoading}
                  >
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddTopic}
                  disabled={isAnyLoading}
                  startIcon={isCreateTopicLoading ? <CircularProgress size={20} /> : <AddIcon />}
                >
                  Add
                </Button>
              )}
            </Box>
          </Box>
        </>
      )}

      {/* Confirmation Dialog for Delete */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the topic "{topicToDelete?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={isDeleteTopicLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteTopic} 
            color="error" 
            disabled={isDeleteTopicLoading}
            startIcon={isDeleteTopicLoading ? <CircularProgress size={20} /> : undefined}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionTopicsManager; 