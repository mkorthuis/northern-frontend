import React, { useState, useRef } from 'react';
import { 
  Box, Typography, Button, Paper, Alert, 
  CircularProgress, Dialog, DialogTitle, DialogContent, 
  DialogActions, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow
} from '@mui/material';
import { CloudUpload, CheckCircle } from '@mui/icons-material';
import Papa from 'papaparse';

interface SurveyResponseUploadProps {
  surveyId: string;
  onUploadComplete: (data: any) => void;
  onCancel: () => void;
}

interface ParsedResponse {
  [key: string]: string;
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setUploadError(null);

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
    setUploadError(null);

    try {
      // Here you would typically send the data to your API
      // For example: await api.uploadSurveyResponses(surveyId, parsedData);
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setUploadSuccess(true);
      onUploadComplete(parsedData);
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

  return (
    <Paper sx={{ p: 3, mb: 3, maxWidth: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Upload Survey Responses
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Upload a CSV file containing survey responses. The file should include a header row with question IDs and each row representing a participant's responses.
        </Typography>
      </Box>

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

      {uploadSuccess && (
        <Alert 
          icon={<CheckCircle fontSize="inherit" />} 
          severity="success" 
          sx={{ mb: 3 }}
        >
          Survey responses uploaded successfully!
        </Alert>
      )}

      {parsedData.length > 0 && !uploadSuccess && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Successfully parsed {parsedData.length} responses.
          </Typography>
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
                    <TableCell key={header}>{header}</TableCell>
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
          disabled={!file || isUploading || parsedData.length === 0 || uploadSuccess}
          startIcon={isUploading ? <CircularProgress size={20} /> : undefined}
        >
          {isUploading ? 'Uploading...' : 'Upload Responses'}
        </Button>
      </Box>
    </Paper>
  );
};

export default SurveyResponseUpload; 