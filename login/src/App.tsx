import React, { useEffect } from 'react';
import { CssBaseline } from '@mui/material';
import { AppRouter } from './routers/AppRouter';
import './App.css';
import { applyPalette } from './ultis/palette';

// Component App chính để bọc Router và CssBaseline
const App: React.FC = () => {
  useEffect(() => {
    applyPalette();
  }, []);

  return (
    <React.Fragment>
      <CssBaseline />
      <AppRouter />
    </React.Fragment>
  );
};

export default App;
