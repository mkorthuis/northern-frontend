import { BASE_API_URL } from '../config/constants';
import { buildUrl, fetchData } from '../utils/apiUtils';
import axiosInstance from '../config/axios';

// Base URL for survey-analysis endpoints
const BASE_ENDPOINT_URL = BASE_API_URL + 'survey-analysis/';

// Type definitions for survey analysis
interface ChartTypeGet {
    id: number;
    name: string;
}

interface SurveyAnalysisCreate {
    survey_id: string; // uuid
    title: string;
    description?: string | null;
}

interface SurveyAnalysisUpdate {
    title?: string | null;
    description?: string | null;
}

interface SurveyAnalysisGet {
    id: string; // uuid
    survey_id: string; // uuid
    title: string;
    description?: string | null;
    date_created: string; // date-time
    date_updated: string; // date-time
    analysis_questions: SurveyAnalysisQuestionGet[];
}

interface SurveyAnalysisQuestionCreate {
    survey_analysis_id: string; // uuid
    question_id: string; // uuid
    chart_type_id: number;
    sort_by_value?: boolean;
    topic_ids?: string[] | null; // array of uuid
    report_segment_ids?: string[] | null; // array of uuid
}

interface SurveyAnalysisQuestionUpdate {
    chart_type_id?: number | null;
    sort_by_value?: boolean | null;
    topic_ids?: string[] | null; // array of uuid
    report_segment_ids?: string[] | null; // array of uuid
}

interface SurveyAnalysisQuestionGet {
    id: string; // uuid
    question_id: string; // uuid
    chart_type_id: number;
    sort_by_value: boolean;
    chart_type: ChartTypeGet;
    question: QuestionGet;
    topics: SurveyQuestionTopicGet[];
}

interface SurveyQuestionTopicCreate {
    survey_id: string; // uuid
    name: string;
}

interface SurveyQuestionTopicUpdate {
    name?: string | null;
}

interface SurveyQuestionTopicGet {
    id: string; // uuid
    name: string;
}

interface SurveyReportSegmentCreate {
    survey_id: string; // uuid
    name: string;
}

interface SurveyReportSegmentUpdate {
    name?: string | null;
}

interface SurveyReportSegmentGet {
    id: string; // uuid
    name: string;
}

// Importing needed types from surveys.ts
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

// Helper function to build survey-analysis URLs
const buildSurveyAnalysisUrl = (endpoint: string, options: Record<string, any> = {}): string => {
    return buildUrl(BASE_ENDPOINT_URL, endpoint, options);
};

export const surveyAnalysisApi = {
    // Chart Types endpoints
    getChartTypes: (forceRefresh = false) => 
        fetchData(buildSurveyAnalysisUrl('chart-types'), forceRefresh),
    
    getChartTypeById: (chartTypeId: number, forceRefresh = false) => 
        fetchData(buildSurveyAnalysisUrl(`chart-types/${chartTypeId}`), forceRefresh),
    
    // Survey Analysis endpoints
    getSurveyAnalyses: (surveyId: string, forceRefresh = false) => 
        fetchData(buildSurveyAnalysisUrl(`${surveyId}`), forceRefresh),
    
    getSurveyAnalysisById: (analysisId: string, forceRefresh = false) => 
        fetchData(buildSurveyAnalysisUrl(`analyses/${analysisId}`), forceRefresh),
    
    createSurveyAnalysis: (analysisData: SurveyAnalysisCreate) => 
        axiosInstance.post(buildSurveyAnalysisUrl('analyses'), analysisData),
    
    updateSurveyAnalysis: (analysisId: string, analysisData: SurveyAnalysisUpdate) => 
        axiosInstance.put(buildSurveyAnalysisUrl(`analyses/${analysisId}`), analysisData),
    
    deleteSurveyAnalysis: (analysisId: string) => 
        axiosInstance.delete(buildSurveyAnalysisUrl(`analyses/${analysisId}`)),
    
    // Analysis Questions endpoints
    getSurveyAnalysisQuestions: (analysisId: string, forceRefresh = false) => 
        fetchData(buildSurveyAnalysisUrl(`analyses/${analysisId}/questions`), forceRefresh),
    
    getSurveyAnalysisQuestionById: (questionId: string, forceRefresh = false) => 
        fetchData(buildSurveyAnalysisUrl(`analysis-questions/${questionId}`), forceRefresh),
    
    createSurveyAnalysisQuestion: (questionData: SurveyAnalysisQuestionCreate) => 
        axiosInstance.post(buildSurveyAnalysisUrl('analysis-questions'), questionData),
    
    updateSurveyAnalysisQuestion: (questionId: string, questionData: SurveyAnalysisQuestionUpdate) => 
        axiosInstance.put(buildSurveyAnalysisUrl(`analysis-questions/${questionId}`), questionData),
    
    deleteSurveyAnalysisQuestion: (questionId: string) => 
        axiosInstance.delete(buildSurveyAnalysisUrl(`analysis-questions/${questionId}`)),
    
    // Topics endpoints
    getSurveyQuestionTopics: (surveyId: string, forceRefresh = false) => 
        fetchData(buildSurveyAnalysisUrl(`${surveyId}/topics`), forceRefresh),
    
    getSurveyQuestionTopicById: (topicId: string, forceRefresh = false) => 
        fetchData(buildSurveyAnalysisUrl(`topics/${topicId}`), forceRefresh),
    
    createSurveyQuestionTopic: (topicData: SurveyQuestionTopicCreate) => 
        axiosInstance.post(buildSurveyAnalysisUrl('topics'), topicData),
    
    updateSurveyQuestionTopic: (topicId: string, topicData: SurveyQuestionTopicUpdate) => 
        axiosInstance.put(buildSurveyAnalysisUrl(`topics/${topicId}`), topicData),
    
    deleteSurveyQuestionTopic: (topicId: string) => 
        axiosInstance.delete(buildSurveyAnalysisUrl(`topics/${topicId}`)),
    
    // Report Segments endpoints
    getSurveyReportSegments: (surveyId: string, forceRefresh = false) => 
        fetchData(buildSurveyAnalysisUrl(`${surveyId}/segments`), forceRefresh),
    
    getSurveyReportSegmentById: (segmentId: string, forceRefresh = false) => 
        fetchData(buildSurveyAnalysisUrl(`segments/${segmentId}`), forceRefresh),
    
    createSurveyReportSegment: (segmentData: SurveyReportSegmentCreate) => 
        axiosInstance.post(buildSurveyAnalysisUrl('segments'), segmentData),
    
    updateSurveyReportSegment: (segmentId: string, segmentData: SurveyReportSegmentUpdate) => 
        axiosInstance.put(buildSurveyAnalysisUrl(`segments/${segmentId}`), segmentData),
    
    deleteSurveyReportSegment: (segmentId: string) => 
        axiosInstance.delete(buildSurveyAnalysisUrl(`segments/${segmentId}`))
}; 