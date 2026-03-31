import { AuthProvider } from './contexts/authContext';
import { AppRouter } from './routes/appRouter';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
