import { BASE_API_URL } from '../config/constants';
import { buildUrl, fetchData } from '../utils/apiUtils';
import axiosInstance from '../config/axios';

// The base URL already includes '/api/v1/' so we only need to append 'survey/'
const BASE_ENDPOINT_URL = BASE_API_URL + 'survey/';

// Type definitions based on the API schema
interface SurveyCreate {
    title: string;
    description?: string | null;
    survey_start?: string | null; // date-time
    survey_end?: string | null; // date-time
    is_active?: boolean;
    sections?: SurveySectionCreate[];
    questions?: QuestionCreate[];
}

interface SurveyUpdate {
    title?: string | null;
    description?: string | null;
    survey_start?: string | null; // date-time
    survey_end?: string | null; // date-time
    is_active?: boolean | null;
}

interface SurveySectionCreate {
    title: string;
    description?: string | null;
    order_index: number;
    questions?: QuestionCreate[];
}

interface QuestionCreate {
    title: string;
    description?: string | null;
    is_required?: boolean;
    order_index: number;
    type_id: number;
    section_id?: string | null; // uuid
    validation_rules?: object | null;
    display_logic?: object | null;
    allow_multiple?: boolean;
    max_answers?: number | null;
    options?: QuestionOptionCreate[];
}

interface QuestionOptionCreate {
    text: string;
    order_index: number;
    is_other_option?: boolean;
    score?: number | null;
    row_label?: string | null;
    column_label?: string | null;
}

interface SurveyResponseCreate {
    survey_id: string; // uuid
    respondent_id?: string | null; // uuid
    ip_address?: string | null;
    user_agent?: string | null;
    response_metadata?: object | null;
    answers?: AnswerCreate[];
}

interface SurveyResponseBulkCreate {
    survey_id: string; // uuid
    responses: SurveyResponseCreate[];
    batch_metadata?: object | null;
}

interface SurveyResponseUpdate {
    completed_at?: string | null; // date-time
    is_complete?: boolean | null;
    answers?: AnswerCreate[] | null;
}

interface AnswerCreate {
    question_id: string; // uuid
    value?: string | null;
    selected_options?: object | null;
    file_path?: string | null;
    items?: AnswerItemCreate[];
}

interface AnswerItemCreate {
    item_index: number;
    value?: string | null;
    option_id?: string | null; // uuid
    row_identifier?: string | null;
    column_identifier?: string | null;
}

// Paginated response interface
interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    pages: number;
    has_previous: boolean;
    has_next: boolean;
}

// Survey response interface
interface SurveyResponse {
    id: string; // uuid
    survey_id: string; // uuid
    respondent_id?: string | null; // uuid
    started_at: string; // date-time
    completed_at?: string | null; // date-time
    is_complete: boolean;
    answers: Answer[];
}

interface Answer {
    id: string; // uuid
    question_id: string; // uuid
    value?: string | null;
    selected_options?: object | null;
    file_path?: string | null;
    items?: AnswerItem[];
}

interface AnswerItem {
    id: string; // uuid
    item_index: number;
    value?: string | null;
    option_id?: string | null; // uuid
    row_identifier?: string | null;
    column_identifier?: string | null;
}

// Filter options for paginated survey responses
interface SurveyResponseFilterOptions {
    page?: number;
    page_size?: number;
    completed_only?: boolean;
    started_after?: string | null;
    started_before?: string | null;
    respondent_id?: string | null;
    search_term?: string | null;
}

// Update the existing interface or add QuestionGet type
interface QuestionGet {
    id: string; // uuid
    title: string;
    description?: string | null;
    is_required: boolean;
    order_index: number;
    external_question_id?: string | null;
    validation_rules?: object | null;
    display_logic?: object | null;
    allow_multiple: boolean;
    max_answers?: number | null;
    type: QuestionTypeGet;
    options: QuestionOptionGet[];
}

interface QuestionTypeGet {
    id: number;
    name: string;
    description?: string | null;
}

interface QuestionOptionGet {
    id: string; // uuid
    text: string;
    order_index: number;
    is_other_option: boolean;
    score?: number | null;
    row_label?: string | null;
    column_label?: string | null;
}

// Helper function specific to survey endpoints
const buildSurveyUrl = (endpoint: string, options: Record<string, any> = {}): string => {
    return buildUrl(BASE_ENDPOINT_URL, endpoint, options);
};

export const surveyApi = {
    // Survey endpoints
    getSurveys: (activeOnly = false, forceRefresh = false) => 
        fetchData(buildSurveyUrl('', { active_only: activeOnly }), forceRefresh),
    
    createSurvey: (surveyData: SurveyCreate) => 
        axiosInstance.post(BASE_ENDPOINT_URL, surveyData),
    
    getSurveyById: (surveyId: string, forceRefresh = false) => 
        fetchData(buildSurveyUrl(`${surveyId}`), forceRefresh),
    
    updateSurvey: (surveyId: string, surveyData: SurveyUpdate) => 
        axiosInstance.put(buildSurveyUrl(`${surveyId}`), surveyData),
    
    deleteSurvey: (surveyId: string) => 
        axiosInstance.delete(buildSurveyUrl(`${surveyId}`)),
    
    // Question endpoints
    addQuestion: (surveyId: string, questionData: QuestionCreate) => 
        axiosInstance.post(buildSurveyUrl(`${surveyId}/questions`), questionData),
    
    getQuestion: (questionId: string, forceRefresh = false) =>
        fetchData(buildSurveyUrl(`questions/${questionId}`), forceRefresh),
    
    updateQuestion: (questionId: string, questionData: Partial<QuestionCreate>) => 
        axiosInstance.put(buildSurveyUrl(`questions/${questionId}`), questionData),
    
    deleteQuestion: (questionId: string) => 
        axiosInstance.delete(buildSurveyUrl(`questions/${questionId}`)),
    
    // Get survey questions
    getSurveyQuestions: (surveyId: string, forceRefresh = false) =>
        fetchData(buildSurveyUrl(`${surveyId}/questions`), forceRefresh),
    
    // Survey response endpoints
    createSurveyResponse: (responseData: SurveyResponseCreate) => 
        axiosInstance.post(buildSurveyUrl('response'), responseData),
    
    createSurveyResponsesBulk: (bulkData: SurveyResponseBulkCreate) => 
        axiosInstance.post(buildSurveyUrl('response/bulk'), bulkData),
    
    getSurveyResponse: (responseId: string, forceRefresh = false) => 
        fetchData(buildSurveyUrl(`response/${responseId}`), forceRefresh),
    
    updateSurveyResponse: (responseId: string, responseData: SurveyResponseUpdate) => 
        axiosInstance.put(buildSurveyUrl(`response/${responseId}`), responseData),
    
    deleteSurveyResponse: (responseId: string) => 
        axiosInstance.delete(buildSurveyUrl(`response/${responseId}`)),
    
    // Get all responses for a specific survey
    getSurveyResponses: (surveyId: string, completedOnly = false, forceRefresh = false) => 
        fetchData(buildSurveyUrl(`${surveyId}/responses`, { completed_only: completedOnly }), forceRefresh),
    
    // Get paginated responses for a specific survey with filtering options
    getSurveyResponsesPaginated: (
        surveyId: string, 
        options: SurveyResponseFilterOptions = {}, 
        forceRefresh = false
    ): Promise<PaginatedResponse<SurveyResponse>> => {
        const params = {
            page: options.page || 1,
            page_size: options.page_size || 50,
            completed_only: options.completed_only || false,
            ...options.started_after && { started_after: options.started_after },
            ...options.started_before && { started_before: options.started_before },
            ...options.respondent_id && { respondent_id: options.respondent_id },
            ...options.search_term && { search_term: options.search_term }
        };
        
        return fetchData(buildSurveyUrl(`${surveyId}/responses`, params), forceRefresh);
    }
};
