// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { CssBaseline, ThemeProvider } from '@mui/material';
import './i18n';
import { QueryProvider } from './providers/QueryProvider';
import theme from './theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryProvider>
        <App />
      </QueryProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
