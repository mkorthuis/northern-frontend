import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  IconButton,
  List,
  Typography,
  Tooltip,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AnalysisFormDialog from './AnalysisFormDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

// Define Analysis type directly if it doesn't exist in types file
export interface Analysis {
  id: string;
  title: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AnalysisListProps {
  analyses: Analysis[];
  onCreateAnalysis: (data: { title: string; description: string }) => Promise<void>;
  onUpdateAnalysis: (id: string, data: { title: string; description: string }) => Promise<void>;
  onDeleteAnalysis: (id: string) => Promise<void>;
  onViewAnalysis?: (id: string) => void;
  isLoading: boolean;
}

const AnalysisList: React.FC<AnalysisListProps> = ({
  analyses,
  onCreateAnalysis,
  onUpdateAnalysis,
  onDeleteAnalysis,
  onViewAnalysis,
  isLoading
}) => {
  // State for dialog visibility
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // State for selected analysis
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);

  // State for loading indicators
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handlers for create dialog
  const handleCreateDialogOpen = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
  };

  const handleCreateSubmit = async (data: { title: string; description: string }) => {
    setIsSubmitting(true);
    try {
      await onCreateAnalysis(data);
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating analysis:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for edit dialog
  const handleEditDialogOpen = (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedAnalysis(null);
  };

  const handleEditSubmit = async (data: { title: string; description: string }) => {
    if (!selectedAnalysis) return;
    setIsSubmitting(true);
    try {
      await onUpdateAnalysis(selectedAnalysis.id, data);
      setEditDialogOpen(false);
      setSelectedAnalysis(null);
    } catch (error) {
      console.error('Error updating analysis:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for delete dialog
  const handleDeleteDialogOpen = (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedAnalysis(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAnalysis) return;
    setIsDeleting(true);
    try {
      await onDeleteAnalysis(selectedAnalysis.id);
      setDeleteDialogOpen(false);
      setSelectedAnalysis(null);
    } catch (error) {
      console.error('Error deleting analysis:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Analyses</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateDialogOpen}
          disabled={isLoading}
        >
          Create Analysis
        </Button>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : analyses.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" align="center" color="textSecondary" my={4}>
              No analyses available. Create your first analysis to get started.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <List>
          {analyses.map((analysis) => (
            <Card key={analysis.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{analysis.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {analysis.description || 'No description provided'}
                </Typography>
              </CardContent>
              <Divider />
              <CardActions>
                {onViewAnalysis && (
                  <Tooltip title="View Details">
                    <IconButton
                      onClick={() => onViewAnalysis(analysis.id)}
                      aria-label="view"
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Edit">
                  <IconButton
                    onClick={() => handleEditDialogOpen(analysis)}
                    aria-label="edit"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    onClick={() => handleDeleteDialogOpen(analysis)}
                    aria-label="delete"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          ))}
        </List>
      )}

      {/* Create Analysis Dialog */}
      <AnalysisFormDialog
        open={createDialogOpen}
        onClose={handleCreateDialogClose}
        onSubmit={handleCreateSubmit}
        isLoading={isSubmitting}
        title="Create Analysis"
        submitButtonText="Create"
        initialTitle=""
        initialDescription=""
      />

      {/* Edit Analysis Dialog */}
      <AnalysisFormDialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        onSubmit={handleEditSubmit}
        isLoading={isSubmitting}
        title="Edit Analysis"
        submitButtonText="Update"
        initialTitle={selectedAnalysis?.title || ''}
        initialDescription={selectedAnalysis?.description || ''}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteConfirm}
        title="Delete Analysis"
        itemName={selectedAnalysis?.title || ''}
        isLoading={isDeleting}
      />
    </Box>
  );
};

export default AnalysisList; 