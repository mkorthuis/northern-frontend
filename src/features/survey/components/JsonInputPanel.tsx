import React, { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Alert
} from '@mui/material';
import { Check, Clear } from '@mui/icons-material';
import { SurveyQuestion } from '@/store/slices/surveySlice';
import { parseJSONToQuestions, getExampleJson } from '../utils/jsonUtils';

interface JsonInputPanelProps {
  onQuestionsAdded: (questions: SurveyQuestion[]) => void;
}

/**
 * Component for pasting and parsing JSON to create survey questions
 */
const JsonInputPanel: React.FC<JsonInputPanelProps> = ({ onQuestionsAdded }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<SurveyQuestion[]>([]);

  // Function to insert example JSON
  const handleInsertExample = () => {
    setJsonInput(getExampleJson());
    setJsonError(null);
  };

  // Function to validate and parse JSON input
  const handleJsonParse = () => {
    const result = parseJSONToQuestions(jsonInput);
    
    if (result.error) {
      setJsonError(result.error);
      return;
    }
    
    setParsedQuestions(result.questions);
    onQuestionsAdded(result.questions);
    setJsonError(null);
  };

  // Function to clear JSON input and parsed questions
  const handleClearJson = () => {
    setJsonInput('');
    setParsedQuestions([]);
    setJsonError(null);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Paste Question JSON
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Paste a valid JSON array of questions or a single question object to add to this survey.
      </Typography>
      
      <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.04)', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Example JSON format:
        </Typography>
        <Typography variant="caption" component="pre" sx={{ 
          overflowX: 'auto', 
          whiteSpace: 'pre-wrap',
          fontSize: '0.75rem',
          lineHeight: 1.5
        }}>
          {getExampleJson()}
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
          Question type IDs: 1=Text, 2=Textarea, 3=Single Choice, 4=Multiple Choice, 5=Dropdown, 6=Scale, 7=Date, 8=File Upload, 9=Matrix, 10=Ranking
        </Typography>
        <Button 
          size="small" 
          onClick={handleInsertExample}
          sx={{ mt: 1 }}
        >
          Insert Example
        </Button>
      </Box>
      
      <TextField
        fullWidth
        multiline
        rows={10}
        variant="outlined"
        placeholder='[{"title": "What is your name?", "type_id": 1, "is_required": true}]'
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        error={!!jsonError}
        helperText={jsonError}
        sx={{ mb: 2 }}
      />
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleJsonParse}
          startIcon={<Check />}
          disabled={!jsonInput.trim()}
        >
          Parse JSON
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleClearJson}
          startIcon={<Clear />}
        >
          Clear
        </Button>
      </Box>
      
      {parsedQuestions.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Successfully parsed {parsedQuestions.length} question{parsedQuestions.length !== 1 ? 's' : ''}
          </Alert>
        </Box>
      )}
    </Paper>
  );
};

export default JsonInputPanel; 