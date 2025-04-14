import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, FormControlLabel, Switch, 
  Typography, Paper, MenuItem, FormControl,
  InputLabel, IconButton, Grid, Divider, Alert,
  Select, SelectChangeEvent
} from '@mui/material';
import { Edit, Delete, Add, Remove, Save, Cancel } from '@mui/icons-material';
import { SurveyQuestion, SurveyOption } from '@/store/slices/surveySlice';
import { QUESTION_TYPES, QuestionTypeId, requiresOptions } from '@/constants/questionTypes';

interface EditQuestionFormProps {
  surveyId: string;
  question: SurveyQuestion;
  onUpdateQuestion: (questionId: string, questionData: Partial<SurveyQuestion>) => Promise<any>;
  onDeleteQuestion: (surveyId: string, questionId: string) => Promise<any>;
  onCancel: () => void;
  isUpdateLoading: boolean;
  isDeleteLoading: boolean;
}

const EditQuestionForm: React.FC<EditQuestionFormProps> = ({
  surveyId,
  question,
  onUpdateQuestion,
  onDeleteQuestion,
  onCancel,
  isUpdateLoading,
  isDeleteLoading
}) => {
  // Set default type_id to TEXT if it's undefined in the question
  const initialQuestion: SurveyQuestion = {
    ...question,
    type_id: question.type_id || QuestionTypeId.TEXT
  };

  const [editedQuestion, setEditedQuestion] = useState<SurveyQuestion>(initialQuestion);
  const [options, setOptions] = useState<SurveyOption[]>(question.options || []);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  // Check if the selected question type requires options
  const needsOptions = requiresOptions(editedQuestion.type_id);

  // Add default empty option when switching to a type that needs options
  useEffect(() => {
    if (needsOptions && options.length === 0) {
      setOptions([{ 
        text: '', 
        order_index: 0, 
        is_other_option: false 
      }]);
    }
  }, [needsOptions, options.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setEditedQuestion(prev => ({ ...prev, [name as string]: value }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEditedQuestion(prev => ({ ...prev, [name]: checked }));
  };

  const handleTypeChange = (e: SelectChangeEvent) => {
    const typeId = Number(e.target.value);
    setEditedQuestion(prev => ({ ...prev, type_id: typeId }));
    
    // Reset options when changing question types
    if (!requiresOptions(typeId)) {
      setOptions([]);
    }
  };

  const handleAddOption = () => {
    setOptions([
      ...options,
      { 
        text: '', 
        order_index: options.length, 
        is_other_option: false 
      }
    ]);
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    // Re-index the options
    const reindexedOptions = updatedOptions.map((option, i) => ({
      ...option,
      order_index: i
    }));
    setOptions(reindexedOptions);
  };

  const handleOptionChange = (index: number, field: keyof SurveyOption, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!editedQuestion.title.trim()) {
      setError('Question title is required');
      return;
    }

    if (needsOptions && (!options.length || options.some(opt => !opt.text.trim()))) {
      setError('All options must have text');
      return;
    }

    try {
      // Construct the final question data with options if needed
      const questionData: Partial<SurveyQuestion> = {
        ...editedQuestion,
        options: needsOptions ? options : []
      };

      if (question.id) {
        await onUpdateQuestion(question.id, questionData);
        setSuccess(true);
        
        // Hide the form after successful update
        setTimeout(() => {
          setSuccess(false);
          onCancel();
        }, 1500);
      }
    } catch (err) {
      console.error('Error updating question:', err);
      setError('Failed to update question. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      if (question.id) {
        await onDeleteQuestion(surveyId, question.id);
        onCancel();
      }
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Failed to delete question. Please try again.');
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" gutterBottom>
          Edit Question
        </Typography>
        {!confirmDelete ? (
          <Button
            startIcon={<Delete />}
            color="error"
            onClick={() => setConfirmDelete(true)}
            disabled={isDeleteLoading || isUpdateLoading}
          >
            Delete
          </Button>
        ) : (
          <Box>
            <Typography variant="body2" color="error" sx={{ mr: 2, display: 'inline' }}>
              Confirm deletion?
            </Typography>
            <Button
              size="small"
              color="error"
              variant="contained"
              onClick={handleDelete}
              disabled={isDeleteLoading}
              sx={{ mr: 1 }}
            >
              Yes
            </Button>
            <Button
              size="small"
              onClick={() => setConfirmDelete(false)}
              disabled={isDeleteLoading}
            >
              No
            </Button>
          </Box>
        )}
      </Box>
      <Divider sx={{ mb: 2 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>Question updated successfully!</Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              name="title"
              label="Question Title"
              value={editedQuestion.title}
              onChange={handleInputChange}
              fullWidth
              required
              variant="outlined"
              margin="normal"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description (Optional)"
              value={editedQuestion.description || ''}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="question-type-label">Question Type</InputLabel>
              <Select
                labelId="question-type-label"
                name="type_id"
                value={editedQuestion.type_id?.toString() || QuestionTypeId.TEXT.toString()}
                onChange={handleTypeChange}
                label="Question Type"
              >
                {QUESTION_TYPES.map(type => (
                  <MenuItem key={type.id} value={type.id.toString()}>
                    {type.name} - {type.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mt={3}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_required"
                    checked={editedQuestion.is_required || false}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label="Required Question"
              />

              {(editedQuestion.type_id === QuestionTypeId.MULTIPLE_CHOICE) && (
                <FormControlLabel
                  control={
                    <Switch
                      name="allow_multiple"
                      checked={editedQuestion.allow_multiple || false}
                      onChange={handleSwitchChange}
                      color="primary"
                    />
                  }
                  label="Allow Multiple Selections"
                />
              )}
            </Box>
          </Grid>

          {/* Options section for question types that need options */}
          {needsOptions && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Answer Options
              </Typography>

              {options.map((option, index) => (
                <Box key={index} display="flex" alignItems="center" mb={1}>
                  <TextField
                    label={`Option ${index + 1}`}
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  
                  {editedQuestion.type_id === QuestionTypeId.SCALE && (
                    <TextField
                      label="Score"
                      type="number"
                      value={option.score || ''}
                      onChange={(e) => handleOptionChange(index, 'score', parseInt(e.target.value) || null)}
                      variant="outlined"
                      size="small"
                      sx={{ width: '100px', mr: 1 }}
                    />
                  )}
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={option.is_other_option || false}
                        onChange={(e) => handleOptionChange(index, 'is_other_option', e.target.checked)}
                        size="small"
                      />
                    }
                    label="Other"
                    sx={{ mr: 1 }}
                  />
                  
                  <IconButton 
                    onClick={() => handleRemoveOption(index)}
                    disabled={options.length <= 1}
                    color="error"
                    size="small"
                  >
                    <Remove />
                  </IconButton>
                </Box>
              ))}

              <Button
                startIcon={<Add />}
                onClick={handleAddOption}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              >
                Add Option
              </Button>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" mt={3}>
              <Button 
                onClick={onCancel} 
                sx={{ mr: 1 }}
                disabled={isUpdateLoading || isDeleteLoading}
                startIcon={<Cancel />}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<Save />}
                disabled={isUpdateLoading || isDeleteLoading}
              >
                {isUpdateLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default EditQuestionForm; 