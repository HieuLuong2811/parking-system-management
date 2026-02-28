// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { CssBaseline } from '@mui/material';
import { QueryProvider } from './providers/QueryProvider';
import "./i18n";
// import { ThemeProvider } from '@mui/material/styles';
// import theme from './theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CssBaseline />
    <QueryProvider>
      {/* <ThemeProvider theme={theme}> */}
        <App />
      {/* </ThemeProvider> */}
    </QueryProvider>
  </React.StrictMode>,
);