import React from 'react';
import {
  Box, Typography, Paper, Button
} from '@mui/material';
import { Clear } from '@mui/icons-material';
import { SurveyQuestion } from '@/store/slices/surveySlice';
import { QUESTION_TYPES } from '@/constants/questionTypes';

interface QuestionSummaryProps {
  questions: SurveyQuestion[];
  onClearQuestions: () => void;
}

/**
 * Component to display a summary of survey questions
 */
const QuestionSummary: React.FC<QuestionSummaryProps> = ({ 
  questions, 
  onClearQuestions 
}) => {
  if (questions.length === 0) {
    return null;
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          Questions Summary
        </Typography>
        <Button 
          variant="outlined" 
          color="error" 
          size="small"
          onClick={onClearQuestions}
          startIcon={<Clear />}
        >
          Clear All Questions
        </Button>
      </Box>
      
      <Paper variant="outlined" sx={{ p: 2, maxHeight: '300px', overflow: 'auto' }}>
        {questions.map((q, idx) => (
          <Box key={idx} sx={{ mb: 1, pb: 1, borderBottom: idx < questions.length - 1 ? '1px solid #eee' : 'none' }}>
            <Typography variant="body2" fontWeight="bold">
              {idx + 1}. {q.title} {q.is_required ? '*' : ''}
            </Typography>
            {q.description && (
              <Typography variant="caption" color="textSecondary" display="block">
                {q.description}
              </Typography>
            )}
            <Typography variant="caption" color="primary">
              Type: {QUESTION_TYPES.find((type: { id: number }) => type.id === q.type_id)?.name || 'Unknown'}
              {q.options && q.options.length > 0 && ` (${q.options.length} options)`}
            </Typography>
          </Box>
        ))}
      </Paper>
    </Paper>
  );
};

export default QuestionSummary; 