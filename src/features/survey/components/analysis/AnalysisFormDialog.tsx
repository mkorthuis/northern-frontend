import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress
} from '@mui/material';

interface AnalysisFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string }) => Promise<void>;
  isLoading: boolean;
  title: string;
  submitButtonText: string;
  initialTitle?: string;
  initialDescription?: string;
}

const AnalysisFormDialog: React.FC<AnalysisFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  title,
  submitButtonText,
  initialTitle = '',
  initialDescription = ''
}) => {
  const [analysisTitle, setAnalysisTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [titleError, setTitleError] = useState('');

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (open) {
      setAnalysisTitle(initialTitle);
      setDescription(initialDescription);
      setTitleError('');
    }
  }, [open, initialTitle, initialDescription]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAnalysisTitle(value);
    
    if (!value.trim()) {
      setTitleError('Title is required');
    } else {
      setTitleError('');
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!analysisTitle.trim()) {
      setTitleError('Title is required');
      return;
    }
    
    await onSubmit({
      title: analysisTitle.trim(),
      description: description.trim()
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={isLoading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            label="Title"
            type="text"
            fullWidth
            value={analysisTitle}
            onChange={handleTitleChange}
            disabled={isLoading}
            error={!!titleError}
            helperText={titleError}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="description"
            label="Description"
            multiline
            rows={4}
            fullWidth
            value={description}
            onChange={handleDescriptionChange}
            disabled={isLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading} color="inherit">
            Cancel
          </Button>
          <Button 
            type="submit"
            color="primary"
            variant="contained"
            disabled={isLoading || !!titleError}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Saving...' : submitButtonText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AnalysisFormDialog; 