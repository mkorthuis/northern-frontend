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
  fetchSurveyReportSegments,
  createSurveyReportSegment,
  updateSurveyReportSegment,
  deleteSurveyReportSegment,
  SurveyReportSegment
} from '@/store/slices/surveyAnalysisSlice';

interface ReportSegmentManagerProps {
  surveyId: string;
}

const ReportSegmentManager: React.FC<ReportSegmentManagerProps> = ({ surveyId }) => {
  const dispatch = useAppDispatch();
  const segments = useAppSelector(state => state.surveyAnalysis.segments);
  const loadingStates = useAppSelector(state => state.surveyAnalysis.loadingStates);
  
  // Local state for segment management
  const [segmentName, setSegmentName] = useState('');
  const [segmentNameError, setSegmentNameError] = useState('');
  const [editingSegment, setEditingSegment] = useState<SurveyReportSegment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [segmentToDelete, setSegmentToDelete] = useState<SurveyReportSegment | null>(null);
  
  // Check if operations are in progress
  const isSegmentsLoading = loadingStates.segments;
  const isCreateSegmentLoading = loadingStates.createSegment;
  const isUpdateSegmentLoading = loadingStates.updateSegment;
  const isDeleteSegmentLoading = loadingStates.deleteSegment;
  const isAnyLoading = isSegmentsLoading || isCreateSegmentLoading || isUpdateSegmentLoading || isDeleteSegmentLoading;

  // Fetch segments when component mounts
  useEffect(() => {
    if (surveyId) {
      dispatch(fetchSurveyReportSegments({ surveyId, forceRefresh: true }));
    }
  }, [surveyId, dispatch]);

  const validateSegmentName = (name: string): boolean => {
    if (!name.trim()) {
      setSegmentNameError('Segment name is required');
      return false;
    }
    if (name.length > 50) {
      setSegmentNameError('Segment name must be less than 50 characters');
      return false;
    }
    
    // Check for duplicate names (only when creating new segments, not when editing)
    if (!editingSegment && segments.some(segment => segment.name.toLowerCase() === name.toLowerCase().trim())) {
      setSegmentNameError('A segment with this name already exists');
      return false;
    }
    
    setSegmentNameError('');
    return true;
  };

  const handleAddSegment = async () => {
    if (!validateSegmentName(segmentName)) {
      return;
    }

    try {
      await dispatch(createSurveyReportSegment({
        survey_id: surveyId,
        name: segmentName.trim()
      }));
      
      // Clear the input field after successful addition
      setSegmentName('');
    } catch (error) {
      console.error('Failed to add segment:', error);
    }
  };

  const handleUpdateSegment = async () => {
    if (!editingSegment || !validateSegmentName(segmentName)) {
      return;
    }

    try {
      await dispatch(updateSurveyReportSegment({
        segmentId: editingSegment.id!,
        name: segmentName.trim()
      }));
      
      // Clear editing state after successful update
      setEditingSegment(null);
      setSegmentName('');
    } catch (error) {
      console.error('Failed to update segment:', error);
    }
  };

  const handleDeleteSegment = async () => {
    if (!segmentToDelete) {
      return;
    }

    try {
      await dispatch(deleteSurveyReportSegment(segmentToDelete.id!));
      
      // Close the confirmation dialog
      setDeleteDialogOpen(false);
      setSegmentToDelete(null);
    } catch (error) {
      console.error('Failed to delete segment:', error);
    }
  };

  const startEditingSegment = (segment: SurveyReportSegment) => {
    setEditingSegment(segment);
    setSegmentName(segment.name);
    setSegmentNameError('');
  };

  const cancelEditingSegment = () => {
    setEditingSegment(null);
    setSegmentName('');
    setSegmentNameError('');
  };

  const confirmDeleteSegment = (segment: SurveyReportSegment) => {
    setSegmentToDelete(segment);
    setDeleteDialogOpen(true);
  };

  return (
    <Box sx={{ mt: 2 }}>
      {isSegmentsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {segments.length > 0 ? (
            <Paper variant="outlined" sx={{ mb: 3 }}>
              <List>
                {segments.map((segment) => (
                  <ListItem key={segment.id} divider>
                    <ListItemText primary={segment.name} />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="edit" 
                        onClick={() => startEditingSegment(segment)}
                        disabled={isAnyLoading}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={() => confirmDeleteSegment(segment)}
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
              No report segments defined yet. Report segments allow you to group analysis questions into logical sections in your reports.
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1">
              {editingSegment ? 'Edit Segment' : 'Add New Segment'}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                fullWidth
                label="Segment Name"
                variant="outlined"
                size="small"
                value={segmentName}
                onChange={(e) => {
                  setSegmentName(e.target.value);
                  if (e.target.value.trim()) {
                    setSegmentNameError('');
                  }
                }}
                error={!!segmentNameError}
                helperText={segmentNameError}
                disabled={isAnyLoading}
              />
              
              {editingSegment ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateSegment}
                    disabled={isAnyLoading}
                    startIcon={isUpdateSegmentLoading ? <CircularProgress size={20} /> : undefined}
                  >
                    Update
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={cancelEditingSegment}
                    disabled={isAnyLoading}
                  >
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddSegment}
                  disabled={isAnyLoading}
                  startIcon={isCreateSegmentLoading ? <CircularProgress size={20} /> : <AddIcon />}
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
            Are you sure you want to delete the segment "{segmentToDelete?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={isDeleteSegmentLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteSegment} 
            color="error" 
            disabled={isDeleteSegmentLoading}
            startIcon={isDeleteSegmentLoading ? <CircularProgress size={20} /> : undefined}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportSegmentManager; 