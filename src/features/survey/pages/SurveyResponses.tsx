import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Paper, Box, CircularProgress, 
  Breadcrumbs, Link as MuiLink, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip,
  Accordion, AccordionSummary, AccordionDetails, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions,
  IconButton, Tooltip, Grid, Pagination, FormControl,
  InputLabel, Select, MenuItem, TextField, Stack,
  FormControlLabel, Checkbox, InputAdornment, SelectChangeEvent
} from '@mui/material';
import { 
  ArrowBack, ExpandMore, Delete as DeleteIcon, 
  Visibility as VisibilityIcon, Search as SearchIcon,
  FilterList as FilterIcon, Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchSurveyById, fetchPaginatedSurveyResponses, deleteSurveyResponse,
  selectCurrentSurvey, selectPaginatedResponses, selectSurveyByIdLoading,
  selectPaginatedResponsesLoading, selectDeleteResponseLoading,
  SurveyResponse, SurveyResponseAnswer, SurveyResponseFilterOptions
} from '@/store/slices/surveySlice';
import { format, parseISO } from 'date-fns';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;

// Format date helper
const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'Unknown';
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy HH:mm');
  } catch (e) {
    return 'Invalid date';
  }
};

const SurveyResponses: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get state from Redux
  const currentSurvey = useAppSelector(selectCurrentSurvey);
  const paginatedResponses = useAppSelector(selectPaginatedResponses);
  const surveyByIdLoading = useAppSelector(selectSurveyByIdLoading);
  const responsesLoading = useAppSelector(selectPaginatedResponsesLoading);
  const deleteResponseLoading = useAppSelector(selectDeleteResponseLoading);

  // Local state
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [responseToDelete, setResponseToDelete] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Filter state
  const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '1', 10));
  const [pageSize, setPageSize] = useState<number>(
    parseInt(searchParams.get('page_size') || String(DEFAULT_PAGE_SIZE), 10)
  );
  const [completedOnly, setCompletedOnly] = useState<boolean>(
    searchParams.get('completed_only') === 'true'
  );
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search_term') || '');
  const [startedAfter, setStartedAfter] = useState<string>(searchParams.get('started_after') || '');
  const [startedBefore, setStartedBefore] = useState<string>(searchParams.get('started_before') || '');
  const [respondentId, setRespondentId] = useState<string>(searchParams.get('respondent_id') || '');

  // Create filter options object
  const createFilterOptions = (): SurveyResponseFilterOptions => {
    const options: SurveyResponseFilterOptions = {
      page,
      page_size: pageSize,
      completed_only: completedOnly
    };
    
    if (searchTerm) options.search_term = searchTerm;
    if (startedAfter) options.started_after = startedAfter;
    if (startedBefore) options.started_before = startedBefore;
    if (respondentId) options.respondent_id = respondentId;
    
    return options;
  };

  // Update URL search params
  const updateSearchParams = (options: SurveyResponseFilterOptions) => {
    const params = new URLSearchParams();
    
    params.set('page', String(options.page || 1));
    params.set('page_size', String(options.page_size || DEFAULT_PAGE_SIZE));
    if (options.completed_only) params.set('completed_only', String(options.completed_only));
    if (options.search_term) params.set('search_term', options.search_term);
    if (options.started_after) params.set('started_after', options.started_after);
    if (options.started_before) params.set('started_before', options.started_before);
    if (options.respondent_id) params.set('respondent_id', options.respondent_id);
    
    setSearchParams(params);
  };

  // Load survey and responses
  useEffect(() => {
    if (id) {
      dispatch(fetchSurveyById({ surveyId: id }));
      
      const options = createFilterOptions();
      dispatch(fetchPaginatedSurveyResponses({ surveyId: id, options }));
      updateSearchParams(options);
    }
  }, [dispatch, id]);

  // Handle filter changes
  const handleApplyFilters = () => {
    if (id) {
      setPage(1); // Reset to first page when applying new filters
      const options = { ...createFilterOptions(), page: 1 };
      dispatch(fetchPaginatedSurveyResponses({ surveyId: id, options }));
      updateSearchParams(options);
    }
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setPage(1);
    setPageSize(DEFAULT_PAGE_SIZE);
    setCompletedOnly(false);
    setSearchTerm('');
    setStartedAfter('');
    setStartedBefore('');
    setRespondentId('');
    
    if (id) {
      const options = { page: 1, page_size: DEFAULT_PAGE_SIZE };
      dispatch(fetchPaginatedSurveyResponses({ surveyId: id, options }));
      updateSearchParams(options);
    }
    
    setFiltersOpen(false);
  };

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    
    if (id) {
      const options = { ...createFilterOptions(), page: value };
      dispatch(fetchPaginatedSurveyResponses({ surveyId: id, options }));
      updateSearchParams(options);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const newPageSize = Number(event.target.value);
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
    
    if (id) {
      const options = { ...createFilterOptions(), page: 1, page_size: newPageSize };
      dispatch(fetchPaginatedSurveyResponses({ surveyId: id, options }));
      updateSearchParams(options);
    }
  };

  const handleDeleteDialogOpen = (responseId: string) => {
    setResponseToDelete(responseId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setResponseToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (responseToDelete && id) {
      await dispatch(deleteSurveyResponse(responseToDelete));
      handleDeleteDialogClose();
      
      // Refresh the responses list
      const options = createFilterOptions();
      dispatch(fetchPaginatedSurveyResponses({ surveyId: id, options, forceRefresh: true }));
    }
  };

  const handleViewResponse = (response: SurveyResponse) => {
    setSelectedResponse(response);
  };

  const handleRefresh = () => {
    if (id) {
      const options = createFilterOptions();
      dispatch(fetchPaginatedSurveyResponses({ surveyId: id, options, forceRefresh: true }));
    }
  };

  const isLoading = surveyByIdLoading || responsesLoading;

  if (isLoading && !paginatedResponses) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!currentSurvey) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6">Survey not found</Typography>
      </Container>
    );
  }

  // Helper function to get question title by ID
  const getQuestionTitle = (questionId: string) => {
    // Check in the sections first
    if (currentSurvey.sections) {
      for (const section of currentSurvey.sections) {
        if (section.questions) {
          const question = section.questions.find(q => q.id === questionId);
          if (question) return question.title;
        }
      }
    }
    
    // Then check in direct questions
    if (currentSurvey.questions) {
      const question = currentSurvey.questions.find(q => q.id === questionId);
      if (question) return question.title;
    }
    
    return 'Unknown Question';
  };

  const responses = paginatedResponses?.items || [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <MuiLink component={Link} to={PATHS.PUBLIC.SURVEYS.path} underline="hover" color="inherit">
            Surveys
          </MuiLink>
          <MuiLink 
            component={Link} 
            to={PATHS.PUBLIC.SURVEY_DETAIL.path.replace(':id', id!)} 
            underline="hover" 
            color="inherit"
          >
            {currentSurvey.title}
          </MuiLink>
          <Typography color="text.primary">Responses</Typography>
        </Breadcrumbs>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button 
            component={Link} 
            to={PATHS.PUBLIC.SURVEY_DETAIL.path.replace(':id', id!)}
            startIcon={<ArrowBack />} 
            sx={{ mr: 2 }}
          >
            Back to Survey
          </Button>
          <Typography variant="h4" component="h1">
            Survey Responses
          </Typography>
        </Box>
        
        <Box>
          <Tooltip title="Refresh Responses">
            <IconButton onClick={handleRefresh} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button 
            variant={filtersOpen ? "contained" : "outlined"}
            startIcon={filtersOpen ? <CloseIcon /> : <FilterIcon />}
            onClick={() => setFiltersOpen(!filtersOpen)}
            sx={{ ml: 1 }}
          >
            {filtersOpen ? "Hide Filters" : "Filters"}
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {currentSurvey.title}
        </Typography>
        {currentSurvey.description && (
          <Typography variant="body1" paragraph>
            {currentSurvey.description}
          </Typography>
        )}
      </Paper>

      {/* Filters Panel */}
      {filtersOpen && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filter Responses
          </Typography>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                label="Search Responses"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="Search in responses..."
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Respondent ID"
                fullWidth
                value={respondentId}
                onChange={(e) => setRespondentId(e.target.value)}
                placeholder="Filter by respondent ID..."
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Started After"
                type="datetime-local"
                fullWidth
                value={startedAfter}
                onChange={(e) => setStartedAfter(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Started Before"
                type="datetime-local"
                fullWidth
                value={startedBefore}
                onChange={(e) => setStartedBefore(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={completedOnly}
                    onChange={(e) => setCompletedOnly(e.target.checked)}
                  />
                }
                label="Show only completed responses"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button 
                  variant="outlined" 
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleApplyFilters}
                  disabled={isLoading}
                >
                  Apply Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {isLoading && (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      )}

      {responses.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No responses match the current filters.
          </Typography>
        </Paper>
      ) : (
        <>
          <Paper sx={{ mb: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Response ID</TableCell>
                    <TableCell>Started At</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Respondent</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell>{response.id}</TableCell>
                      <TableCell>
                        {formatDate(response.started_at || response.created_at)}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={response.is_complete ? "Complete" : "Incomplete"} 
                          color={response.is_complete ? "success" : "warning"} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {response.respondent_id || 'Anonymous'}
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center">
                          <Tooltip title="View Response">
                            <IconButton 
                              color="primary"
                              onClick={() => handleViewResponse(response)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Response">
                            <IconButton 
                              color="error" 
                              onClick={() => handleDeleteDialogOpen(response.id!)}
                              disabled={deleteResponseLoading}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination Controls */}
            <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">
                <Typography variant="body2" mr={2}>
                  Rows per page:
                </Typography>
                <FormControl variant="outlined" size="small">
                  <Select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    disabled={isLoading}
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="body2" ml={2}>
                  {paginatedResponses && (
                    `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, paginatedResponses.total)} of ${paginatedResponses.total}`
                  )}
                </Typography>
              </Box>
              
              <Pagination
                count={paginatedResponses?.pages || 1}
                page={page}
                onChange={handlePageChange}
                disabled={isLoading}
                color="primary"
              />
            </Box>
          </Paper>
        </>
      )}

      {/* Response Details Dialog */}
      <Dialog
        open={!!selectedResponse}
        onClose={() => setSelectedResponse(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Response Details
          <Typography variant="subtitle2" color="textSecondary">
            ID: {selectedResponse?.id}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box mb={2}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Started At</Typography>
                <Typography variant="body1">
                  {formatDate(selectedResponse?.started_at || selectedResponse?.created_at)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                <Chip 
                  label={selectedResponse?.is_complete ? "Complete" : "Incomplete"} 
                  color={selectedResponse?.is_complete ? "success" : "warning"} 
                  size="small"
                />
              </Grid>
              {selectedResponse?.completed_at && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Completed At</Typography>
                  <Typography variant="body1">
                    {format(parseISO(selectedResponse.completed_at), 'MMM d, yyyy HH:mm')}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Respondent</Typography>
                <Typography variant="body1">
                  {selectedResponse?.respondent_id || 'Anonymous'}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="h6" gutterBottom mt={2}>
            Answers
          </Typography>
          
          {selectedResponse?.answers && selectedResponse.answers.length > 0 ? (
            selectedResponse.answers.map((answer: SurveyResponseAnswer) => (
              <Accordion key={answer.question_id} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>
                    {getQuestionTitle(answer.question_id)}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {answer.value && (
                    <Typography variant="body1">
                      {answer.value}
                    </Typography>
                  )}
                  
                  {answer.selected_options && (
                    <Box mt={1}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Selected Options:
                      </Typography>
                      <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
                        {JSON.stringify(answer.selected_options, null, 2)}
                      </pre>
                    </Box>
                  )}
                  
                  {answer.items && answer.items.length > 0 && (
                    <Box mt={1}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Items:
                      </Typography>
                      <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Index</TableCell>
                              <TableCell>Value</TableCell>
                              <TableCell>Row</TableCell>
                              <TableCell>Column</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {answer.items.map(item => (
                              <TableRow key={`${answer.question_id}-${item.item_index}`}>
                                <TableCell>{item.item_index}</TableCell>
                                <TableCell>{item.value || '—'}</TableCell>
                                <TableCell>{item.row_identifier || '—'}</TableCell>
                                <TableCell>{item.column_identifier || '—'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                  
                  {!answer.value && !answer.selected_options && 
                   (!answer.items || answer.items.length === 0) && (
                    <Typography variant="body2" color="textSecondary">
                      No answer provided
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No answers available for this response
            </Typography>
          )}
          
          {selectedResponse?.response_metadata && (
            <Box mt={3}>
              <Typography variant="subtitle2" color="textSecondary">
                Response Metadata
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mt: 1, background: '#f5f5f5' }}>
                <pre style={{ margin: 0, overflow: 'auto' }}>
                  {JSON.stringify(selectedResponse.response_metadata, null, 2)}
                </pre>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedResponse(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this response? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus disabled={deleteResponseLoading}>
            {deleteResponseLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SurveyResponses; 