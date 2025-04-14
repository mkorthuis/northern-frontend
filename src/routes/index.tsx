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

import NotFound from "@components/NotFound/NotFound";
import { PATHS } from './paths';

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