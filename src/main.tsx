// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// --- NOS AJOUTS ---
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ThemeProvider } from '@mui/material/styles'; // Import de MUI
import {theme} from './theme'; // Import du thème de Zied

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* On enveloppe l'app avec le thème ET l'authentification */}
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);