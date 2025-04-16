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
    },

    // Private routes
    PRIVATE: {
        // Admin section
        ADMIN: {
            ROOT: '/admin',
        }
    },
} as const;

