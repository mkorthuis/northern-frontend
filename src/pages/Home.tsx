import { Box, Typography } from '@mui/material';

/**
 * Simple Home page component that displays "Home"
 */
export default function Home() {
  return (
    <Box sx={{ 
      padding: '24px',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <Typography variant="h2">
        Home
      </Typography>
    </Box>
  );
}