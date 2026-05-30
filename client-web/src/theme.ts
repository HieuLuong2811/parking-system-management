import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: `'Inter', 'Segoe UI', system-ui, sans-serif`,
    h1: {
      fontSize: "3rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "2.4rem",
      fontWeight: 700,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.7,
    },
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiSnackbar: {
      styleOverrides: {
        root: {
          "&.MuiSnackbar-anchorOriginTopRight": {
            top: "50px",
          },
          "&.MuiSnackbar-anchorOriginTopLeft": {
            top: "50px",
          },
          "&.MuiSnackbar-anchorOriginTopCenter": {
            top: "50px",
          },
        },
      },
    },
  },
});

export default theme;
