import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  selectCurrentSurvey, 
  selectSurveyResponses,
  selectPaginatedResponses,
  selectSurveyByIdLoading, 
  selectResponsesLoading,
  selectPaginatedResponsesLoading,
  selectSurveyError,
  fetchSurveyById,
  fetchSurveyResponses,
  fetchPaginatedSurveyResponses,
  fetchSurveyResponse,
  createSurveyResponse,
  updateSurveyResponse,
  deleteSurveyResponse,
  SurveyResponseFilterOptions
} from '@/store/slices/surveySlice';

const useSurvey = () => {
  const dispatch = useAppDispatch();
  
  const currentSurvey = useAppSelector(selectCurrentSurvey);
  const surveyResponses = useAppSelector(selectSurveyResponses);
  const paginatedResponses = useAppSelector(selectPaginatedResponses);
  const surveyByIdLoading = useAppSelector(selectSurveyByIdLoading);
  const responsesLoading = useAppSelector(selectResponsesLoading);
  const paginatedResponsesLoading = useAppSelector(selectPaginatedResponsesLoading);
  const error = useAppSelector(selectSurveyError);

  const getSurveyById = useCallback(
    (surveyId: string, forceRefresh = false) => {
      return dispatch(fetchSurveyById({ surveyId, forceRefresh }));
    },
    [dispatch]
  );

  const getSurveyResponses = useCallback(
    (surveyId: string, completedOnly = false, forceRefresh = false) => {
      return dispatch(fetchSurveyResponses({ surveyId, completedOnly, forceRefresh }));
    },
    [dispatch]
  );

  const getSurveyResponsesPaginated = useCallback(
    (surveyId: string, options: SurveyResponseFilterOptions = {}, forceRefresh = false) => {
      return dispatch(fetchPaginatedSurveyResponses({ surveyId, options, forceRefresh }));
    },
    [dispatch]
  );

  const getSurveyResponse = useCallback(
    (responseId: string, forceRefresh = false) => {
      return dispatch(fetchSurveyResponse({ responseId, forceRefresh }));
    },
    [dispatch]
  );

  const createResponse = useCallback(
    (responseData: any) => {
      return dispatch(createSurveyResponse(responseData));
    },
    [dispatch]
  );

  const updateResponse = useCallback(
    (responseId: string, responseData: any) => {
      return dispatch(updateSurveyResponse({ responseId, responseData }));
    },
    [dispatch]
  );

  const deleteResponse = useCallback(
    (responseId: string) => {
      return dispatch(deleteSurveyResponse(responseId));
    },
    [dispatch]
  );

  return {
    currentSurvey,
    surveyResponses,
    paginatedResponses,
    surveyByIdLoading,
    responsesLoading,
    paginatedResponsesLoading,
    error,
    getSurveyById,
    getSurveyResponses,
    getSurveyResponsesPaginated,
    getSurveyResponse,
    createSurveyResponse: createResponse,
    updateSurveyResponse: updateResponse,
    deleteSurveyResponse: deleteResponse
  };
};

export default useSurvey; 