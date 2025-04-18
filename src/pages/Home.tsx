import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';

/**
 * Simple Home page component that displays "Home" and links to the survey module
 */
export default function Home() {
  const navigate = useNavigate();


  const handleGoToSurveysV2 = () => {
    navigate(PATHS.PUBLIC.SURVEYS_V2.path);
  };

  return (
    <Box sx={{ 
      padding: '24px',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      gap: 4
    }}>
      <Typography variant="h2">
        Home
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        size="large"
        onClick={handleGoToSurveysV2}
      >
        Go to Survey Management V2
      </Button>
    </Box>
  );
}