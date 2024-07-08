import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import getTheme from './theme';

const ThemeProviderWrapper = ({ children, darkMode }) => {
  const theme = getTheme(darkMode ? 'dark' : 'light');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default ThemeProviderWrapper;
