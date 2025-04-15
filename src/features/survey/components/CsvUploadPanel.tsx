import React, { useState, useRef } from 'react';
import {
  Box, Typography, Paper, Button, Alert, CircularProgress
} from '@mui/material';
import { Check, Clear, Description, Download } from '@mui/icons-material';
import { SurveyQuestion } from '@/store/slices/surveySlice';
import { 
  parseCSVToQuestions, 
  getSampleCSVContent, 
  downloadCSV 
} from '../utils/csvUtils';

interface CsvUploadPanelProps {
  onQuestionsAdded: (questions: SurveyQuestion[]) => void;
}

/**
 * Component for uploading and processing CSV files to create survey questions
 */
const CsvUploadPanel: React.FC<CsvUploadPanelProps> = ({ onQuestionsAdded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvProcessing, setCsvProcessing] = useState(false);

  // Function to handle CSV file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      
      // Check if it's a CSV file
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setCsvError('Please upload a CSV file');
        return;
      }
      
      setCsvFile(file);
      setCsvError(null);
    }
  };

  // Function to clear CSV file and related state
  const handleClearCsv = () => {
    setCsvFile(null);
    setCsvError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Function to download sample CSV file
  const handleDownloadSample = () => {
    downloadCSV(getSampleCSVContent(), 'survey_questions_sample.csv');
  };

  // Function to parse the CSV file
  const handleProcessCsv = async () => {
    if (!csvFile) {
      setCsvError('Please select a CSV file first');
      return;
    }
    
    setCsvProcessing(true);
    setCsvError(null);
    
    try {
      const text = await csvFile.text();
      const result = parseCSVToQuestions(text);
      
      if (result.error) {
        setCsvError(result.error);
        setCsvProcessing(false);
        return;
      }
      
      if (result.questions.length > 0) {
        onQuestionsAdded(result.questions);
        
        // Clear CSV file but keep the parsed questions
        setCsvFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err: any) {
      console.error('Error processing CSV:', err);
      setCsvError(`Error processing CSV: ${err.message || 'Unknown error'}`);
    } finally {
      setCsvProcessing(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Upload Questions CSV
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Upload a CSV file with survey questions. The CSV should include columns for question_id, question_text, and response_options.
      </Typography>
      
      <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.04)', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Expected CSV Format:
        </Typography>
        <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
          question_id,question_text,response_options,chart_type,question_topic_name,report_segments<br />
          Q1,How frequently do you drink alcohol?,"Daily,4-6 times a week,2-3 times a week",bar,Consumption Behavior,All Alcohol<br />
          Q2,What's your favorite alcoholic drink when brunching?,"Mimosa,Bloody Mary,Beer",horizontalBar,Consumption Behavior,All Alcohol
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
          Note: The CSV should have the fields in the header row. Response options can include commas within quotes.
        </Typography>
        <Button 
          size="small" 
          startIcon={<Download />}
          onClick={handleDownloadSample}
          sx={{ mt: 1 }}
        >
          Download Sample CSV
        </Button>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <input
          ref={fileInputRef}
          accept=".csv"
          id="csv-file-upload"
          type="file"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <label htmlFor="csv-file-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<Description />}
            sx={{ mr: 2 }}
          >
            Select CSV File
          </Button>
        </label>
        
        {csvFile && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Selected file: <strong>{csvFile.name}</strong> ({Math.round(csvFile.size / 1024)} KB)
          </Typography>
        )}
        
        {csvError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {csvError}
          </Alert>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleProcessCsv}
          startIcon={csvProcessing ? <CircularProgress size={20} color="inherit" /> : <Check />}
          disabled={!csvFile || csvProcessing}
        >
          {csvProcessing ? 'Processing...' : 'Process CSV'}
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleClearCsv}
          startIcon={<Clear />}
          disabled={csvProcessing}
        >
          Clear
        </Button>
      </Box>
    </Paper>
  );
};

export default CsvUploadPanel; 