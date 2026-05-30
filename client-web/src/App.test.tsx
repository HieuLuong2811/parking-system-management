import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { ThemeProvider } from "@mui/material";
import theme from "./theme";

test("renders learn react link", () => {
  render(
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>,
  );
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
