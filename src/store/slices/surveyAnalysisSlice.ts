import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';
import { surveyAnalysisApi } from '@/services/api/endpoints/surveyAnalysis';

// Define types for the slice state
export interface ChartType {
  id: number;
  name: string;
}

export interface SurveyAnalysis {
  id?: string;
  survey_id: string;
  title: string;
  description?: string | null;
  date_created?: string;
  date_updated?: string;
  analysis_questions?: SurveyAnalysisQuestion[];
}

export interface SurveyAnalysisQuestion {
  id?: string;
  question_id: string;
  chart_type_id: number;
  sort_by_value: boolean;
  chart_type?: ChartType;
  question?: any; // Using any for simplicity, but should match QuestionGet from surveySlice
  topics?: SurveyQuestionTopic[];
  report_segments?: SurveyReportSegment[];
}

export interface SurveyQuestionTopic {
  id?: string;
  name: string;
}

export interface SurveyReportSegment {
  id?: string;
  name: string;
}

export interface SurveyAnalysisState {
  analyses: SurveyAnalysis[];
  currentAnalysis: SurveyAnalysis | null;
  chartTypes: ChartType[];
  topics: SurveyQuestionTopic[];
  segments: SurveyReportSegment[];
  loading: boolean;
  loadingStates: {
    analyses: boolean;
    analysis: boolean;
    chartTypes: boolean;
    topics: boolean;
    segments: boolean;
    createAnalysis: boolean;
    updateAnalysis: boolean;
    deleteAnalysis: boolean;
    createQuestion: boolean;
    updateQuestion: boolean;
    deleteQuestion: boolean;
    createTopic: boolean;
    updateTopic: boolean;
    deleteTopic: boolean;
    createSegment: boolean;
    updateSegment: boolean;
    deleteSegment: boolean;
  };
  error: string | null;
}

const initialState: SurveyAnalysisState = {
  analyses: [],
  currentAnalysis: null,
  chartTypes: [],
  topics: [],
  segments: [],
  loading: false,
  loadingStates: {
    analyses: false,
    analysis: false,
    chartTypes: false,
    topics: false,
    segments: false,
    createAnalysis: false,
    updateAnalysis: false,
    deleteAnalysis: false,
    createQuestion: false,
    updateQuestion: false,
    deleteQuestion: false,
    createTopic: false,
    updateTopic: false,
    deleteTopic: false,
    createSegment: false,
    updateSegment: false,
    deleteSegment: false,
  },
  error: null,
};

// Generic error handler function for thunks
const handleApiError = (error: any, errorMessage: string) => {
  console.error(errorMessage, error);
  return errorMessage;
};

// Async thunks for chart types
export const fetchChartTypes = createAsyncThunk(
  'surveyAnalysis/fetchChartTypes',
  async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}, { rejectWithValue }) => {
    try {
      return await surveyAnalysisApi.getChartTypes(forceRefresh);
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch chart types'));
    }
  }
);

// Async thunks for survey analyses
export const fetchSurveyAnalyses = createAsyncThunk(
  'surveyAnalysis/fetchSurveyAnalyses',
  async ({ surveyId, forceRefresh = false }: { surveyId: string, forceRefresh?: boolean }, 
  { rejectWithValue }) => {
    try {
      return await surveyAnalysisApi.getSurveyAnalyses(surveyId, forceRefresh);
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch survey analyses'));
    }
  }
);

export const fetchSurveyAnalysisById = createAsyncThunk(
  'surveyAnalysis/fetchSurveyAnalysisById',
  async ({ analysisId, forceRefresh = false }: { analysisId: string, forceRefresh?: boolean }, 
  { rejectWithValue }) => {
    try {
      return await surveyAnalysisApi.getSurveyAnalysisById(analysisId, forceRefresh);
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch survey analysis'));
    }
  }
);

export const createSurveyAnalysis = createAsyncThunk(
  'surveyAnalysis/createSurveyAnalysis',
  async (analysisData: { survey_id: string, title: string, description?: string | null }, 
  { rejectWithValue }) => {
    try {
      const response = await surveyAnalysisApi.createSurveyAnalysis(analysisData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to create survey analysis'));
    }
  }
);

export const updateSurveyAnalysis = createAsyncThunk(
  'surveyAnalysis/updateSurveyAnalysis',
  async ({ analysisId, analysisData }: 
  { analysisId: string, analysisData: { title?: string | null, description?: string | null } }, 
  { rejectWithValue }) => {
    try {
      const response = await surveyAnalysisApi.updateSurveyAnalysis(analysisId, analysisData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to update survey analysis'));
    }
  }
);

export const deleteSurveyAnalysis = createAsyncThunk(
  'surveyAnalysis/deleteSurveyAnalysis',
  async (analysisId: string, { rejectWithValue }) => {
    try {
      await surveyAnalysisApi.deleteSurveyAnalysis(analysisId);
      return analysisId;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to delete survey analysis'));
    }
  }
);

// Async thunks for survey analysis questions
export const fetchSurveyAnalysisQuestions = createAsyncThunk(
  'surveyAnalysis/fetchSurveyAnalysisQuestions',
  async ({ analysisId, forceRefresh = false }: { analysisId: string, forceRefresh?: boolean }, 
  { rejectWithValue }) => {
    try {
      return await surveyAnalysisApi.getSurveyAnalysisQuestions(analysisId, forceRefresh);
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch survey analysis questions'));
    }
  }
);

export const createSurveyAnalysisQuestion = createAsyncThunk(
  'surveyAnalysis/createSurveyAnalysisQuestion',
  async (questionData: {
    survey_analysis_id: string,
    question_id: string,
    chart_type_id: number,
    sort_by_value?: boolean,
    topic_ids?: string[] | null,
    report_segment_ids?: string[] | null
  }, { rejectWithValue }) => {
    try {
      const response = await surveyAnalysisApi.createSurveyAnalysisQuestion(questionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to create analysis question'));
    }
  }
);

export const updateSurveyAnalysisQuestion = createAsyncThunk(
  'surveyAnalysis/updateSurveyAnalysisQuestion',
  async ({ questionId, questionData }: {
    questionId: string,
    questionData: {
      chart_type_id?: number | null,
      sort_by_value?: boolean | null,
      topic_ids?: string[] | null,
      report_segment_ids?: string[] | null
    }
  }, { rejectWithValue }) => {
    try {
      const response = await surveyAnalysisApi.updateSurveyAnalysisQuestion(questionId, questionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to update analysis question'));
    }
  }
);

export const deleteSurveyAnalysisQuestion = createAsyncThunk(
  'surveyAnalysis/deleteSurveyAnalysisQuestion',
  async (questionId: string, { rejectWithValue }) => {
    try {
      await surveyAnalysisApi.deleteSurveyAnalysisQuestion(questionId);
      return questionId;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to delete analysis question'));
    }
  }
);

// Async thunks for topics
export const fetchSurveyQuestionTopics = createAsyncThunk(
  'surveyAnalysis/fetchSurveyQuestionTopics',
  async ({ surveyId, forceRefresh = false }: { surveyId: string, forceRefresh?: boolean }, 
  { rejectWithValue }) => {
    try {
      return await surveyAnalysisApi.getSurveyQuestionTopics(surveyId, forceRefresh);
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch survey question topics'));
    }
  }
);

export const createSurveyQuestionTopic = createAsyncThunk(
  'surveyAnalysis/createSurveyQuestionTopic',
  async (topicData: { survey_id: string, name: string }, { rejectWithValue }) => {
    try {
      const response = await surveyAnalysisApi.createSurveyQuestionTopic(topicData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to create survey question topic'));
    }
  }
);

export const updateSurveyQuestionTopic = createAsyncThunk(
  'surveyAnalysis/updateSurveyQuestionTopic',
  async ({ topicId, name }: { topicId: string, name: string }, { rejectWithValue }) => {
    try {
      const response = await surveyAnalysisApi.updateSurveyQuestionTopic(topicId, { name });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to update survey question topic'));
    }
  }
);

export const deleteSurveyQuestionTopic = createAsyncThunk(
  'surveyAnalysis/deleteSurveyQuestionTopic',
  async (topicId: string, { rejectWithValue }) => {
    try {
      await surveyAnalysisApi.deleteSurveyQuestionTopic(topicId);
      return topicId;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to delete survey question topic'));
    }
  }
);

// Async thunks for report segments
export const fetchSurveyReportSegments = createAsyncThunk(
  'surveyAnalysis/fetchSurveyReportSegments',
  async ({ surveyId, forceRefresh = false }: { surveyId: string, forceRefresh?: boolean }, 
  { rejectWithValue }) => {
    try {
      return await surveyAnalysisApi.getSurveyReportSegments(surveyId, forceRefresh);
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch survey report segments'));
    }
  }
);

export const createSurveyReportSegment = createAsyncThunk(
  'surveyAnalysis/createSurveyReportSegment',
  async (segmentData: { survey_id: string, name: string }, { rejectWithValue }) => {
    try {
      const response = await surveyAnalysisApi.createSurveyReportSegment(segmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to create survey report segment'));
    }
  }
);

export const updateSurveyReportSegment = createAsyncThunk(
  'surveyAnalysis/updateSurveyReportSegment',
  async ({ segmentId, name }: { segmentId: string, name: string }, { rejectWithValue }) => {
    try {
      const response = await surveyAnalysisApi.updateSurveyReportSegment(segmentId, { name });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to update survey report segment'));
    }
  }
);

export const deleteSurveyReportSegment = createAsyncThunk(
  'surveyAnalysis/deleteSurveyReportSegment',
  async (segmentId: string, { rejectWithValue }) => {
    try {
      await surveyAnalysisApi.deleteSurveyReportSegment(segmentId);
      return segmentId;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to delete survey report segment'));
    }
  }
);

// Create the survey analysis slice
export const surveyAnalysisSlice = createSlice({
  name: 'surveyAnalysis',
  initialState,
  reducers: {
    clearAnalysisData: (state) => {
      state.currentAnalysis = null;
      state.error = null;
    },
    clearAnalysisError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Chart Types
      .addCase(fetchChartTypes.pending, (state) => {
        state.loadingStates.chartTypes = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChartTypes.fulfilled, (state, action) => {
        state.chartTypes = action.payload;
        state.loadingStates.chartTypes = false;
        state.loading = false;
      })
      .addCase(fetchChartTypes.rejected, (state, action) => {
        state.loadingStates.chartTypes = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Survey Analyses
      .addCase(fetchSurveyAnalyses.pending, (state) => {
        state.loadingStates.analyses = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSurveyAnalyses.fulfilled, (state, action) => {
        state.analyses = action.payload;
        state.loadingStates.analyses = false;
        state.loading = false;
      })
      .addCase(fetchSurveyAnalyses.rejected, (state, action) => {
        state.loadingStates.analyses = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Survey Analysis by ID
      .addCase(fetchSurveyAnalysisById.pending, (state) => {
        state.loadingStates.analysis = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSurveyAnalysisById.fulfilled, (state, action) => {
        state.currentAnalysis = action.payload;
        state.loadingStates.analysis = false;
        state.loading = false;
      })
      .addCase(fetchSurveyAnalysisById.rejected, (state, action) => {
        state.loadingStates.analysis = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Survey Analysis
      .addCase(createSurveyAnalysis.pending, (state) => {
        state.loadingStates.createAnalysis = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(createSurveyAnalysis.fulfilled, (state, action) => {
        state.analyses.push(action.payload);
        state.currentAnalysis = action.payload;
        state.loadingStates.createAnalysis = false;
        state.loading = false;
      })
      .addCase(createSurveyAnalysis.rejected, (state, action) => {
        state.loadingStates.createAnalysis = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Survey Analysis
      .addCase(updateSurveyAnalysis.pending, (state) => {
        state.loadingStates.updateAnalysis = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSurveyAnalysis.fulfilled, (state, action) => {
        state.analyses = state.analyses.map(analysis => 
          analysis.id === action.payload.id ? action.payload : analysis
        );
        state.currentAnalysis = action.payload;
        state.loadingStates.updateAnalysis = false;
        state.loading = false;
      })
      .addCase(updateSurveyAnalysis.rejected, (state, action) => {
        state.loadingStates.updateAnalysis = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Survey Analysis
      .addCase(deleteSurveyAnalysis.pending, (state) => {
        state.loadingStates.deleteAnalysis = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSurveyAnalysis.fulfilled, (state, action) => {
        state.analyses = state.analyses.filter(analysis => analysis.id !== action.payload);
        if (state.currentAnalysis && state.currentAnalysis.id === action.payload) {
          state.currentAnalysis = null;
        }
        state.loadingStates.deleteAnalysis = false;
        state.loading = false;
      })
      .addCase(deleteSurveyAnalysis.rejected, (state, action) => {
        state.loadingStates.deleteAnalysis = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Survey Analysis Questions
      .addCase(fetchSurveyAnalysisQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSurveyAnalysisQuestions.fulfilled, (state, action) => {
        if (state.currentAnalysis) {
          state.currentAnalysis.analysis_questions = action.payload;
        }
        state.loading = false;
      })
      .addCase(fetchSurveyAnalysisQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Survey Analysis Question
      .addCase(createSurveyAnalysisQuestion.pending, (state) => {
        state.loadingStates.createQuestion = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(createSurveyAnalysisQuestion.fulfilled, (state, action) => {
        if (state.currentAnalysis && state.currentAnalysis.analysis_questions) {
          state.currentAnalysis.analysis_questions.push(action.payload);
        }
        state.loadingStates.createQuestion = false;
        state.loading = false;
      })
      .addCase(createSurveyAnalysisQuestion.rejected, (state, action) => {
        state.loadingStates.createQuestion = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Survey Analysis Question
      .addCase(updateSurveyAnalysisQuestion.pending, (state) => {
        state.loadingStates.updateQuestion = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSurveyAnalysisQuestion.fulfilled, (state, action) => {
        if (state.currentAnalysis && state.currentAnalysis.analysis_questions) {
          state.currentAnalysis.analysis_questions = state.currentAnalysis.analysis_questions.map(
            question => question.id === action.payload.id ? action.payload : question
          );
        }
        state.loadingStates.updateQuestion = false;
        state.loading = false;
      })
      .addCase(updateSurveyAnalysisQuestion.rejected, (state, action) => {
        state.loadingStates.updateQuestion = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Survey Analysis Question
      .addCase(deleteSurveyAnalysisQuestion.pending, (state) => {
        state.loadingStates.deleteQuestion = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSurveyAnalysisQuestion.fulfilled, (state, action) => {
        if (state.currentAnalysis && state.currentAnalysis.analysis_questions) {
          state.currentAnalysis.analysis_questions = state.currentAnalysis.analysis_questions.filter(
            question => question.id !== action.payload
          );
        }
        state.loadingStates.deleteQuestion = false;
        state.loading = false;
      })
      .addCase(deleteSurveyAnalysisQuestion.rejected, (state, action) => {
        state.loadingStates.deleteQuestion = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Topics
      .addCase(fetchSurveyQuestionTopics.pending, (state) => {
        state.loadingStates.topics = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSurveyQuestionTopics.fulfilled, (state, action) => {
        state.topics = action.payload;
        state.loadingStates.topics = false;
        state.loading = false;
      })
      .addCase(fetchSurveyQuestionTopics.rejected, (state, action) => {
        state.loadingStates.topics = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Topic
      .addCase(createSurveyQuestionTopic.pending, (state) => {
        state.loadingStates.createTopic = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(createSurveyQuestionTopic.fulfilled, (state, action) => {
        state.topics.push(action.payload);
        state.loadingStates.createTopic = false;
        state.loading = false;
      })
      .addCase(createSurveyQuestionTopic.rejected, (state, action) => {
        state.loadingStates.createTopic = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Topic
      .addCase(updateSurveyQuestionTopic.pending, (state) => {
        state.loadingStates.updateTopic = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSurveyQuestionTopic.fulfilled, (state, action) => {
        state.topics = state.topics.map(topic => 
          topic.id === action.payload.id ? action.payload : topic
        );
        state.loadingStates.updateTopic = false;
        state.loading = false;
      })
      .addCase(updateSurveyQuestionTopic.rejected, (state, action) => {
        state.loadingStates.updateTopic = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Topic
      .addCase(deleteSurveyQuestionTopic.pending, (state) => {
        state.loadingStates.deleteTopic = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSurveyQuestionTopic.fulfilled, (state, action) => {
        state.topics = state.topics.filter(topic => topic.id !== action.payload);
        state.loadingStates.deleteTopic = false;
        state.loading = false;
      })
      .addCase(deleteSurveyQuestionTopic.rejected, (state, action) => {
        state.loadingStates.deleteTopic = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Segments
      .addCase(fetchSurveyReportSegments.pending, (state) => {
        state.loadingStates.segments = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSurveyReportSegments.fulfilled, (state, action) => {
        state.segments = action.payload;
        state.loadingStates.segments = false;
        state.loading = false;
      })
      .addCase(fetchSurveyReportSegments.rejected, (state, action) => {
        state.loadingStates.segments = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Segment
      .addCase(createSurveyReportSegment.pending, (state) => {
        state.loadingStates.createSegment = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(createSurveyReportSegment.fulfilled, (state, action) => {
        state.segments.push(action.payload);
        state.loadingStates.createSegment = false;
        state.loading = false;
      })
      .addCase(createSurveyReportSegment.rejected, (state, action) => {
        state.loadingStates.createSegment = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Segment
      .addCase(updateSurveyReportSegment.pending, (state) => {
        state.loadingStates.updateSegment = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSurveyReportSegment.fulfilled, (state, action) => {
        state.segments = state.segments.map(segment => 
          segment.id === action.payload.id ? action.payload : segment
        );
        state.loadingStates.updateSegment = false;
        state.loading = false;
      })
      .addCase(updateSurveyReportSegment.rejected, (state, action) => {
        state.loadingStates.updateSegment = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Segment
      .addCase(deleteSurveyReportSegment.pending, (state) => {
        state.loadingStates.deleteSegment = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSurveyReportSegment.fulfilled, (state, action) => {
        state.segments = state.segments.filter(segment => segment.id !== action.payload);
        state.loadingStates.deleteSegment = false;
        state.loading = false;
      })
      .addCase(deleteSurveyReportSegment.rejected, (state, action) => {
        state.loadingStates.deleteSegment = false;
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearAnalysisData, clearAnalysisError } = surveyAnalysisSlice.actions;

// Export selectors
export const selectAnalyses = (state: RootState) => state.surveyAnalysis.analyses;
export const selectCurrentAnalysis = (state: RootState) => state.surveyAnalysis.currentAnalysis;
export const selectChartTypes = (state: RootState) => state.surveyAnalysis.chartTypes;
export const selectTopics = (state: RootState) => state.surveyAnalysis.topics;
export const selectSegments = (state: RootState) => state.surveyAnalysis.segments;
export const selectAnalysisLoading = (state: RootState) => state.surveyAnalysis.loading;
export const selectAnalysisError = (state: RootState) => state.surveyAnalysis.error;

// Loading state selectors
export const selectAnalysesLoading = (state: RootState) => state.surveyAnalysis.loadingStates.analyses;
export const selectAnalysisByIdLoading = (state: RootState) => state.surveyAnalysis.loadingStates.analysis;
export const selectChartTypesLoading = (state: RootState) => state.surveyAnalysis.loadingStates.chartTypes;
export const selectTopicsLoading = (state: RootState) => state.surveyAnalysis.loadingStates.topics;
export const selectSegmentsLoading = (state: RootState) => state.surveyAnalysis.loadingStates.segments;
export const selectCreateAnalysisLoading = (state: RootState) => state.surveyAnalysis.loadingStates.createAnalysis;
export const selectUpdateAnalysisLoading = (state: RootState) => state.surveyAnalysis.loadingStates.updateAnalysis;
export const selectDeleteAnalysisLoading = (state: RootState) => state.surveyAnalysis.loadingStates.deleteAnalysis;
export const selectCreateQuestionLoading = (state: RootState) => state.surveyAnalysis.loadingStates.createQuestion;
export const selectUpdateQuestionLoading = (state: RootState) => state.surveyAnalysis.loadingStates.updateQuestion;
export const selectDeleteQuestionLoading = (state: RootState) => state.surveyAnalysis.loadingStates.deleteQuestion;
export const selectCreateTopicLoading = (state: RootState) => state.surveyAnalysis.loadingStates.createTopic;
export const selectUpdateTopicLoading = (state: RootState) => state.surveyAnalysis.loadingStates.updateTopic;
export const selectDeleteTopicLoading = (state: RootState) => state.surveyAnalysis.loadingStates.deleteTopic;
export const selectCreateSegmentLoading = (state: RootState) => state.surveyAnalysis.loadingStates.createSegment;
export const selectUpdateSegmentLoading = (state: RootState) => state.surveyAnalysis.loadingStates.updateSegment;
export const selectDeleteSegmentLoading = (state: RootState) => state.surveyAnalysis.loadingStates.deleteSegment;

// Export reducer
export default surveyAnalysisSlice.reducer; 