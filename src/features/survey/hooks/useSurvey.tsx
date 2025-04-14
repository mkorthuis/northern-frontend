import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectSurveys,
  selectCurrentSurvey,
  selectSurveyResponses,
  selectCurrentResponse,
  selectSurveyLoading,
  selectSurveyError,
  selectSurveysLoading,
  selectSurveyByIdLoading,
  selectResponsesLoading,
  selectCreateSurveyLoading,
  selectAddQuestionLoading,
  selectUpdateQuestionLoading,
  selectDeleteQuestionLoading,
  fetchSurveys,
  fetchSurveyById,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  fetchSurveyResponses,
  fetchSurveyResponse,
  deleteSurveyResponse,
  clearSurveyData,
  Survey,
  SurveyQuestion,
  SurveyResponse
} from '@/store/slices/surveySlice';
import { useAppDispatch } from '@/store/hooks';

const useSurvey = () => {
  const dispatch = useAppDispatch();
  
  // Select data from the store
  const surveys = useSelector(selectSurveys);
  const currentSurvey = useSelector(selectCurrentSurvey);
  const surveyResponses = useSelector(selectSurveyResponses);
  const currentResponse = useSelector(selectCurrentResponse);
  const loading = useSelector(selectSurveyLoading);
  const error = useSelector(selectSurveyError);
  const surveysLoading = useSelector(selectSurveysLoading);
  const surveyByIdLoading = useSelector(selectSurveyByIdLoading);
  const responsesLoading = useSelector(selectResponsesLoading);
  const createSurveyLoading = useSelector(selectCreateSurveyLoading);
  const addQuestionLoading = useSelector(selectAddQuestionLoading);
  const updateQuestionLoading = useSelector(selectUpdateQuestionLoading);
  const deleteQuestionLoading = useSelector(selectDeleteQuestionLoading);

  // Define action dispatchers
  const getSurveys = useCallback((activeOnly = false, forceRefresh = false) => {
    return dispatch(fetchSurveys({ activeOnly, forceRefresh }));
  }, [dispatch]);

  const getSurveyById = useCallback((surveyId: string, forceRefresh = false) => {
    return dispatch(fetchSurveyById({ surveyId, forceRefresh }));
  }, [dispatch]);

  const addSurvey = useCallback((surveyData: Survey) => {
    return dispatch(createSurvey(surveyData));
  }, [dispatch]);

  const editSurvey = useCallback((surveyId: string, surveyData: Partial<Survey>) => {
    return dispatch(updateSurvey({ surveyId, surveyData }));
  }, [dispatch]);

  const removeSurvey = useCallback((surveyId: string) => {
    return dispatch(deleteSurvey(surveyId));
  }, [dispatch]);

  const getSurveyResponses = useCallback((surveyId: string, completedOnly = false, forceRefresh = false) => {
    return dispatch(fetchSurveyResponses({ surveyId, completedOnly, forceRefresh }));
  }, [dispatch]);

  const getSurveyResponse = useCallback((responseId: string, forceRefresh = false) => {
    return dispatch(fetchSurveyResponse({ responseId, forceRefresh }));
  }, [dispatch]);

  const deleteSurveyResponseAction = useCallback((responseId: string) => {
    return dispatch(deleteSurveyResponse(responseId));
  }, [dispatch]);

  // Question management actions
  const addQuestionToSurvey = useCallback((surveyId: string, questionData: SurveyQuestion) => {
    return dispatch(addQuestion({ surveyId, questionData }));
  }, [dispatch]);

  const editQuestion = useCallback((questionId: string, questionData: Partial<SurveyQuestion>) => {
    return dispatch(updateQuestion({ questionId, questionData }));
  }, [dispatch]);

  const removeQuestion = useCallback((surveyId: string, questionId: string) => {
    return dispatch(deleteQuestion({ surveyId, questionId }));
  }, [dispatch]);

  const clearSurvey = useCallback(() => {
    dispatch(clearSurveyData());
  }, [dispatch]);

  return {
    // State
    surveys,
    currentSurvey,
    surveyResponses,
    currentResponse,
    loading,
    error,
    surveysLoading,
    surveyByIdLoading,
    responsesLoading,
    createSurveyLoading,
    addQuestionLoading,
    updateQuestionLoading,
    deleteQuestionLoading,
    
    // Actions
    getSurveys,
    getSurveyById,
    addSurvey,
    editSurvey,
    removeSurvey,
    addQuestionToSurvey,
    editQuestion,
    removeQuestion,
    getSurveyResponses,
    getSurveyResponse,
    deleteSurveyResponse: deleteSurveyResponseAction,
    clearSurvey
  };
};

export default useSurvey; 