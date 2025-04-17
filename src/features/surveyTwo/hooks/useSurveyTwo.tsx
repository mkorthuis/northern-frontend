import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
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
  selectPaginatedResponses,
  selectPaginatedResponsesLoading,
  selectIsSurveysLoading,
  selectIsSurveysFailed,
  selectIsSurveysSucceeded,
  selectIsSurveyLoading,
  selectIsSurveyFailed,
  selectIsSurveySucceeded,
  selectIsResponsesLoading,
  selectIsResponsesFailed,
  selectIsResponsesSucceeded,
  selectIsPaginatedResponsesLoading,
  selectIsPaginatedResponsesFailed,
  selectIsPaginatedResponsesSucceeded,
  fetchSurveys,
  fetchSurveyById,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  fetchSurveyResponses,
  fetchPaginatedSurveyResponses,
  fetchSurveyResponse,
  createSurveyResponse,
  updateSurveyResponse,
  deleteSurveyResponse,
  clearSurveyData,
  Survey,
  SurveyQuestion,
  SurveyResponse,
  SurveyResponseFilterOptions,
  LoadingState
} from '@/store/slices/surveySlice';

const useSurvey = () => {
  const dispatch = useAppDispatch();
  
  // Select data from the store
  const surveys = useAppSelector(selectSurveys);
  const currentSurvey = useAppSelector(selectCurrentSurvey);
  const surveyResponses = useAppSelector(selectSurveyResponses);
  const paginatedResponses = useAppSelector(selectPaginatedResponses);
  const currentResponse = useAppSelector(selectCurrentResponse);
  const loading = useAppSelector(selectSurveyLoading);
  const error = useAppSelector(selectSurveyError);
  const surveysLoading = useAppSelector(selectSurveysLoading);
  const surveyByIdLoading = useAppSelector(selectSurveyByIdLoading);
  const responsesLoading = useAppSelector(selectResponsesLoading);
  const paginatedResponsesLoading = useAppSelector(selectPaginatedResponsesLoading);
  const createSurveyLoading = useAppSelector(selectCreateSurveyLoading);
  const addQuestionLoading = useAppSelector(selectAddQuestionLoading);
  const updateQuestionLoading = useAppSelector(selectUpdateQuestionLoading);
  const deleteQuestionLoading = useAppSelector(selectDeleteQuestionLoading);
  
  // New loading state selectors
  const isSurveysLoading = useAppSelector(selectIsSurveysLoading);
  const isSurveysFailed = useAppSelector(selectIsSurveysFailed);
  const isSurveysSucceeded = useAppSelector(selectIsSurveysSucceeded);
  const isSurveyLoading = useAppSelector(selectIsSurveyLoading);
  const isSurveyFailed = useAppSelector(selectIsSurveyFailed);
  const isSurveySucceeded = useAppSelector(selectIsSurveySucceeded);
  const isResponsesLoading = useAppSelector(selectIsResponsesLoading);
  const isResponsesFailed = useAppSelector(selectIsResponsesFailed);
  const isResponsesSucceeded = useAppSelector(selectIsResponsesSucceeded);
  const isPaginatedResponsesLoading = useAppSelector(selectIsPaginatedResponsesLoading);
  const isPaginatedResponsesFailed = useAppSelector(selectIsPaginatedResponsesFailed);
  const isPaginatedResponsesSucceeded = useAppSelector(selectIsPaginatedResponsesSucceeded);

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

  const getSurveyResponsesPaginated = useCallback(
    (surveyId: string, options: SurveyResponseFilterOptions = {}, forceRefresh = false) => {
      return dispatch(fetchPaginatedSurveyResponses({ surveyId, options, forceRefresh }));
    },
    [dispatch]
  );

  const getSurveyResponse = useCallback((responseId: string, forceRefresh = false) => {
    return dispatch(fetchSurveyResponse({ responseId, forceRefresh }));
  }, [dispatch]);

  const createResponse = useCallback((responseData: any) => {
    return dispatch(createSurveyResponse(responseData));
  }, [dispatch]);

  const updateResponse = useCallback((responseId: string, responseData: any) => {
    return dispatch(updateSurveyResponse({ responseId, responseData }));
  }, [dispatch]);

  const deleteResponse = useCallback((responseId: string) => {
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
    paginatedResponses,
    currentResponse,
    loading,
    error,
    surveysLoading,
    surveyByIdLoading,
    responsesLoading,
    paginatedResponsesLoading,
    createSurveyLoading,
    addQuestionLoading,
    updateQuestionLoading,
    deleteQuestionLoading,
    
    // New loading state selectors
    isSurveysLoading,
    isSurveysFailed,
    isSurveysSucceeded,
    isSurveyLoading,
    isSurveyFailed,
    isSurveySucceeded,
    isResponsesLoading,
    isResponsesFailed,
    isResponsesSucceeded,
    isPaginatedResponsesLoading,
    isPaginatedResponsesFailed,
    isPaginatedResponsesSucceeded,
    
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
    getSurveyResponsesPaginated,
    getSurveyResponse,
    createSurveyResponse: createResponse,
    updateSurveyResponse: updateResponse,
    deleteSurveyResponse: deleteResponse,
    clearSurvey,
    
    // Export the LoadingState enum
    LoadingState
  };
};

export default useSurvey; 