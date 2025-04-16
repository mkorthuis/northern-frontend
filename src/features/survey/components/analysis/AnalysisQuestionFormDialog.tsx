import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Typography,
  Box,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Alert
} from '@mui/material';
import { SurveyQuestion } from '@/store/slices/surveySlice';
import { ChartType, SurveyQuestionTopic, SurveyReportSegment } from '@/store/slices/surveyAnalysisSlice';

interface AnalysisQuestionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    question_id: string;
    chart_type_id: number;
    sort_by_value: boolean;
    topic_ids?: string[] | null;
    report_segment_ids?: string[] | null;
  }) => Promise<void>;
  isLoading: boolean;
  title: string;
  submitButtonText: string;
  analysisId: string;
  chartTypes: ChartType[];
  availableQuestions: SurveyQuestion[];
  availableTopics: SurveyQuestionTopic[];
  availableSegments: SurveyReportSegment[];
  initialValues?: {
    question_id?: string;
    chart_type_id?: number;
    sort_by_value?: boolean;
    topic_ids?: string[];
    report_segment_ids?: string[];
  };
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const AnalysisQuestionFormDialog: React.FC<AnalysisQuestionFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  title,
  submitButtonText,
  analysisId,
  chartTypes,
  availableQuestions,
  availableTopics,
  availableSegments,
  initialValues = {
    question_id: '',
    chart_type_id: 1, // Default to bar chart
    sort_by_value: false,
    topic_ids: [],
    report_segment_ids: []
  }
}) => {
  // Track whether the dialog has been initialized
  const hasInitialized = useRef(false);
  
  const [questionId, setQuestionId] = useState(initialValues.question_id || '');
  const [chartTypeId, setChartTypeId] = useState(initialValues.chart_type_id || 1);
  const [sortByValue, setSortByValue] = useState(initialValues.sort_by_value || false);
  const [topicIds, setTopicIds] = useState<string[]>(initialValues.topic_ids || []);
  const [segmentIds, setSegmentIds] = useState<string[]>(initialValues.report_segment_ids || []);
  const [formError, setFormError] = useState('');

  // Reset form only when dialog first opens (not on every re-render)
  useEffect(() => {
    // Initialize only once when dialog opens
    if (open && !hasInitialized.current) {
      setQuestionId(initialValues.question_id || '');
      setChartTypeId(initialValues.chart_type_id || 1);
      setSortByValue(initialValues.sort_by_value || false);
      setTopicIds(initialValues.topic_ids || []);
      setSegmentIds(initialValues.report_segment_ids || []);
      setFormError('');
      
      // Only log when dialog first opens
      console.log("Dialog opened with available questions:", availableQuestions.length);
      console.log("Form initialized with defaults");
      
      // Mark as initialized
      hasInitialized.current = true;
    } else if (!open) {
      // Reset the initialization flag when dialog closes
      hasInitialized.current = false;
    }
  }, [open, initialValues]);

  const handleQuestionChange = (event: SelectChangeEvent) => {
    const newQuestionId = event.target.value;
    console.log("Selected question ID:", newQuestionId);
    
    // Verify the question exists before setting the ID
    const foundQuestion = availableQuestions.find(q => q.id === newQuestionId);
    if (foundQuestion) {
      console.log("Found question:", foundQuestion.title);
      setQuestionId(newQuestionId);
    } else {
      console.error("Selected question not found in availableQuestions!", {
        selectedId: newQuestionId,
        availableIds: availableQuestions.map(q => q.id)
      });
      setFormError('Selected question not found. Please try again or select a different question.');
    }
  };

  const handleChartTypeChange = (event: SelectChangeEvent) => {
    setChartTypeId(Number(event.target.value));
  };

  const handleSortByValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSortByValue(event.target.checked);
  };

  const handleTopicChange = (event: SelectChangeEvent<typeof topicIds>) => {
    const value = event.target.value;
    setTopicIds(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSegmentChange = (event: SelectChangeEvent<typeof segmentIds>) => {
    const value = event.target.value;
    setSegmentIds(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!questionId) {
      setFormError('Question is required');
      return;
    }
    
    await onSubmit({
      question_id: questionId,
      chart_type_id: chartTypeId,
      sort_by_value: sortByValue,
      topic_ids: topicIds.length > 0 ? topicIds : null,
      report_segment_ids: segmentIds.length > 0 ? segmentIds : null
    });
  };

  // Find the selected question for display
  const selectedQuestion = availableQuestions.find(q => q.id === questionId);

  return (
    <Dialog 
      open={open} 
      onClose={isLoading ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {formError && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {formError}
            </Typography>
          )}
          
          {availableQuestions.length === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              No available questions to add. All questions may have already been added to this analysis.
            </Alert>
          )}

          <FormControl fullWidth margin="normal" required>
            <InputLabel id="question-select-label">Question</InputLabel>
            <Select
              labelId="question-select-label"
              id="question-select"
              value={questionId}
              onChange={handleQuestionChange}
              label="Question"
              disabled={isLoading || availableQuestions.length === 0}
            >
              {availableQuestions.map((question) => (
                <MenuItem 
                  key={question.id || `question-${Math.random()}`} 
                  value={question.id || ''}
                  disabled={!question.id}
                >
                  <Box>
                    <Typography variant="subtitle2">
                      {question.title} {!question.id && '(No ID - Cannot Select)'}
                    </Typography>
                    {question.description && (
                      <Typography variant="caption" color="textSecondary">
                        {question.description}
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" required>
            <InputLabel id="chart-type-select-label">Chart Type</InputLabel>
            <Select
              labelId="chart-type-select-label"
              id="chart-type-select"
              value={chartTypeId.toString()}
              onChange={handleChartTypeChange}
              label="Chart Type"
              disabled={isLoading}
            >
              {chartTypes.map((chartType) => (
                <MenuItem key={chartType.id} value={chartType.id.toString()}>
                  {chartType.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={sortByValue}
                onChange={handleSortByValueChange}
                disabled={isLoading}
                name="sortByValue"
              />
            }
            label="Sort by value (instead of label)"
            sx={{ my: 2 }}
          />

          {availableTopics.length > 0 && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="topics-select-label">Topics</InputLabel>
              <Select
                labelId="topics-select-label"
                id="topics-select"
                multiple
                value={topicIds}
                onChange={handleTopicChange}
                input={<OutlinedInput id="select-multiple-topics" label="Topics" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const topic = availableTopics.find(t => t.id === value);
                      return (
                        <Chip key={value} label={topic ? topic.name : value} />
                      );
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
                disabled={isLoading}
              >
                {availableTopics.map((topic) => (
                  <MenuItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {availableSegments.length > 0 && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="segments-select-label">Segments</InputLabel>
              <Select
                labelId="segments-select-label"
                id="segments-select"
                multiple
                value={segmentIds}
                onChange={handleSegmentChange}
                input={<OutlinedInput id="select-multiple-segments" label="Segments" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const segment = availableSegments.find(s => s.id === value);
                      return (
                        <Chip key={value} label={segment ? segment.name : value} />
                      );
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
                disabled={isLoading}
              >
                {availableSegments.map((segment) => (
                  <MenuItem key={segment.id} value={segment.id}>
                    {segment.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {selectedQuestion && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 123, 255, 0.1)', borderRadius: 1, border: '1px solid rgba(0, 123, 255, 0.3)' }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Selected Question Preview:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {selectedQuestion.title}
              </Typography>
              {selectedQuestion.description && (
                <Typography variant="body2" color="textSecondary">
                  {selectedQuestion.description}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading} color="inherit">
            Cancel
          </Button>
          <Button 
            type="submit"
            color="primary"
            variant="contained"
            disabled={isLoading || !questionId}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Saving...' : submitButtonText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AnalysisQuestionFormDialog; 