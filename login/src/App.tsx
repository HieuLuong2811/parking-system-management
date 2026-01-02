import React from 'react';
import { CssBaseline } from '@mui/material';
import { AppRouter } from './routers/AppRouter';

// Component App chính để bọc Router và CssBaseline
const App: React.FC = () => {
  return (
    <React.Fragment>
      {/* Sử dụng một style cơ bản để đảm bảo giao diện đẹp */}
      <style>{`
          body {
              background-color: #f4f6f8;
              font-family: 'Roboto', sans-serif;
              margin: 0;
              padding: 0;
          }
      `}</style>
      <CssBaseline />
      <AppRouter />
    </React.Fragment>
  );
}

export default App;