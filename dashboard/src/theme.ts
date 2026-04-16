import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0.2px',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
    },
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#5e4fd8',
      light: '#7b6df0',
      dark: '#3430a5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f94a8a',
      contrastText: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    background: {
      default: '#f4f6fb',
      paper: '#ffffff',
    },
    divider: '#e0e3ec',
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          boxShadow: '0 10px 35px rgba(15, 23, 42, 0.08)',
          borderBottom: '1px solid #e0e3ec',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e0e3ec',
          '&:last-of-type': {
            borderBottom: 'none',
          },
          borderCollapse: 'collapse',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          boxShadow: 'none',
          fontWeight: 600,
        },
        contained: {
          backgroundColor: '#6b4fd0',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#5440b5',
          },
        },
      },
    },
  },
});

export default theme;
