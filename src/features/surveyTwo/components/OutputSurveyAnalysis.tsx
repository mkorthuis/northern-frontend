import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  LinearProgress,
  Alert,
  Button
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSurveyAnalysisById } from '@/store/slices/surveyAnalysisSlice';
import { fetchSurveyById, fetchPaginatedSurveyResponses } from '@/store/slices/surveySlice';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Chart colors
const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F',
  '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57'
];

interface AnalysisChartProps {
  chartTypeId: number;
  data: Array<{ name: string; value: number }>;
  sortByValue: boolean;
}

const AnalysisChart: React.FC<AnalysisChartProps> = ({ chartTypeId, data, sortByValue }) => {
  // Sort data by number of responses (highest first) if sortByValue is true
  const sortedData = sortByValue && data.length > 1
    ? [...data].sort((a, b) => b.value - a.value)
    : data;

  switch (chartTypeId) {
    case 1: // Bar Chart
      return (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              height={80}
              angle={-45}
              textAnchor="end"
              interval={0}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
    
    case 2: // Pie Chart
      return (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <Pie
              data={sortedData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label={(entry) => {
                // Truncate long labels to prevent overcrowding
                const name = typeof entry.name === 'string' ? entry.name : String(entry.name);
                return name.length > 20 ? name.substring(0, 17) + '...' : name;
              }}
            >
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ overflowY: 'auto', maxHeight: 100 }} />
          </PieChart>
        </ResponsiveContainer>
      );

    case 3: // Horizontal Bar Chart
      return (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart 
            data={sortedData} 
            layout="vertical"
            margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={140}
              tick={{ width: 135, textAnchor: 'end' }}
            />
            <Tooltip />
            <Bar 
              dataKey="value" 
              fill="#8884d8"
              barSize={20}
            >
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );

    default:
      return (
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="textSecondary">
            Unsupported chart type
          </Typography>
        </Box>
      );
  }
};

const OutputSurveyAnalysis: React.FC = () => {
  const { surveyId, analysisId } = useParams<{ surveyId: string; analysisId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get data from Redux store
  const { currentAnalysis } = useAppSelector((state) => state.surveyAnalysis);
  const { currentSurvey, paginatedResponses, loadingStates: surveyLoadingStates } = useAppSelector((state) => state.survey);
  const analysisLoadingStates = useAppSelector((state) => state.surveyAnalysis.loadingStates);

  // Loading states
  const isSurveyLoading = surveyLoadingStates.survey === 'loading';
  const isAnalysisLoading = analysisLoadingStates.analysis;
  const isResponsesLoading = surveyLoadingStates.paginatedResponses === 'loading';
  const isLoading = isSurveyLoading || isAnalysisLoading || isResponsesLoading;

  // Fetch data when component mounts
  useEffect(() => {
    if (surveyId) {
      dispatch(fetchSurveyById({ surveyId, forceRefresh: true }));
    }
  }, [surveyId, dispatch]);

  useEffect(() => {
    if (analysisId) {
      dispatch(fetchSurveyAnalysisById({ analysisId, forceRefresh: true }));
    }
  }, [analysisId, dispatch]);

  useEffect(() => {
    if (surveyId) {
      dispatch(fetchPaginatedSurveyResponses({ 
        surveyId, 
        options: { 
          page: 1,
          page_size: 1000, // Get a large number of responses for analysis
          completed_only: true 
        },
        forceRefresh: true 
      }));
    }
  }, [surveyId, dispatch]);

  // Process survey responses for visualization
  const getQuestionData = (questionId: string) => {
    if (!paginatedResponses?.items) return [];

    const valueCountMap = new Map<string, number>();

    paginatedResponses.items.forEach(response => {
      const answer = response.answers?.find(a => a.question_id === questionId);
      if (answer) {
        if (answer.value) {
          // Handle single value answers
          const value = answer.value;
          valueCountMap.set(value, (valueCountMap.get(value) || 0) + 1);
        } else if (answer.selected_options) {
          // Handle multiple choice answers
          Object.keys(answer.selected_options).forEach(optionId => {
            valueCountMap.set(optionId, (valueCountMap.get(optionId) || 0) + 1);
          });
        }
      }
    });

    return Array.from(valueCountMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Handle back navigation
  const handleBack = () => {
    if (surveyId && analysisId) {
      navigate(`${PATHS.PUBLIC.SURVEYS_V2_ANALYSIS_VIEW.path.replace(':surveyId', surveyId).replace(':analysisId', analysisId)}`);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Survey Analysis Output
          </Typography>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Generating analysis output...</Typography>
        </Paper>
      </Container>
    );
  }

  if (!currentAnalysis || !currentSurvey) {
    return (
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Survey Analysis Output
          </Typography>
          <Alert severity="error" sx={{ mt: 2 }}>
            Analysis or survey not found
          </Alert>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={handleBack}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {currentAnalysis.title} - Output
          </Typography>
          <Button variant="outlined" onClick={handleBack}>
            Back to Analysis
          </Button>
        </Box>

        {/* Analysis Output Content */}
        <Box sx={{ mt: 4 }}>
          {currentAnalysis.analysis_questions?.map((analysisQuestion) => (
            <Box key={analysisQuestion.id} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {analysisQuestion.question.title}
              </Typography>
              <AnalysisChart
                chartTypeId={analysisQuestion.chart_type_id}
                data={getQuestionData(analysisQuestion.question_id)}
                sortByValue={analysisQuestion.sort_by_value}
              />
            </Box>
          ))}
        </Box>
      </Paper>
    </Container>
  );
};

export default OutputSurveyAnalysis; 