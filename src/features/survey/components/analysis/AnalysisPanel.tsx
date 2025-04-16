import React, { useState } from 'react';
import { 
  Typography, Paper, Box, Button, Grid, Card, CardContent, 
  CardActions, IconButton, CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { format } from 'date-fns';
import { SurveyAnalysis } from '@/store/slices/surveyAnalysisSlice';
import AnalysisFormDialog from './AnalysisFormDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface AnalysisPanelProps {
  analyses: SurveyAnalysis[];
  surveyId: string;
  createAnalysisLoading: boolean;
  updateAnalysisLoading: boolean;
  deleteAnalysisLoading: boolean;
  onCreateAnalysis: (data: { survey_id: string, title: string, description?: string | null }) => Promise<void>;
  onUpdateAnalysis: (analysisId: string, data: { title?: string | null, description?: string | null }) => Promise<void>;
  onDeleteAnalysis: (analysisId: string) => Promise<void>;
  onViewAnalysis: (analysisId: string) => void;
  refreshAnalyses: () => Promise<void>;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  analyses,
  surveyId,
  createAnalysisLoading,
  updateAnalysisLoading,
  deleteAnalysisLoading,
  onCreateAnalysis,
  onUpdateAnalysis,
  onDeleteAnalysis,
  onViewAnalysis,
  refreshAnalyses
}) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SurveyAnalysis | null>(null);

  const handleCreateDialogOpen = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
  };

  const handleEditDialogOpen = (analysis: SurveyAnalysis) => {
    setSelectedAnalysis(analysis);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedAnalysis(null);
  };

  const handleDeleteDialogOpen = (analysis: SurveyAnalysis) => {
    setSelectedAnalysis(analysis);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedAnalysis(null);
  };

  const handleSubmitCreate = async (data: { title: string; description: string }) => {
    await onCreateAnalysis({
      survey_id: surveyId,
      title: data.title,
      description: data.description || null
    });
    handleCreateDialogClose();
    await refreshAnalyses();
  };

  const handleSubmitEdit = async (data: { title: string; description: string }) => {
    if (selectedAnalysis?.id) {
      await onUpdateAnalysis(selectedAnalysis.id, {
        title: data.title,
        description: data.description || null
      });
      handleEditDialogClose();
      await refreshAnalyses();
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedAnalysis?.id) {
      await onDeleteAnalysis(selectedAnalysis.id);
      handleDeleteDialogClose();
      await refreshAnalyses();
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

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Analysis Reports
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateDialogOpen}
        >
          Create New Analysis
        </Button>
      </Box>

      {analyses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No analysis reports found. Create your first analysis to get started.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {analyses.map(analysis => (
            <Grid item xs={12} md={6} lg={4} key={analysis.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {analysis.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {analysis.description || 'No description provided'}
                  </Typography>
                  <Typography variant="caption" display="block" color="textSecondary">
                    Created: {formatDate(analysis.date_created)}
                  </Typography>
                  <Typography variant="caption" display="block" color="textSecondary">
                    Updated: {formatDate(analysis.date_updated)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => onViewAnalysis(analysis.id!)}
                  >
                    View Details
                  </Button>
                  <IconButton 
                    color="primary" 
                    onClick={() => handleEditDialogOpen(analysis)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteDialogOpen(analysis)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Form Dialogs */}
      <AnalysisFormDialog
        open={createDialogOpen}
        onClose={handleCreateDialogClose}
        onSubmit={handleSubmitCreate}
        isLoading={createAnalysisLoading}
        title="Create New Analysis"
        submitButtonText="Create"
      />
      
      <AnalysisFormDialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        onSubmit={handleSubmitEdit}
        isLoading={updateAnalysisLoading}
        title="Edit Analysis"
        submitButtonText="Update"
        initialTitle={selectedAnalysis?.title || ''}
        initialDescription={selectedAnalysis?.description || ''}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
        title="Delete Analysis"
        itemName={selectedAnalysis?.title || ''}
        isLoading={deleteAnalysisLoading}
      />
    </>
  );
};

export default AnalysisPanel; 