import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, FormControlLabel, Switch, 
  Typography, Paper, MenuItem, FormControl,
  InputLabel, IconButton, Grid, Divider, Alert,
  Select, SelectChangeEvent
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { SurveyQuestion, SurveyOption } from '@/store/slices/surveySlice';
import { QUESTION_TYPES, QuestionTypeId, requiresOptions, getQuestionTypeById } from '@/constants/questionTypes';

interface EditQuestionFormProps {
  question: SurveyQuestion & {
    type_id?: number;
    type?: {
      id: number;
      name: string;
    };
  };
  onUpdateQuestion: (questionId: string, questionData: Partial<SurveyQuestion>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const EditQuestionForm: React.FC<EditQuestionFormProps> = ({
  question,
  onUpdateQuestion,
  onCancel,
  isLoading = false
}) => {
  const [editedQuestion, setEditedQuestion] = useState<SurveyQuestion>({
    ...question,
    type_id: question.type?.id || question.type_id || 1,
    options: question.options || []
  });

  const [options, setOptions] = useState<SurveyOption[]>(question.options || []);
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    externalId?: string;
    options?: string;
  }>({});

  // Check if the selected question type requires options
  const needsOptions = editedQuestion.type_id ? requiresOptions(editedQuestion.type_id) : false;

  // Add default empty option when switching to a type that needs options
  useEffect(() => {
    if (needsOptions && options.length === 0) {
      setOptions([{ text: '', order_index: 0 }]);
    }
  }, [needsOptions, options.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setEditedQuestion(prev => ({ ...prev, [name as string]: value }));
    
    // Clear validation error when field is updated
    if (name === 'title' || name === 'external_question_id') {
      setValidationErrors(prev => ({
        ...prev,
        [name === 'title' ? 'title' : 'externalId']: undefined
      }));
    }
  };

  const handleTypeChange = (e: SelectChangeEvent) => {
    const typeId = Number(e.target.value);
    const selectedType = QUESTION_TYPES.find(type => type.id === typeId) || QUESTION_TYPES[0];
    
    setEditedQuestion(prev => ({ 
      ...prev, 
      type_id: typeId,
      type: {
        id: selectedType.id,
        name: selectedType.name
      }
    }));
    
    // Reset options when changing question types
    if (!requiresOptions(typeId)) {
      setOptions([]);
    }
  };

  const handleAddOption = () => {
    const newOption: SurveyOption = {
      text: '',
      order_index: options.length
    };
    
    setOptions([...options, newOption]);
    setValidationErrors(prev => ({ ...prev, options: undefined }));
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
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
    
    if (field === 'text' && value.trim()) {
      setValidationErrors(prev => ({ ...prev, options: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: { title?: string; externalId?: string; options?: string } = {};
    
    if (!editedQuestion.title.trim()) {
      errors.title = 'Question title is required';
    }
    
    if (editedQuestion.external_question_id && editedQuestion.external_question_id.length > 50) {
      errors.externalId = 'ID must be less than 50 characters';
    }
    
    if (needsOptions) {
      if (options.length === 0) {
        errors.options = 'At least one option is required';
      } else if (options.some(opt => !opt.text.trim())) {
        errors.options = 'All options must have text';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !question.id) {
      return;
    }

    const updatedQuestionData: Partial<SurveyQuestion> = {
      ...editedQuestion,
      options: needsOptions ? options : []
    };

    onUpdateQuestion(question.id, updatedQuestionData);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Edit Question
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="external_question_id"
              label="Question ID (Optional)"
              value={editedQuestion.external_question_id || ''}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              margin="normal"
              error={!!validationErrors.externalId}
              helperText={validationErrors.externalId || 'External identifier for this question'}
              disabled={isLoading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="order_index"
              label="Order Index"
              type="number"
              value={editedQuestion.order_index}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              margin="normal"
              InputProps={{ inputProps: { min: 0 } }}
              disabled={isLoading}
            />
          </Grid>
          
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
              error={!!validationErrors.title}
              helperText={validationErrors.title || 'Enter the question text'}
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="question-type-label">Question Type</InputLabel>
              <Select
                labelId="question-type-label"
                name="type"
                value={editedQuestion.type_id?.toString() || '1'}
                onChange={handleTypeChange}
                label="Question Type"
                disabled={isLoading}
              >
                {QUESTION_TYPES.map(type => (
                  <MenuItem key={type.id} value={type.id.toString()}>
                    {type.name} - {type.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {needsOptions && (
            <Grid item xs={12}>
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Answer Options
                </Typography>
                
                {validationErrors.options && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {validationErrors.options}
                  </Alert>
                )}
                
                {options.map((option, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 1,
                      gap: 1 
                    }}
                  >
                    <TextField
                      label={`Option ${index + 1} Text`}
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                      disabled={isLoading}
                    />
                    
                    <TextField
                      label="Order"
                      type="number"
                      value={option.order_index}
                      onChange={(e) => handleOptionChange(index, 'order_index', Number(e.target.value))}
                      variant="outlined"
                      size="small"
                      sx={{ width: '100px' }}
                      InputProps={{ inputProps: { min: 0 } }}
                      disabled={isLoading}
                    />
                    
                    <IconButton 
                      onClick={() => handleRemoveOption(index)}
                      color="error"
                      disabled={isLoading || options.length <= 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddOption}
                  sx={{ mt: 1 }}
                  disabled={isLoading}
                >
                  Add Option
                </Button>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                onClick={onCancel}
                variant="outlined"
                color="secondary"
                disabled={isLoading}
              >
                Cancel
              </Button>
              
              <Button 
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading}
              >
                Update Question
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default EditQuestionForm; 