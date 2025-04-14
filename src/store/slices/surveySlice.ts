import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';
import { surveyApi } from '@/services/api/endpoints/surveys';

// Define types for the slice state
export interface SurveyOption {
  text: string;
  order_index: number;
  is_other_option?: boolean;
  score?: number | null;
  row_label?: string | null;
  column_label?: string | null;
}

export interface SurveyQuestion {
  id?: string;
  title: string;
  description?: string | null;
  is_required?: boolean;
  order_index: number;
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
  created_at?: string;
  updated_at?: string;
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
  created_at?: string;
  updated_at?: string;
  completed_at?: string | null;
  is_complete?: boolean;
  answers?: SurveyResponseAnswer[];
}

export interface SurveyState {
  surveys: Survey[];
  currentSurvey: Survey | null;
  surveyResponses: SurveyResponse[];
  currentResponse: SurveyResponse | null;
  loading: boolean;
  loadingStates: {
    surveys: boolean;
    survey: boolean;
    responses: boolean;
    response: boolean;
    createSurvey: boolean;
    updateSurvey: boolean;
    deleteSurvey: boolean;
    createResponse: boolean;
    updateResponse: boolean;
    deleteResponse: boolean;
    addQuestion: boolean;
    updateQuestion: boolean;
    deleteQuestion: boolean;
  };
  error: string | null;
}

const initialState: SurveyState = {
  surveys: [],
  currentSurvey: null,
  surveyResponses: [],
  currentResponse: null,
  loading: false,
  loadingStates: {
    surveys: false,
    survey: false,
    responses: false,
    response: false,
    createSurvey: false,
    updateSurvey: false,
    deleteSurvey: false,
    createResponse: false,
    updateResponse: false,
    deleteResponse: false,
    addQuestion: false,
    updateQuestion: false,
    deleteQuestion: false,
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch Surveys
      .addCase(fetchSurveys.pending, (state) => {
        state.loadingStates.surveys = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSurveys.fulfilled, (state, action) => {
        state.surveys = action.payload;
        state.loadingStates.surveys = false;
        state.loading = false;
      })
      .addCase(fetchSurveys.rejected, (state, action) => {
        state.loadingStates.surveys = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Survey by ID
      .addCase(fetchSurveyById.pending, (state) => {
        state.loadingStates.survey = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSurveyById.fulfilled, (state, action) => {
        state.currentSurvey = action.payload;
        state.loadingStates.survey = false;
        state.loading = false;
      })
      .addCase(fetchSurveyById.rejected, (state, action) => {
        state.loadingStates.survey = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Survey
      .addCase(createSurvey.pending, (state) => {
        state.loadingStates.createSurvey = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(createSurvey.fulfilled, (state, action) => {
        state.surveys.push(action.payload);
        state.currentSurvey = action.payload;
        state.loadingStates.createSurvey = false;
        state.loading = false;
      })
      .addCase(createSurvey.rejected, (state, action) => {
        state.loadingStates.createSurvey = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Survey
      .addCase(updateSurvey.pending, (state) => {
        state.loadingStates.updateSurvey = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSurvey.fulfilled, (state, action) => {
        state.surveys = state.surveys.map(survey => 
          survey.id === action.payload.id ? action.payload : survey
        );
        state.currentSurvey = action.payload;
        state.loadingStates.updateSurvey = false;
        state.loading = false;
      })
      .addCase(updateSurvey.rejected, (state, action) => {
        state.loadingStates.updateSurvey = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Survey
      .addCase(deleteSurvey.pending, (state) => {
        state.loadingStates.deleteSurvey = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSurvey.fulfilled, (state, action) => {
        state.surveys = state.surveys.filter(survey => survey.id !== action.payload);
        if (state.currentSurvey && state.currentSurvey.id === action.payload) {
          state.currentSurvey = null;
        }
        state.loadingStates.deleteSurvey = false;
        state.loading = false;
      })
      .addCase(deleteSurvey.rejected, (state, action) => {
        state.loadingStates.deleteSurvey = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Survey Responses
      .addCase(fetchSurveyResponses.pending, (state) => {
        state.loadingStates.responses = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSurveyResponses.fulfilled, (state, action) => {
        state.surveyResponses = action.payload;
        state.loadingStates.responses = false;
        state.loading = false;
      })
      .addCase(fetchSurveyResponses.rejected, (state, action) => {
        state.loadingStates.responses = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Survey Response
      .addCase(fetchSurveyResponse.pending, (state) => {
        state.loadingStates.response = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSurveyResponse.fulfilled, (state, action) => {
        state.currentResponse = action.payload;
        state.loadingStates.response = false;
        state.loading = false;
      })
      .addCase(fetchSurveyResponse.rejected, (state, action) => {
        state.loadingStates.response = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Survey Response
      .addCase(createSurveyResponse.pending, (state) => {
        state.loadingStates.createResponse = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(createSurveyResponse.fulfilled, (state, action) => {
        state.surveyResponses.push(action.payload);
        state.currentResponse = action.payload;
        state.loadingStates.createResponse = false;
        state.loading = false;
      })
      .addCase(createSurveyResponse.rejected, (state, action) => {
        state.loadingStates.createResponse = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Survey Response
      .addCase(updateSurveyResponse.pending, (state) => {
        state.loadingStates.updateResponse = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSurveyResponse.fulfilled, (state, action) => {
        state.surveyResponses = state.surveyResponses.map(response => 
          response.id === action.payload.id ? action.payload : response
        );
        state.currentResponse = action.payload;
        state.loadingStates.updateResponse = false;
        state.loading = false;
      })
      .addCase(updateSurveyResponse.rejected, (state, action) => {
        state.loadingStates.updateResponse = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Survey Response
      .addCase(deleteSurveyResponse.pending, (state) => {
        state.loadingStates.deleteResponse = true;
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
        state.loadingStates.deleteResponse = false;
        state.loading = false;
      })
      .addCase(deleteSurveyResponse.rejected, (state, action) => {
        state.loadingStates.deleteResponse = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add Question
      .addCase(addQuestion.pending, (state) => {
        state.loadingStates.addQuestion = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(addQuestion.fulfilled, (state, action) => {
        state.loadingStates.addQuestion = false;
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
        state.loadingStates.addQuestion = false;
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Question
    builder
      .addCase(updateQuestion.pending, (state) => {
        state.loadingStates.updateQuestion = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        state.loadingStates.updateQuestion = false;
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
        state.loadingStates.updateQuestion = false;
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Question
    builder
      .addCase(deleteQuestion.pending, (state) => {
        state.loadingStates.deleteQuestion = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.loadingStates.deleteQuestion = false;
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
        state.loadingStates.deleteQuestion = false;
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { 
  clearSurveyData, 
  clearResponseData, 
  clearSurveysError 
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
export const selectAddQuestionLoading = (state: RootState) => state.survey.loadingStates.addQuestion;
export const selectUpdateQuestionLoading = (state: RootState) => state.survey.loadingStates.updateQuestion;
export const selectDeleteQuestionLoading = (state: RootState) => state.survey.loadingStates.deleteQuestion;

// Export reducer
export default surveySlice.reducer;
