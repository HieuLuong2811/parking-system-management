
import './App.css';
import Camera from './components/Camera';
import UploadForm from './components/UploadForm'
import { Grid } from '@mui/material';

function App() {
  return (
    <Grid container sx={{ height: "100dvh", overflow: "hidden"}}>
      <Grid size={{ lg: 8, md: 6, xs: 12 }}>
        <Camera />
      </Grid>
      <Grid size={{ lg: 4, md: 6, xs: 12 }}>
        <UploadForm />
      </Grid>
    </Grid>
  );
}

export default App;
