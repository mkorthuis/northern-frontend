import React, { Suspense } from 'react';
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { RouterProvider } from "react-router-dom";
import { selectThemeMode } from "@/store/slices/appSlice";
import { useAppSelector } from "@store/hooks";
import router from "@routes/index";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import "./App.css"

const App = () => {
  const themeMode = useAppSelector(selectThemeMode);

  const baseTheme = createTheme(); // Create a base theme first
  const theme = createTheme({
    palette: {
      primary: {
        main: '#5D4037', // Rich brown
        light: '#8B6B61',
        dark: '#321911',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#3E7A69', // Muted teal
        light: '#6AA890',
        dark: '#1B4D40',
        contrastText: '#FFFFFF',
      },
      error: {
        main: '#B84141', // Soft red
      },
      warning: {
        main: '#E5A44B', // Warm amber
      },
      info: {
        main: '#4D7EA8', // Muted blue
      },
      success: {
        main: '#548B54', // Muted green
      },
      background: {
        default: '#FBF5ED',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#33302E',
        secondary: '#5C5652',
        disabled: '#9E9892',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 500,
        color: '#5D4037',
      },
      h2: {
        fontWeight: 500,
        color: '#5D4037',
      },
      h3: {
        fontWeight: 500,
        color: '#5D4037',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
            fontWeight: 600,
            color: '#33302E',
          },
        },
      },
    },
  });
  return (
    <ErrorBoundary>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="App" style={{ width: '100%' }}>
            <Suspense fallback={<div>Loading...</div>}>
              <RouterProvider 
                router={router} 
                future={{
                  v7_startTransition: true
                }}
              />
            </Suspense>
          </div>
        </ThemeProvider>
      </LocalizationProvider>
    </ErrorBoundary>
  )
}

export default App