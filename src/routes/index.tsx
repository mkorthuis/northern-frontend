import { createBrowserRouter } from "react-router-dom";
import PrivateLayout from "../components/layout/private/PrivateLayout";
import PublicLayout from "../components/layout/public/PublicLayout";
import { PrivateRoute } from "./PrivateRoute";

import Home from "@/pages/Home";
import Admin from "@/pages/Admin";

// Import Survey components
import SurveysList from "@/features/survey/pages/SurveysList";
import SurveyDetail from "@/features/survey/pages/SurveyDetail";
import SurveyResponses from "@/features/survey/pages/SurveyResponses";
import SurveyCreate from "@/features/survey/pages/SurveyCreate";
import SurveyAnalysis from "@/features/survey/pages/SurveyAnalysis";
import AnalysisDetails from "@/features/survey/pages/AnalysisDetails";

import SurveyList from "@/features/surveyTwo/pages/SurveyList";
import NotFound from "@components/NotFound/NotFound";
import { PATHS } from './paths';
import CreateSurvey from "@/features/surveyTwo/components/CreateSurvey";
import EditSurvey from "@/features/surveyTwo/components/EditSurvey";
import CreateSurveyAnalysis from "@/features/surveyTwo/components/CreateSurveyAnalysis";
import ViewSurveyAnalysis from "@/features/surveyTwo/components/ViewSurveyAnalysis";
import EditSurveyAnalysis from "@/features/surveyTwo/components/EditSurveyAnalysis";

const router = createBrowserRouter(
  [
    {
      element: <PrivateRoute><PrivateLayout /></PrivateRoute>,
      children: [
        { path: PATHS.PRIVATE.ADMIN.ROOT, element: <Admin /> },
      ],
    },
    {
      element: <PublicLayout />,
      children: [
        // Survey routes
        { path: PATHS.PUBLIC.SURVEYS.path, element: <SurveysList /> },
        { path: PATHS.PUBLIC.SURVEY_DETAIL.path, element: <SurveyDetail /> },
        { path: PATHS.PUBLIC.SURVEY_RESPONSES.path, element: <SurveyResponses /> },
        { path: PATHS.PUBLIC.SURVEY_CREATE.path, element: <SurveyCreate /> },
        { path: PATHS.PUBLIC.SURVEY_ANALYSIS.path, element: <SurveyAnalysis /> },
        { path: PATHS.PUBLIC.ANALYSIS_DETAILS.path, element: <AnalysisDetails /> },

        // Survey V2 routes
        { path: PATHS.PUBLIC.SURVEYS_V2.path, element: <SurveyList /> },
        { path: PATHS.PUBLIC.SURVEYS_V2_DETAIL.path, element: <SurveyList /> },
        { path: PATHS.PUBLIC.SURVEYS_V2_CREATE.path, element: <CreateSurvey /> },
        { path: PATHS.PUBLIC.SURVEYS_V2_EDIT.path, element: <EditSurvey /> },
        { path: PATHS.PUBLIC.SURVEYS_V2_ANALYSIS_CREATE.path, element: <CreateSurveyAnalysis /> },
        { path: PATHS.PUBLIC.SURVEYS_V2_ANALYSIS_VIEW.path, element: <ViewSurveyAnalysis /> },
        { path: PATHS.PUBLIC.SURVEYS_V2_ANALYSIS_EDIT.path, element: <EditSurveyAnalysis /> },
        { path: PATHS.PUBLIC.HOME.path, element: <Home /> },
      ]
    },
    {
      path: '*',
      element: <NotFound />
    }
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    } as any
  }
);

export default router;