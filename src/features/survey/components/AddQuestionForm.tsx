import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, FormControlLabel, Switch, 
  Typography, Paper, MenuItem, FormControl,
  InputLabel, IconButton, Grid, Divider, Alert,
  Select, SelectChangeEvent
} from '@mui/material';
import { Add, Remove, Save } from '@mui/icons-material';
import { SurveyQuestion } from '@/store/slices/surveySlice';
import { QUESTION_TYPES, QuestionTypeId, requiresOptions } from '@/constants/questionTypes';

interface AddQuestionFormProps {
  surveyId: string;
  onAddQuestion: (surveyId: string, questionData: SurveyQuestion) => Promise<any>;
  onCancel: () => void;
  sectionId?: string;
  isLoading: boolean;
}

const defaultQuestionState: SurveyQuestion = {
  title: '',
  description: '',
  is_required: false,
  order_index: 0,
  type_id: QuestionTypeId.TEXT,
  section_id: null,
  allow_multiple: false,
  max_answers: null,
  options: []
};

interface QuestionOption {
  text: string;
  order_index: number;
  is_other_option: boolean;
  score?: number | null;
}

const AddQuestionForm: React.FC<AddQuestionFormProps> = ({
  surveyId,
  onAddQuestion,
  onCancel,
  sectionId,
  isLoading
}) => {
  const [question, setQuestion] = useState<SurveyQuestion>({
    ...defaultQuestionState,
    section_id: sectionId || null
  });
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Check if the selected question type requires options
  const needsOptions = requiresOptions(question.type_id);

  // Add default empty option when switching to a type that needs options
  useEffect(() => {
    if (needsOptions && options.length === 0) {
      setOptions([{ text: '', order_index: 0, is_other_option: false }]);
    }
  }, [needsOptions, options.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setQuestion(prev => ({ ...prev, [name as string]: value }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setQuestion(prev => ({ ...prev, [name]: checked }));
  };

  const handleTypeChange = (e: SelectChangeEvent) => {
    const typeId = Number(e.target.value);
    setQuestion(prev => ({ ...prev, type_id: typeId }));
    
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

  const handleOptionChange = (index: number, field: keyof QuestionOption, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!question.title.trim()) {
      setError('Question title is required');
      return;
    }

    if (needsOptions && (!options.length || options.some(opt => !opt.text.trim()))) {
      setError('All options must have text');
      return;
    }

    try {
      // Construct the final question data with options if needed
      const questionData: SurveyQuestion = {
        ...question,
        options: needsOptions ? options : []
      };

      await onAddQuestion(surveyId, questionData);
      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setQuestion({
          ...defaultQuestionState,
          section_id: sectionId || null
        });
        setOptions([]);
        setSuccess(false);
        onCancel(); // Close the form
      }, 1500);
    } catch (err) {
      console.error('Error adding question:', err);
      setError('Failed to add question. Please try again.');
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add New Question
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>Question added successfully!</Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              name="title"
              label="Question Title"
              value={question.title}
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
              value={question.description || ''}
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
                value={question.type_id.toString()}
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
                    checked={question.is_required || false}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label="Required Question"
              />

              {(question.type_id === QuestionTypeId.MULTIPLE_CHOICE) && (
                <FormControlLabel
                  control={
                    <Switch
                      name="allow_multiple"
                      checked={question.allow_multiple || false}
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
                  
                  {question.type_id === QuestionTypeId.SCALE && (
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
                        checked={option.is_other_option}
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
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<Save />}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Question'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default AddQuestionForm; 