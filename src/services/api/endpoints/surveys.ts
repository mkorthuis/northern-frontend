import { BASE_API_URL } from '../config/constants';
import { buildUrl, fetchData } from '../utils/apiUtils';
import axiosInstance from '../config/axios';

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
    
    updateQuestion: (questionId: string, questionData: Partial<QuestionCreate>) => 
        axiosInstance.put(buildSurveyUrl(`questions/${questionId}`), questionData),
    
    deleteQuestion: (questionId: string) => 
        axiosInstance.delete(buildSurveyUrl(`questions/${questionId}`)),
    
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
        fetchData(buildSurveyUrl(`${surveyId}/responses`, { completed_only: completedOnly }), forceRefresh)
};
