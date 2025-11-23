// src/theme.ts
import { createTheme } from '@mui/material/styles';

// Define the PerfomaIT color palette
const palette = {
  primary: {
    main: '#0D47A1', // A deep, professional blue
    light: '#1976D2',
    dark: '#0A3A82',
  },
  secondary: {
    main: '#42A5F5', // A lighter, vibrant blue for accents
  },
  background: {
    default: '#F4F6F8', // Light grey for the main app background
    paper: '#FFFFFF', // White for cards, modals, etc.
  },
  text: {
    primary: '#212121', // Dark grey for primary text
    secondary: '#757575', // Lighter grey for secondary text
  },
};

// Create the theme instance
export const theme = createTheme({
  palette: palette,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
      color: palette.text.primary,
    },
    subtitle1: {
      fontSize: '1rem',
      color: palette.text.secondary,
    },
  },
  components: {
    // Style overrides for specific components
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});