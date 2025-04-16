// Define all route paths as constants
export const PATHS = {
    // Public routes
    PUBLIC: {
        HOME: { path: '/', title: 'Northern Intelligence' },

        // Survey management routes
        SURVEYS: { path: '/surveys', title: 'Survey Management' },
        SURVEY_DETAIL: { path: '/surveys/:id', title: 'Survey Detail' },
        SURVEY_RESPONSES: { path: '/surveys/:id/responses', title: 'Survey Responses' },
        SURVEY_CREATE: { path: '/surveys/create', title: 'Create Survey' },
        SURVEY_ANALYSIS: { path: '/surveys/:id/analysis', title: 'Survey Analysis' },
        ANALYSIS_DETAILS: { path: '/surveys/:surveyId/analysis/:analysisId', title: 'Analysis Details' },
        
        SURVEYS_V2: { path: '/surveys-v2', title: 'Survey Management V2' },
        SURVEYS_V2_DETAIL: { path: '/surveys-v2/:surveyId', title: 'Survey Detail V2' },
        SURVEYS_V2_CREATE: { path: '/surveys-v2/create', title: 'Create Survey V2' },
        SURVEYS_V2_EDIT: { path: '/surveys-v2/edit/:surveyId', title: 'Edit Survey V2' },
        SURVEYS_V2_ANALYSIS: { path: '/surveys-v2/:surveyId/analysis', title: 'Survey Analysis V2' },
        SURVEYS_V2_ANALYSIS_CREATE: { path: '/surveys-v2/:surveyId/analysis/create', title: 'Create Survey Analysis V2' },
        SURVEYS_V2_ANALYSIS_VIEW: { path: '/surveys-v2/:surveyId/analysis/view/:analysisId', title: 'View Survey Analysis V2' },
        SURVEYS_V2_ANALYSIS_EDIT: { path: '/surveys-v2/:surveyId/analysis/edit/:analysisId', title: 'Edit Survey Analysis V2' },
    },

    // Private routes
    PRIVATE: {
        // Admin section
        ADMIN: {
            ROOT: '/admin',
        }
    },
} as const;

