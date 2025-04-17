// Define all route paths as constants
export const PATHS = {
    // Public routes
    PUBLIC: {
        HOME: { path: '/', title: 'Northern Intelligence' },

        // Survey management routes
        
        SURVEYS_V2: { path: '/surveys-v2', title: 'Survey Management V2' },
        SURVEYS_V2_DETAIL: { path: '/surveys-v2/:surveyId', title: 'Survey Detail V2' },
        SURVEYS_V2_CREATE: { path: '/surveys-v2/create', title: 'Create Survey V2' },
        SURVEYS_V2_EDIT: { path: '/surveys-v2/edit/:surveyId', title: 'Edit Survey V2' },
        SURVEYS_V2_ANALYSIS: { path: '/surveys-v2/:surveyId/analysis', title: 'Survey Analysis V2' },
        SURVEYS_V2_ANALYSIS_CREATE: { path: '/surveys-v2/:surveyId/analysis/create', title: 'Create Survey Analysis V2' },
        SURVEYS_V2_ANALYSIS_VIEW: { path: '/surveys-v2/:surveyId/analysis/view/:analysisId', title: 'View Survey Analysis V2' },
        SURVEYS_V2_ANALYSIS_EDIT: { path: '/surveys-v2/:surveyId/analysis/edit/:analysisId', title: 'Edit Survey Analysis V2' },
        SURVEYS_V2_ANALYSIS_OUTPUT: { path: '/surveys-v2/:surveyId/analysis/output/:analysisId', title: 'Survey Analysis Output V2' },
    },

    // Private routes
    PRIVATE: {
        // Admin section
        ADMIN: {
            ROOT: '/admin',
        }
    },
} as const;

