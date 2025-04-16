import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectAnalyses,
  selectCurrentAnalysis,
  selectChartTypes,
  selectTopics,
  selectSegments,
  selectAnalysisLoading,
  selectAnalysisError,
  selectAnalysesLoading,
  selectAnalysisByIdLoading,
  selectChartTypesLoading,
  selectTopicsLoading,
  selectSegmentsLoading,
  selectCreateAnalysisLoading,
  selectUpdateAnalysisLoading,
  selectDeleteAnalysisLoading,
  selectCreateQuestionLoading,
  selectUpdateQuestionLoading,
  selectDeleteQuestionLoading,
  selectCreateTopicLoading,
  selectUpdateTopicLoading,
  selectDeleteTopicLoading,
  selectCreateSegmentLoading,
  selectUpdateSegmentLoading,
  selectDeleteSegmentLoading,
  fetchChartTypes,
  fetchSurveyAnalyses,
  fetchSurveyAnalysisById,
  createSurveyAnalysis,
  updateSurveyAnalysis,
  deleteSurveyAnalysis,
  fetchSurveyAnalysisQuestions,
  createSurveyAnalysisQuestion,
  updateSurveyAnalysisQuestion,
  deleteSurveyAnalysisQuestion,
  fetchSurveyQuestionTopics,
  createSurveyQuestionTopic,
  updateSurveyQuestionTopic,
  deleteSurveyQuestionTopic,
  fetchSurveyReportSegments,
  createSurveyReportSegment,
  updateSurveyReportSegment,
  deleteSurveyReportSegment,
  clearAnalysisData,
  SurveyAnalysis,
  SurveyAnalysisQuestion,
  SurveyQuestionTopic,
  SurveyReportSegment
} from '@/store/slices/surveyAnalysisSlice';

const useSurveyAnalysis = () => {
  const dispatch = useAppDispatch();
  
  // Select data from the store
  const analyses = useAppSelector(selectAnalyses);
  const currentAnalysis = useAppSelector(selectCurrentAnalysis);
  const chartTypes = useAppSelector(selectChartTypes);
  const topics = useAppSelector(selectTopics);
  const segments = useAppSelector(selectSegments);
  const loading = useAppSelector(selectAnalysisLoading);
  const error = useAppSelector(selectAnalysisError);
  const analysesLoading = useAppSelector(selectAnalysesLoading);
  const analysisByIdLoading = useAppSelector(selectAnalysisByIdLoading);
  const chartTypesLoading = useAppSelector(selectChartTypesLoading);
  const topicsLoading = useAppSelector(selectTopicsLoading);
  const segmentsLoading = useAppSelector(selectSegmentsLoading);
  const createAnalysisLoading = useAppSelector(selectCreateAnalysisLoading);
  const updateAnalysisLoading = useAppSelector(selectUpdateAnalysisLoading);
  const deleteAnalysisLoading = useAppSelector(selectDeleteAnalysisLoading);
  const createQuestionLoading = useAppSelector(selectCreateQuestionLoading);
  const updateQuestionLoading = useAppSelector(selectUpdateQuestionLoading);
  const deleteQuestionLoading = useAppSelector(selectDeleteQuestionLoading);
  const createTopicLoading = useAppSelector(selectCreateTopicLoading);
  const updateTopicLoading = useAppSelector(selectUpdateTopicLoading);
  const deleteTopicLoading = useAppSelector(selectDeleteTopicLoading);
  const createSegmentLoading = useAppSelector(selectCreateSegmentLoading);
  const updateSegmentLoading = useAppSelector(selectUpdateSegmentLoading);
  const deleteSegmentLoading = useAppSelector(selectDeleteSegmentLoading);

  // Define action dispatchers
  const getChartTypes = useCallback((forceRefresh = false) => {
    return dispatch(fetchChartTypes({ forceRefresh }));
  }, [dispatch]);

  const getSurveyAnalyses = useCallback((surveyId: string, forceRefresh = false) => {
    return dispatch(fetchSurveyAnalyses({ surveyId, forceRefresh }));
  }, [dispatch]);

  const getAnalysisById = useCallback((analysisId: string, forceRefresh = false) => {
    return dispatch(fetchSurveyAnalysisById({ analysisId, forceRefresh }));
  }, [dispatch]);

  const addAnalysis = useCallback((analysisData: { survey_id: string, title: string, description?: string | null }) => {
    return dispatch(createSurveyAnalysis(analysisData));
  }, [dispatch]);

  const editAnalysis = useCallback((
    analysisId: string, 
    analysisData: { title?: string | null, description?: string | null }
  ) => {
    return dispatch(updateSurveyAnalysis({ analysisId, analysisData }));
  }, [dispatch]);

  const removeAnalysis = useCallback((analysisId: string) => {
    return dispatch(deleteSurveyAnalysis(analysisId));
  }, [dispatch]);

  const getAnalysisQuestions = useCallback((analysisId: string, forceRefresh = false) => {
    return dispatch(fetchSurveyAnalysisQuestions({ analysisId, forceRefresh }));
  }, [dispatch]);

  const addAnalysisQuestion = useCallback((questionData: {
    survey_analysis_id: string,
    question_id: string,
    chart_type_id: number,
    sort_by_value?: boolean,
    topic_ids?: string[] | null,
    report_segment_ids?: string[] | null
  }) => {
    return dispatch(createSurveyAnalysisQuestion(questionData));
  }, [dispatch]);

  const editAnalysisQuestion = useCallback((
    questionId: string,
    questionData: {
      chart_type_id?: number | null,
      sort_by_value?: boolean | null,
      topic_ids?: string[] | null,
      report_segment_ids?: string[] | null
    }
  ) => {
    return dispatch(updateSurveyAnalysisQuestion({ questionId, questionData }));
  }, [dispatch]);

  const removeAnalysisQuestion = useCallback((questionId: string) => {
    return dispatch(deleteSurveyAnalysisQuestion(questionId));
  }, [dispatch]);

  const getTopics = useCallback((surveyId: string, forceRefresh = false) => {
    return dispatch(fetchSurveyQuestionTopics({ surveyId, forceRefresh }));
  }, [dispatch]);

  const addTopic = useCallback((topicData: { survey_id: string, name: string }) => {
    return dispatch(createSurveyQuestionTopic(topicData));
  }, [dispatch]);

  const editTopic = useCallback((topicId: string, name: string) => {
    return dispatch(updateSurveyQuestionTopic({ topicId, name }));
  }, [dispatch]);

  const removeTopic = useCallback((topicId: string) => {
    return dispatch(deleteSurveyQuestionTopic(topicId));
  }, [dispatch]);

  const getSegments = useCallback((surveyId: string, forceRefresh = false) => {
    return dispatch(fetchSurveyReportSegments({ surveyId, forceRefresh }));
  }, [dispatch]);

  const addSegment = useCallback((segmentData: { survey_id: string, name: string }) => {
    return dispatch(createSurveyReportSegment(segmentData));
  }, [dispatch]);

  const editSegment = useCallback((segmentId: string, name: string) => {
    return dispatch(updateSurveyReportSegment({ segmentId, name }));
  }, [dispatch]);

  const removeSegment = useCallback((segmentId: string) => {
    return dispatch(deleteSurveyReportSegment(segmentId));
  }, [dispatch]);

  const clearAnalysis = useCallback(() => {
    dispatch(clearAnalysisData());
  }, [dispatch]);

  return {
    // State
    analyses,
    currentAnalysis,
    chartTypes,
    topics,
    segments,
    loading,
    error,
    analysesLoading,
    analysisByIdLoading,
    chartTypesLoading,
    topicsLoading,
    segmentsLoading,
    createAnalysisLoading,
    updateAnalysisLoading,
    deleteAnalysisLoading,
    createQuestionLoading,
    updateQuestionLoading,
    deleteQuestionLoading,
    createTopicLoading,
    updateTopicLoading,
    deleteTopicLoading,
    createSegmentLoading,
    updateSegmentLoading,
    deleteSegmentLoading,
    
    // Actions
    getChartTypes,
    getSurveyAnalyses,
    getAnalysisById,
    addAnalysis,
    editAnalysis,
    removeAnalysis,
    getAnalysisQuestions,
    addAnalysisQuestion,
    editAnalysisQuestion,
    removeAnalysisQuestion,
    getTopics,
    addTopic,
    editTopic,
    removeTopic,
    getSegments,
    addSegment,
    editSegment,
    removeSegment,
    clearAnalysis
  };
};

export default useSurveyAnalysis; 