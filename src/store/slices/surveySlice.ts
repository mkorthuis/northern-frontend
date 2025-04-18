import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';
import { surveyApi } from '@/services/api/endpoints/surveys';

// Define loading state enum
export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed'
}

// Define types for the slice state
export interface SurveyOption {
  text: string;
  order_index: number;
  is_other_option?: boolean;
  score?: number | null;
  row_label?: string | null;
  column_label?: string | null;
}

export interface SurveyType {
  id?: number;
  name?: string;
  description?: string;
}

export interface SurveyQuestion {
  id?: string;
  external_question_id?: string | null;
  title: string;
  description?: string | null;
  is_required?: boolean;
  order_index: number;
  type: SurveyType;
  type_id: number;
  section_id?: string | null;
  validation_rules?: object | null;
  display_logic?: object | null;
  allow_multiple?: boolean;
  max_answers?: number | null;
  options?: SurveyOption[];
}

export interface SurveySection {
  id?: string;
  title: string;
  description?: string | null;
  order_index: number;
  questions?: SurveyQuestion[];
}

export interface Survey {
  id?: string;
  title: string;
  description?: string | null;
  survey_start?: string | null;
  survey_end?: string | null;
  is_active?: boolean;
  date_created?: string;
  date_updated?: string;
  sections?: SurveySection[];
  questions?: SurveyQuestion[];
}

export interface SurveyResponseItem {
  item_index: number;
  value?: string | null;
  option_id?: string | null;
  row_identifier?: string | null;
  column_identifier?: string | null;
}

export interface SurveyResponseAnswer {
  question_id: string;
  value?: string | null;
  selected_options?: object | null;
  file_path?: string | null;
  items?: SurveyResponseItem[];
}

export interface SurveyResponse {
  id?: string;
  survey_id: string;
  respondent_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  response_metadata?: object | null;
  date_created?: string;
  date_updated?: string;
  completed_at?: string | null;
  is_complete?: boolean;
  answers?: SurveyResponseAnswer[];
  started_at?: string;
}

// Define types for the paginated response
export interface PaginatedSurveyResponses {
  items: SurveyResponse[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
  has_previous: boolean;
  has_next: boolean;
}

export interface SurveyResponseFilterOptions {
  page?: number;
  page_size?: number;
  completed_only?: boolean;
  started_after?: string | null;
  started_before?: string | null;
  respondent_id?: string | null;
  search_term?: string | null;
}

export interface SurveyState {
  surveys: Survey[];
  currentSurvey: Survey | null;
  surveyResponses: SurveyResponse[];
  paginatedResponses: PaginatedSurveyResponses | null;
  currentResponse: SurveyResponse | null;
  loading: boolean;
  loadingStates: {
    surveys: LoadingState;
    survey: LoadingState;
    responses: LoadingState;
    paginatedResponses: LoadingState;
    response: LoadingState;
    createSurvey: LoadingState;
    updateSurvey: LoadingState;
    deleteSurvey: LoadingState;
    createResponse: LoadingState;
    updateResponse: LoadingState;
    deleteResponse: LoadingState;
    addQuestion: LoadingState;
    updateQuestion: LoadingState;
    deleteQuestion: LoadingState;
  };
  error: string | null;
}

const initialState: SurveyState = {
  surveys: [],
  currentSurvey: null,
  surveyResponses: [],
  paginatedResponses: null,
  currentResponse: null,
  loading: false,
  loadingStates: {
    surveys: LoadingState.IDLE,
    survey: LoadingState.IDLE,
    responses: LoadingState.IDLE,
    paginatedResponses: LoadingState.IDLE,
    response: LoadingState.IDLE,
    createSurvey: LoadingState.IDLE,
    updateSurvey: LoadingState.IDLE,
    deleteSurvey: LoadingState.IDLE,
    createResponse: LoadingState.IDLE,
    updateResponse: LoadingState.IDLE,
    deleteResponse: LoadingState.IDLE,
    addQuestion: LoadingState.IDLE,
    updateQuestion: LoadingState.IDLE,
    deleteQuestion: LoadingState.IDLE,
  },
  error: null,
};

// Generic error handler function for thunks
const handleApiError = (error: any, errorMessage: string) => {
  console.error(errorMessage, error);
  return errorMessage;
};

// Async thunks for fetching survey data
export const fetchSurveys = createAsyncThunk(
  'survey/fetchSurveys',
  async ({ activeOnly = false, forceRefresh = false }: { activeOnly?: boolean, forceRefresh?: boolean } = {}, 
  { rejectWithValue }) => {
    try {
      return await surveyApi.getSurveys(activeOnly, forceRefresh);
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch surveys'));
    }
  }
);

export const fetchSurveyById = createAsyncThunk(
  'survey/fetchSurveyById',
  async ({ surveyId, forceRefresh = false }: { surveyId: string, forceRefresh?: boolean }, 
  { rejectWithValue }) => {
    try {
      return await surveyApi.getSurveyById(surveyId, forceRefresh);
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch survey'));
    }
  }
);

export const createSurvey = createAsyncThunk(
  'survey/createSurvey',
  async (surveyData: Survey, { rejectWithValue }) => {
    try {
      const response = await surveyApi.createSurvey(surveyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to create survey'));
    }
  }
);

export const updateSurvey = createAsyncThunk(
  'survey/updateSurvey',
  async ({ surveyId, surveyData }: { surveyId: string, surveyData: Partial<Survey> }, 
  { rejectWithValue }) => {
    try {
      const response = await surveyApi.updateSurvey(surveyId, surveyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to update survey'));
    }
  }
);

export const deleteSurvey = createAsyncThunk(
  'survey/deleteSurvey',
  async (surveyId: string, { rejectWithValue }) => {
    try {
      await surveyApi.deleteSurvey(surveyId);
      return surveyId;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to delete survey'));
    }
  }
);

export const fetchSurveyResponses = createAsyncThunk(
  'survey/fetchSurveyResponses',
  async ({ surveyId, completedOnly = false, forceRefresh = false }: 
  { surveyId: string, completedOnly?: boolean, forceRefresh?: boolean }, 
  { rejectWithValue }) => {
    try {
      return await surveyApi.getSurveyResponses(surveyId, completedOnly, forceRefresh);
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch survey responses'));
    }
  }
);

export const fetchSurveyResponse = createAsyncThunk(
  'survey/fetchSurveyResponse',
  async ({ responseId, forceRefresh = false }: { responseId: string, forceRefresh?: boolean }, 
  { rejectWithValue }) => {
    try {
      return await surveyApi.getSurveyResponse(responseId, forceRefresh);
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch survey response'));
    }
  }
);

export const createSurveyResponse = createAsyncThunk(
  'survey/createSurveyResponse',
  async (responseData: SurveyResponse, { rejectWithValue }) => {
    try {
      const response = await surveyApi.createSurveyResponse(responseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to create survey response'));
    }
  }
);

export const updateSurveyResponse = createAsyncThunk(
  'survey/updateSurveyResponse',
  async ({ responseId, responseData }: { responseId: string, responseData: Partial<SurveyResponse> }, 
  { rejectWithValue }) => {
    try {
      const response = await surveyApi.updateSurveyResponse(responseId, responseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to update survey response'));
    }
  }
);

export const deleteSurveyResponse = createAsyncThunk(
  'survey/deleteSurveyResponse',
  async (responseId: string, { rejectWithValue }) => {
    try {
      await surveyApi.deleteSurveyResponse(responseId);
      return responseId;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to delete survey response'));
    }
  }
);

export const deleteAllSurveyResponses = createAsyncThunk(
  'survey/deleteAllSurveyResponses',
  async (surveyId: string, { rejectWithValue }) => {
    try {
      const response = await surveyApi.deleteAllSurveyResponses(surveyId);
      return { surveyId, deletedCount: response.data };
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to delete all survey responses'));
    }
  }
);

// Question management thunks
export const addQuestion = createAsyncThunk(
  'survey/addQuestion',
  async ({ surveyId, questionData }: { surveyId: string, questionData: SurveyQuestion }, 
  { rejectWithValue }) => {
    try {
      const response = await surveyApi.addQuestion(surveyId, questionData);
      return { surveyId, question: response.data };
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to add question'));
    }
  }
);

export const updateQuestion = createAsyncThunk(
  'survey/updateQuestion',
  async ({ questionId, questionData }: { questionId: string, questionData: Partial<SurveyQuestion> }, 
  { rejectWithValue }) => {
    try {
      const response = await surveyApi.updateQuestion(questionId, questionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to update question'));
    }
  }
);

export const deleteQuestion = createAsyncThunk(
  'survey/deleteQuestion',
  async ({ surveyId, questionId }: { surveyId: string, questionId: string }, 
  { rejectWithValue }) => {
    try {
      await surveyApi.deleteQuestion(questionId);
      return { surveyId, questionId };
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to delete question'));
    }
  }
);

export const fetchPaginatedSurveyResponses = createAsyncThunk(
  'survey/fetchPaginatedSurveyResponses',
  async ({ surveyId, options = {}, forceRefresh = false }: 
  { surveyId: string, options?: SurveyResponseFilterOptions, forceRefresh?: boolean }, 
  { rejectWithValue }) => {
    try {
      return await surveyApi.getSurveyResponsesPaginated(surveyId, options, forceRefresh);
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch paginated survey responses'));
    }
  }
);

// Create the survey slice
export const surveySlice = createSlice({
  name: 'survey',
  initialState,
  reducers: {
    clearSurveyData: (state) => {
      state.currentSurvey = null;
      state.error = null;
    },
    clearResponseData: (state) => {
      state.currentResponse = null;
      state.error = null;
    },
    clearSurveysError: (state) => {
      state.error = null;
    },
    clearPaginatedResponses: (state) => {
      state.paginatedResponses = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Surveys
      .addCase(fetchSurveys.pending, (state) => {
        state.loadingStates.surveys = LoadingState.LOADING;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSurveys.fulfilled, (state, action) => {
        state.surveys = action.payload;
        state.loadingStates.surveys = LoadingState.SUCCEEDED;
        state.loading = false;
      })
      .addCase(fetchSurveys.rejected, (state, action) => {
        state.loadingStates.surveys = LoadingState.FAILED;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Survey by ID
      .addCase(fetchSurveyById.pending, (state) => {
        state.loadingStates.survey = LoadingState.LOADING;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSurveyById.fulfilled, (state, action) => {
        state.currentSurvey = action.payload;
        state.loadingStates.survey = LoadingState.SUCCEEDED;
        state.loading = false;
      })
      .addCase(fetchSurveyById.rejected, (state, action) => {
        state.loadingStates.survey = LoadingState.FAILED;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Survey
      .addCase(createSurvey.pending, (state) => {
        state.loadingStates.createSurvey = LoadingState.LOADING;
        state.loading = true;
        state.error = null;
      })
      .addCase(createSurvey.fulfilled, (state, action) => {
        state.surveys.push(action.payload);
        state.currentSurvey = action.payload;
        state.loadingStates.createSurvey = LoadingState.SUCCEEDED;
        state.loading = false;
      })
      .addCase(createSurvey.rejected, (state, action) => {
        state.loadingStates.createSurvey = LoadingState.FAILED;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Survey
      .addCase(updateSurvey.pending, (state) => {
        state.loadingStates.updateSurvey = LoadingState.LOADING;
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSurvey.fulfilled, (state, action) => {
        state.surveys = state.surveys.map(survey => 
          survey.id === action.payload.id ? action.payload : survey
        );
        state.currentSurvey = action.payload;
        state.loadingStates.updateSurvey = LoadingState.SUCCEEDED;
        state.loading = false;
      })
      .addCase(updateSurvey.rejected, (state, action) => {
        state.loadingStates.updateSurvey = LoadingState.FAILED;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Survey
      .addCase(deleteSurvey.pending, (state) => {
        state.loadingStates.deleteSurvey = LoadingState.LOADING;
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSurvey.fulfilled, (state, action) => {
        state.surveys = state.surveys.filter(survey => survey.id !== action.payload);
        if (state.currentSurvey && state.currentSurvey.id === action.payload) {
          state.currentSurvey = null;
        }
        state.loadingStates.deleteSurvey = LoadingState.SUCCEEDED;
        state.loading = false;
      })
      .addCase(deleteSurvey.rejected, (state, action) => {
        state.loadingStates.deleteSurvey = LoadingState.FAILED;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Survey Responses
      .addCase(fetchSurveyResponses.pending, (state) => {
        state.loadingStates.responses = LoadingState.LOADING;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSurveyResponses.fulfilled, (state, action) => {
        state.surveyResponses = action.payload;
        state.loadingStates.responses = LoadingState.SUCCEEDED;
        state.loading = false;
      })
      .addCase(fetchSurveyResponses.rejected, (state, action) => {
        state.loadingStates.responses = LoadingState.FAILED;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Survey Response
      .addCase(fetchSurveyResponse.pending, (state) => {
        state.loadingStates.response = LoadingState.LOADING;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSurveyResponse.fulfilled, (state, action) => {
        state.currentResponse = action.payload;
        state.loadingStates.response = LoadingState.SUCCEEDED;
        state.loading = false;
      })
      .addCase(fetchSurveyResponse.rejected, (state, action) => {
        state.loadingStates.response = LoadingState.FAILED;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Survey Response
      .addCase(createSurveyResponse.pending, (state) => {
        state.loadingStates.createResponse = LoadingState.LOADING;
        state.loading = true;
        state.error = null;
      })
      .addCase(createSurveyResponse.fulfilled, (state, action) => {
        state.surveyResponses.push(action.payload);
        state.currentResponse = action.payload;
        state.loadingStates.createResponse = LoadingState.SUCCEEDED;
        state.loading = false;
      })
      .addCase(createSurveyResponse.rejected, (state, action) => {
        state.loadingStates.createResponse = LoadingState.FAILED;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Survey Response
      .addCase(updateSurveyResponse.pending, (state) => {
        state.loadingStates.updateResponse = LoadingState.LOADING;
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSurveyResponse.fulfilled, (state, action) => {
        state.surveyResponses = state.surveyResponses.map(response => 
          response.id === action.payload.id ? action.payload : response
        );
        state.currentResponse = action.payload;
        state.loadingStates.updateResponse = LoadingState.SUCCEEDED;
        state.loading = false;
      })
      .addCase(updateSurveyResponse.rejected, (state, action) => {
        state.loadingStates.updateResponse = LoadingState.FAILED;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Survey Response
      .addCase(deleteSurveyResponse.pending, (state) => {
        state.loadingStates.deleteResponse = LoadingState.LOADING;
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSurveyResponse.fulfilled, (state, action) => {
        state.surveyResponses = state.surveyResponses.filter(response => 
          response.id !== action.payload
        );
        if (state.currentResponse && state.currentResponse.id === action.payload) {
          state.currentResponse = null;
        }
        state.loadingStates.deleteResponse = LoadingState.SUCCEEDED;
        state.loading = false;
      })
      .addCase(deleteSurveyResponse.rejected, (state, action) => {
        state.loadingStates.deleteResponse = LoadingState.FAILED;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add Question
      .addCase(addQuestion.pending, (state) => {
        state.loadingStates.addQuestion = LoadingState.LOADING;
        state.loading = true;
        state.error = null;
      })
      .addCase(addQuestion.fulfilled, (state, action) => {
        state.loadingStates.addQuestion = LoadingState.SUCCEEDED;
        state.loading = false;
        
        // If we have the current survey loaded and it matches
        if (state.currentSurvey && state.currentSurvey.id === action.payload.surveyId) {
          // Initialize questions array if it doesn't exist
          if (!state.currentSurvey.questions) {
            state.currentSurvey.questions = [];
          }
          
          // Add the new question to the currentSurvey
          state.currentSurvey.questions.push(action.payload.question);
        }
      })
      .addCase(addQuestion.rejected, (state, action) => {
        state.loadingStates.addQuestion = LoadingState.FAILED;
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Question
    builder
      .addCase(updateQuestion.pending, (state) => {
        state.loadingStates.updateQuestion = LoadingState.LOADING;
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        state.loadingStates.updateQuestion = LoadingState.SUCCEEDED;
        state.loading = false;
        
        // If we have the current survey loaded
        if (state.currentSurvey && state.currentSurvey.questions) {
          // Find and update the question
          const index = state.currentSurvey.questions.findIndex(q => q.id === action.payload.id);
          if (index !== -1) {
            state.currentSurvey.questions[index] = action.payload;
          }
        }
      })
      .addCase(updateQuestion.rejected, (state, action) => {
        state.loadingStates.updateQuestion = LoadingState.FAILED;
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Question
    builder
      .addCase(deleteQuestion.pending, (state) => {
        state.loadingStates.deleteQuestion = LoadingState.LOADING;
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.loadingStates.deleteQuestion = LoadingState.SUCCEEDED;
        state.loading = false;
        
        // If we have the current survey loaded and it matches
        if (state.currentSurvey && state.currentSurvey.id === action.payload.surveyId && state.currentSurvey.questions) {
          // Remove the deleted question
          state.currentSurvey.questions = state.currentSurvey.questions.filter(
            q => q.id !== action.payload.questionId
          );
        }
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.loadingStates.deleteQuestion = LoadingState.FAILED;
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Paginated Survey Responses
    builder
      .addCase(fetchPaginatedSurveyResponses.pending, (state) => {
        state.loadingStates.paginatedResponses = LoadingState.LOADING;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaginatedSurveyResponses.fulfilled, (state, action) => {
        state.paginatedResponses = action.payload;
        state.loadingStates.paginatedResponses = LoadingState.SUCCEEDED;
        state.loading = false;
      })
      .addCase(fetchPaginatedSurveyResponses.rejected, (state, action) => {
        state.loadingStates.paginatedResponses = LoadingState.FAILED;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete All Survey Responses
      .addCase(deleteAllSurveyResponses.pending, (state) => {
        state.loadingStates.deleteResponse = LoadingState.LOADING;
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAllSurveyResponses.fulfilled, (state, action) => {
        // Clear all responses for this survey
        state.surveyResponses = state.surveyResponses.filter(response => 
          response.survey_id !== action.payload.surveyId
        );
        // If current response belongs to this survey, clear it too
        if (state.currentResponse && state.currentResponse.survey_id === action.payload.surveyId) {
          state.currentResponse = null;
        }
        // Clear paginated responses if they're for this survey
        if (state.paginatedResponses && state.paginatedResponses.items.length > 0 && 
            state.paginatedResponses.items[0].survey_id === action.payload.surveyId) {
          state.paginatedResponses = null;
        }
        state.loadingStates.deleteResponse = LoadingState.SUCCEEDED;
        state.loading = false;
      })
      .addCase(deleteAllSurveyResponses.rejected, (state, action) => {
        state.loadingStates.deleteResponse = LoadingState.FAILED;
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { 
  clearSurveyData, 
  clearResponseData, 
  clearSurveysError,
  clearPaginatedResponses 
} = surveySlice.actions;

// Export selectors
export const selectSurveys = (state: RootState) => state.survey.surveys;
export const selectCurrentSurvey = (state: RootState) => state.survey.currentSurvey;
export const selectSurveyResponses = (state: RootState) => state.survey.surveyResponses;
export const selectCurrentResponse = (state: RootState) => state.survey.currentResponse;
export const selectSurveyLoading = (state: RootState) => state.survey.loading;
export const selectSurveyError = (state: RootState) => state.survey.error;

// Loading state selectors
export const selectSurveysLoading = (state: RootState) => state.survey.loadingStates.surveys;
export const selectSurveyByIdLoading = (state: RootState) => state.survey.loadingStates.survey;
export const selectResponsesLoading = (state: RootState) => state.survey.loadingStates.responses;
export const selectResponseLoading = (state: RootState) => state.survey.loadingStates.response;
export const selectCreateSurveyLoading = (state: RootState) => state.survey.loadingStates.createSurvey;
export const selectUpdateSurveyLoading = (state: RootState) => state.survey.loadingStates.updateSurvey;
export const selectDeleteSurveyLoading = (state: RootState) => state.survey.loadingStates.deleteSurvey;
export const selectCreateResponseLoading = (state: RootState) => state.survey.loadingStates.createResponse;
export const selectUpdateResponseLoading = (state: RootState) => state.survey.loadingStates.updateResponse;
export const selectDeleteResponseLoading = (state: RootState) => state.survey.loadingStates.deleteResponse;
export const selectDeleteAllResponsesLoading = (state: RootState) => state.survey.loadingStates.deleteResponse === LoadingState.LOADING;
export const selectAddQuestionLoading = (state: RootState) => state.survey.loadingStates.addQuestion;
export const selectUpdateQuestionLoading = (state: RootState) => state.survey.loadingStates.updateQuestion;
export const selectDeleteQuestionLoading = (state: RootState) => state.survey.loadingStates.deleteQuestion;

// New selectors for paginated responses
export const selectPaginatedResponses = (state: RootState) => state.survey.paginatedResponses;
export const selectPaginatedResponsesLoading = (state: RootState) => state.survey.loadingStates.paginatedResponses;

// Helper selectors for checking loading states
export const selectIsSurveysLoading = (state: RootState) => state.survey.loadingStates.surveys === LoadingState.LOADING;
export const selectIsSurveysFailed = (state: RootState) => state.survey.loadingStates.surveys === LoadingState.FAILED;
export const selectIsSurveysSucceeded = (state: RootState) => state.survey.loadingStates.surveys === LoadingState.SUCCEEDED;

export const selectIsSurveyLoading = (state: RootState) => state.survey.loadingStates.survey === LoadingState.LOADING;
export const selectIsSurveyFailed = (state: RootState) => state.survey.loadingStates.survey === LoadingState.FAILED;
export const selectIsSurveySucceeded = (state: RootState) => state.survey.loadingStates.survey === LoadingState.SUCCEEDED;

export const selectIsResponsesLoading = (state: RootState) => state.survey.loadingStates.responses === LoadingState.LOADING;
export const selectIsResponsesFailed = (state: RootState) => state.survey.loadingStates.responses === LoadingState.FAILED;
export const selectIsResponsesSucceeded = (state: RootState) => state.survey.loadingStates.responses === LoadingState.SUCCEEDED;

export const selectIsPaginatedResponsesLoading = (state: RootState) => state.survey.loadingStates.paginatedResponses === LoadingState.LOADING;
export const selectIsPaginatedResponsesFailed = (state: RootState) => state.survey.loadingStates.paginatedResponses === LoadingState.FAILED;
export const selectIsPaginatedResponsesSucceeded = (state: RootState) => state.survey.loadingStates.paginatedResponses === LoadingState.SUCCEEDED;

// Export reducer
export default surveySlice.reducer;
