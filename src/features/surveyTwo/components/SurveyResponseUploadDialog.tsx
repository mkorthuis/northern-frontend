import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { CloudUpload, CheckCircle, DeleteForever } from '@mui/icons-material';
import Papa from 'papaparse';
import { surveyApi } from '@/services/api/endpoints/surveys';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentSurvey, fetchSurveyById, deleteAllSurveyResponses } from '@/store/slices/surveySlice';
import { AppDispatch } from '@/store/store';

interface SurveyResponseUploadDialogProps {
  open: boolean;
  surveyId: string;
  onComplete: (data: { totalResponses: number; successCount: number; failedCount: number }) => void;
  onCancel: () => void;
}

interface ParsedResponse {
  [key: string]: string;
}

interface QuestionIdMapping {
  [externalId: string]: string; // maps external_question_id to UUID
}

const BATCH_SIZE = 10;

interface UploadResults {
  totalResponses: number;
  successCount: number;
  failedCount: number;
}

const SurveyResponseUploadDialog: React.FC<SurveyResponseUploadDialogProps> = ({
  open,
  surveyId,
  onComplete,
  onCancel
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentSurvey = useSelector(selectCurrentSurvey);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResponse[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStats, setUploadStats] = useState({ total: 0, processed: 0, success: 0, failed: 0 });
  const [validExternalIds, setValidExternalIds] = useState<Set<string>>(new Set());
  const [questionIdMapping, setQuestionIdMapping] = useState<QuestionIdMapping>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadResults, setUploadResults] = useState<UploadResults | null>(null);
  const [deleteExistingResponses, setDeleteExistingResponses] = useState(false);
  const [isDeletingResponses, setIsDeletingResponses] = useState(false);

  useEffect(() => {
    // Fetch survey data when dialog opens
    if (open && surveyId) {
      dispatch(fetchSurveyById({ surveyId }));
    }
  }, [open, surveyId, dispatch]);

  useEffect(() => {
    if (currentSurvey?.questions) {
      // Create a set of valid external question IDs and their UUID mappings
      const validIds = new Set<string>();
      const idMapping: QuestionIdMapping = {};
      
      currentSurvey.questions.forEach(q => {
        if (q.external_question_id && q.id) {
          validIds.add(q.external_question_id);
          idMapping[q.external_question_id] = q.id;
        }
      });
      
      setValidExternalIds(validIds);
      setQuestionIdMapping(idMapping);
    }
  }, [currentSurvey]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    resetState();

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

  const resetState = () => {
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    setUploadStats({ total: 0, processed: 0, success: 0, failed: 0 });
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
        setUploadStats(prev => ({ ...prev, total: results.data.length }));
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

    setIsUploading(true);
    resetState();

    try {
      // If user opted to delete existing responses, do that first
      if (deleteExistingResponses) {
        setIsDeletingResponses(true);
        setUploadProgress(2);
        try {
          const result = await dispatch(deleteAllSurveyResponses(surveyId)).unwrap();
          console.log(`Deleted ${result.deletedCount} existing responses`);
        } catch (error) {
          console.error('Failed to delete existing responses:', error);
          setUploadError('Failed to delete existing responses. Proceeding with upload.');
        }
        setIsDeletingResponses(false);
      }

      const totalBatches = Math.ceil(parsedData.length / BATCH_SIZE);
      let processedCount = 0;
      let successCount = 0;
      let failedCount = 0;

      setUploadProgress(deleteExistingResponses ? 10 : 5);

      for (let i = 0; i < totalBatches; i++) {
        const start = i * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, parsedData.length);
        const batchData = parsedData.slice(start, end);
        try {
          const result = await surveyApi.createSurveyResponsesBulk({
            survey_id: surveyId,
            responses: batchData.map(response => ({
              survey_id: surveyId,
              is_complete: true,
              completed_at: new Date().toISOString(),
              answers: Object.entries(response)
                .filter(([externalId]) => validExternalIds.has(externalId))
                .map(([externalId, value]) => ({
                  question_id: questionIdMapping[externalId],
                  value: value.includes(';') ? value.split(';')[0].trim() : value,
                  selected_options: null,
                  file_path: null,
                  answered_at: new Date().toISOString()
                }))
            }))
          });

          const batchSuccess = Array.isArray(result.data) ? result.data.length : 0;
          successCount += batchSuccess;
          failedCount += (batchData.length - batchSuccess);
          processedCount += batchData.length;

          const progressStart = deleteExistingResponses ? 10 : 5;
          const progress = Math.floor(((i + 1) / totalBatches) * (95 - progressStart)) + progressStart;
          setUploadProgress(progress);
          setUploadStats({
            total: parsedData.length,
            processed: processedCount,
            success: successCount,
            failed: failedCount
          });
        } catch (error) {
          console.error(`Batch ${i + 1} failed:`, error);
          failedCount += batchData.length;
          processedCount += batchData.length;
        }
      }

      setUploadProgress(100);
      setUploadSuccess(true);
      
      if (failedCount > 0) {
        setUploadError(`Completed with errors: ${failedCount} responses failed to upload.`);
      }

      // Store the stats to be sent on close
      const uploadResults = { 
        totalResponses: parsedData.length,
        successCount,
        failedCount
      };

      // Don't call onComplete here - we'll call it when the user closes the dialog
      setUploadResults(uploadResults);
    } catch (error) {
      setUploadError(`Failed to upload data: ${(error as Error).message}`);
    } finally {
      setIsUploading(false);
      setIsDeletingResponses(false);
    }
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    if (!isUploading) {
      setFile(null);
      setParsedData([]);
      resetState();
      onCancel();
    }
  };

  const handleCloseAfterSuccess = () => {
    if (uploadSuccess && !isUploading && uploadResults) {
      onComplete(uploadResults); // Call onComplete when user explicitly closes
      setFile(null);
      setParsedData([]);
      resetState();
      onCancel();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isUploading}
    >
      <DialogTitle>Upload Survey Responses</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Typography variant="body1" gutterBottom>
            Upload a CSV file containing survey responses. The file should include a header row with question IDs and each row representing a respondent's answers.
          </Typography>

          <Box 
            sx={{ 
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              mb: 3,
              mt: 2,
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
          
          {file && !isUploading && !uploadSuccess && (
            <Box sx={{ mt: 2, mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={deleteExistingResponses}
                    onChange={(e) => setDeleteExistingResponses(e.target.checked)}
                    color="primary"
                    disabled={isUploading}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DeleteForever color="error" sx={{ mr: 1 }} />
                    <Typography>
                      Delete all existing responses before upload
                    </Typography>
                  </Box>
                }
              />
              {deleteExistingResponses && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Warning: This will permanently delete all existing survey responses. This action cannot be undone.
                </Alert>
              )}
            </Box>
          )}

          {uploadError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {uploadError}
            </Alert>
          )}

          {isUploading && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {isDeletingResponses ? (
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    Deleting existing responses...
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    Uploading responses: {uploadStats.processed} of {uploadStats.total}
                  </Typography>
                )}
                {!isDeletingResponses && (
                  <>
                    <Typography variant="body2" color="success.main" sx={{ mr: 1 }}>
                      Success: {uploadStats.success}
                    </Typography>
                    {uploadStats.failed > 0 && (
                      <Typography variant="body2" color="error">
                        Failed: {uploadStats.failed}
                      </Typography>
                    )}
                  </>
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
              action={
                <Button 
                  color="inherit" 
                  size="small"
                  onClick={handleCloseAfterSuccess}
                >
                  Close
                </Button>
              }
            >
              {uploadStats.failed > 0 
                ? `Upload completed with ${uploadStats.success} successful and ${uploadStats.failed} failed responses.` 
                : `All ${uploadStats.success} responses uploaded successfully!`}
            </Alert>
          )}

          {parsedData.length > 0 && !uploadSuccess && !isUploading && (
            <Typography variant="body2" gutterBottom>
              Successfully parsed {parsedData.length} responses.
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {!uploadSuccess && (
          <>
            <Button 
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={!file || isUploading || parsedData.length === 0}
              startIcon={isUploading ? <CircularProgress size={20} /> : undefined}
            >
              {isUploading ? 'Uploading...' : 'Upload Responses'}
            </Button>
          </>
        )}
        {uploadSuccess && (
          <Button
            variant="contained"
            onClick={handleCloseAfterSuccess}
          >
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SurveyResponseUploadDialog; 