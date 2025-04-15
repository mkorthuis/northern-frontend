import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Alert, 
  CircularProgress, Dialog, DialogTitle, DialogContent, 
  DialogActions, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, LinearProgress
} from '@mui/material';
import { CloudUpload, CheckCircle } from '@mui/icons-material';
import Papa from 'papaparse';
import { surveyApi } from '@/services/api/endpoints/surveys';
import { SurveyQuestion, SurveySection } from '@/store/slices/surveySlice';
import { v4 as uuidv4 } from 'uuid';

interface SurveyResponseUploadProps {
  surveyId: string;
  onUploadComplete: (data: any) => void;
  onCancel: () => void;
}

interface ParsedResponse {
  [key: string]: string;
}

interface QuestionMapping {
  [externalQuestionId: string]: string; // Maps external_question_id to actual question_id
}

// Batch size constant for processing responses
const BATCH_SIZE = 10;

/**
 * Component for uploading CSV survey response data
 */
const SurveyResponseUpload: React.FC<SurveyResponseUploadProps> = ({ 
  surveyId, 
  onUploadComplete, 
  onCancel 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResponse[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStats, setUploadStats] = useState({ total: 0, processed: 0, success: 0, failed: 0 });
  const [questionMapping, setQuestionMapping] = useState<QuestionMapping>({});
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch survey questions to build mapping from external_question_id to question_id
  useEffect(() => {
    const fetchSurveyQuestions = async () => {
      if (!surveyId) return;
      
      try {
        setIsFetchingQuestions(true);
        const surveyData = await surveyApi.getSurveyById(surveyId, true);
        
        if (surveyData) {
          const mapping: QuestionMapping = {};
          
          // Process questions directly attached to the survey
          if (surveyData.questions) {
            surveyData.questions.forEach((question: SurveyQuestion) => {
              if (question.external_question_id && question.id) {
                mapping[question.external_question_id] = question.id;
              }
            });
          }
          
          // Process questions in sections
          if (surveyData.sections) {
            surveyData.sections.forEach((section: SurveySection) => {
              if (section.questions) {
                section.questions.forEach((question: SurveyQuestion) => {
                  if (question.external_question_id && question.id) {
                    mapping[question.external_question_id] = question.id;
                  }
                });
              }
            });
          }
          
          setQuestionMapping(mapping);
        }
      } catch (error) {
        console.error('Error fetching survey questions:', error);
        setUploadError('Failed to fetch survey questions for mapping');
      } finally {
        setIsFetchingQuestions(false);
      }
    };
    
    fetchSurveyQuestions();
  }, [surveyId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    setUploadStats({ total: 0, processed: 0, success: 0, failed: 0 });

    if (!selectedFile) {
      return;
    }

    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setUploadError('Please upload a valid CSV file');
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (csvFile: File) => {
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setUploadError(`Error parsing CSV: ${results.errors[0].message}`);
          return;
        }

        setParsedData(results.data as ParsedResponse[]);
        setUploadStats(prevStats => ({ ...prevStats, total: results.data.length }));
      },
      error: (error) => {
        setUploadError(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  const handleUpload = async () => {
    if (!file || parsedData.length === 0) {
      setUploadError('Please select a valid CSV file first');
      return;
    }

    if (Object.keys(questionMapping).length === 0) {
      setUploadError('Question mapping is not available. Cannot process responses.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    setUploadStats(prevStats => ({ ...prevStats, processed: 0, success: 0, failed: 0 }));

    try {
      // Track unmapped external IDs
      let unmappedExternalIds: Set<string> = new Set();
      
      // Process all responses first to prepare the mapped data
      const mappedResponses = parsedData.map(response => {
        // Map external question IDs to actual question IDs
        const mappedAnswers = Object.entries(response)
          .map(([externalId, answer]) => {
            // Look up the actual question_id from the mapping
            const questionId = questionMapping[externalId];
            
            if (!questionId) {
              unmappedExternalIds.add(externalId);
              return null; // Return null for unmapped questions
            }
            
            return {
              question_id: questionId,
              value: answer
            };
          })
          .filter(item => item !== null) as { question_id: string; value: string }[]; // Filter out null items
        
        // Create a survey response object with the mapped answers
        return {
          survey_id: surveyId,
          answers: mappedAnswers
        };
      }).filter(response => response.answers.length > 0); // Filter out responses with no valid answers
      
      // If no valid responses after mapping, show error
      if (mappedResponses.length === 0) {
        throw new Error('No valid responses found after mapping question IDs');
      }
      
      // Process responses in batches of BATCH_SIZE
      const totalBatches = Math.ceil(mappedResponses.length / BATCH_SIZE);
      let processedCount = 0;
      let successCount = 0;
      let failedCount = 0;
      
      // Update progress UI to show that we're starting
      setUploadProgress(5);
      
      // Process each batch
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        // Get current batch of responses
        const startIdx = batchIndex * BATCH_SIZE;
        const endIdx = Math.min(startIdx + BATCH_SIZE, mappedResponses.length);
        const batchResponses = mappedResponses.slice(startIdx, endIdx);
        
        // Create the bulk upload request data for this batch
        const bulkData = {
          survey_id: surveyId,
          responses: batchResponses,
          batch_metadata: {
            upload_timestamp: new Date().toISOString(),
            source: 'csv_upload',
            batch_number: batchIndex + 1,
            total_batches: totalBatches
          }
        };
        
        try {
          // Call the bulk API endpoint for this batch
          const result = await surveyApi.createSurveyResponsesBulk(bulkData);
          
          // Calculate success count for this batch
          const batchResponseData = Array.isArray(result.data) ? result.data : [];
          const batchSuccessCount = batchResponseData.length;
          const batchFailedCount = batchResponses.length - batchSuccessCount;
          
          // Update running totals
          successCount += batchSuccessCount;
          failedCount += batchFailedCount;
          processedCount += batchResponses.length;
          
          // Update progress based on batches completed
          const progress = Math.floor(((batchIndex + 1) / totalBatches) * 95) + 5; // 5-100% range
          setUploadProgress(progress);
          
          // Update stats
          setUploadStats({
            total: mappedResponses.length,
            processed: processedCount,
            success: successCount,
            failed: failedCount
          });
        } catch (error) {
          console.error(`Error processing batch ${batchIndex + 1}:`, error);
          // Mark all responses in this batch as failed
          failedCount += batchResponses.length;
          processedCount += batchResponses.length;
          
          // Update stats
          setUploadStats({
            total: mappedResponses.length,
            processed: processedCount,
            success: successCount,
            failed: failedCount
          });
        }
      }
      
      // Update progress to show completion
      setUploadProgress(100);
      
      if (unmappedExternalIds.size > 0) {
        const unmappedList = Array.from(unmappedExternalIds).join(', ');
        setUploadError(`The following external question IDs were not found in the survey and were skipped: ${unmappedList}`);
      } else if (failedCount > 0) {
        setUploadError(`Completed with errors: ${failedCount} responses failed to upload.`);
      }
      
      setUploadSuccess(true);
      onUploadComplete({ 
        totalResponses: parsedData.length, 
        successCount, 
        failedCount 
      });
    } catch (error) {
      setUploadError(`Failed to upload data: ${(error as Error).message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePreviewToggle = () => {
    setPreviewOpen(!previewOpen);
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  // Get column headers for preview table
  const getColumnHeaders = () => {
    if (parsedData.length === 0) return [];
    return Object.keys(parsedData[0]);
  };

  // Display warning for unmapped question headers
  const getUnmappedHeaders = () => {
    if (parsedData.length === 0 || Object.keys(questionMapping).length === 0) return [];
    
    const headers = getColumnHeaders().filter(header => 
      !questionMapping[header]
    );
    
    return headers;
  };

  return (
    <Paper sx={{ p: 3, mb: 3, maxWidth: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Upload Survey Responses
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Upload a CSV file containing survey responses. The file should include a header row with external question IDs and each row representing a respondent's answers.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Note: The column headers should match the external_question_id values of your survey questions. Any columns that cannot be matched to a question will be skipped.
        </Typography>
      </Box>

      {isFetchingQuestions && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography variant="body2">
            Loading question mappings...
          </Typography>
        </Box>
      )}

      <Box 
        sx={{ 
          border: '2px dashed #ccc', 
          borderRadius: 2, 
          p: 3, 
          textAlign: 'center',
          mb: 3,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.03)'
          }
        }}
        onClick={handleSelectFile}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {file ? file.name : 'Select or drop your CSV file here'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {file ? `${(file.size / 1024).toFixed(2)} KB` : 'CSV format only (.csv)'}
        </Typography>
      </Box>

      {uploadError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {uploadError}
        </Alert>
      )}

      {isUploading && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Uploading responses: {uploadStats.processed} of {uploadStats.total}
            </Typography>
            <Typography variant="body2" color="success.main" sx={{ mr: 1 }}>
              Success: {uploadStats.success}
            </Typography>
            {uploadStats.failed > 0 && (
              <Typography variant="body2" color="error">
                Failed: {uploadStats.failed}
              </Typography>
            )}
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress} 
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>
      )}

      {uploadSuccess && (
        <Alert 
          icon={<CheckCircle fontSize="inherit" />} 
          severity="success" 
          sx={{ mb: 3 }}
        >
          {uploadStats.failed > 0 
            ? `Upload completed with ${uploadStats.success} successful and ${uploadStats.failed} failed responses.` 
            : `All ${uploadStats.success} responses uploaded successfully!`}
        </Alert>
      )}

      {parsedData.length > 0 && !uploadSuccess && !isUploading && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Successfully parsed {parsedData.length} responses.
          </Typography>
          
          {/* Show warning for unmapped question headers */}
          {getUnmappedHeaders().length > 0 && (
            <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                The following column headers don't match any external question IDs in the survey and will be skipped:
              </Typography>
              <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace' }}>
                {getUnmappedHeaders().join(', ')}
              </Typography>
            </Alert>
          )}
          
          <Button 
            variant="outlined" 
            onClick={handlePreviewToggle} 
            size="small"
            sx={{ mt: 1 }}
          >
            {previewOpen ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </Box>
      )}

      <Dialog 
        open={previewOpen} 
        onClose={handlePreviewToggle}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Data Preview</DialogTitle>
        <DialogContent dividers>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {getColumnHeaders().map((header) => (
                    <TableCell 
                      key={header} 
                      sx={{
                        bgcolor: (theme) => 
                          !questionMapping[header] 
                            ? theme.palette.warning.light 
                            : undefined
                      }}
                    >
                      {header}
                      {!questionMapping[header] && (
                        <Typography variant="caption" component="div" color="error">
                          (Not mapped)
                        </Typography>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {parsedData.slice(0, 10).map((row, index) => (
                  <TableRow key={index}>
                    {getColumnHeaders().map((header) => (
                      <TableCell key={`${index}-${header}`}>
                        {row[header]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {parsedData.length > 10 && (
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
              Showing 10 of {parsedData.length} rows
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePreviewToggle}>Close</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={onCancel}
          disabled={isUploading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={
            !file || 
            isUploading || 
            parsedData.length === 0 || 
            uploadSuccess || 
            isFetchingQuestions || 
            Object.keys(questionMapping).length === 0
          }
          startIcon={isUploading ? <CircularProgress size={20} /> : undefined}
        >
          {isUploading ? 'Uploading...' : 'Upload Responses'}
        </Button>
      </Box>
    </Paper>
  );
};

export default SurveyResponseUpload; 