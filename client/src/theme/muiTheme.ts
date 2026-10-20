import { createTheme } from '@mui/material/styles';

export const vastraTheme = createTheme({
  palette: {
    primary: {
      main: '#8C4A2F', // Terracotta
      light: '#FAF4EF',
      dark: '#703A24',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#22201E', // Charcoal
      light: '#3C3936',
      dark: '#141312',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FDFBF7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#22201E',
      secondary: '#6B655F',
    },
    error: {
      main: '#B91C1C',
    },
    success: {
      main: '#15803D',
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 600,
    },
    h3: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 600,
    },
    h4: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 600,
    },
    h5: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 600,
    },
    h6: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 600,
    },
    button: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 2,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#8C4A2F',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#8C4A2F',
            borderWidth: '1.5px',
          },
        },
        notchedOutline: {
          borderColor: '#EAE4D9',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          border: '1px solid #EAE4D9',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.03)',
        },
      },
    },
  },
});
