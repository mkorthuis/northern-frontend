import React from 'react';
import { 
  Container, Typography, Box, Button, Paper, 
  Card, CardContent, CardActions 
} from '@mui/material';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { AssignmentOutlined, Assignment, Settings } from '@mui/icons-material';

const Survey: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Box textAlign="center" mb={6}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            color: '#333',
            mb: 2
          }}
        >
          Survey Management
        </Typography>
        <Typography 
          variant="h5" 
          color="textSecondary"
          sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}
        >
          Create, manage, and analyze surveys to collect valuable feedback and data
        </Typography>
      </Box>

      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
          justifyContent: 'center' 
        }}
      >
        <Card 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: 3,
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6
            }
          }}
        >
          <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
            <AssignmentOutlined sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" component="h2" gutterBottom>
              Create Surveys
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Design custom surveys with multiple question types, section organization, and conditional logic
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button 
              variant="contained" 
              color="primary" 
              component={Link} 
              to={PATHS.PUBLIC.SURVEY_CREATE.path}
              size="large"
            >
              Create New Survey
            </Button>
          </CardActions>
        </Card>

        <Card 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: 3,
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6
            }
          }}
        >
          <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
            <Settings sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" component="h2" gutterBottom>
              Manage Surveys
            </Typography>
            <Typography variant="body1" color="textSecondary">
              View, edit, and organize all your surveys in one place. Control activation status and date ranges.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button 
              variant="contained" 
              color="primary" 
              component={Link} 
              to={PATHS.PUBLIC.SURVEYS.path}
              size="large"
            >
              Manage Surveys
            </Button>
          </CardActions>
        </Card>
      </Box>

      <Paper 
        sx={{ 
          mt: 6, 
          p: 4, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 2
        }}
      >
        <Typography variant="h6" gutterBottom>
          Need to collect feedback or data?
        </Typography>
        <Typography variant="body1" paragraph>
          Our survey management system allows you to create, distribute, and analyze surveys efficiently.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          to={PATHS.PUBLIC.SURVEYS.path}
          size="large"
          endIcon={<Assignment />}
          sx={{ mt: 1 }}
        >
          Go to Survey Dashboard
        </Button>
      </Paper>
    </Container>
  );
};

export default Survey;
