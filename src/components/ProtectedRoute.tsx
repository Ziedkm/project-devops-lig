// src/components/ProtectedRoute.tsx
import React, { type ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material'; // Utilisons MUI pour le chargement

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, session } = useAuth();
  const location = useLocation();

  // On considère que l'authentification est en cours tant que la session n'a pas été vérifiée
  // (la session est 'undefined' au tout début, puis devient 'null' ou un objet)
  if (session === undefined) { 
    // Affiche un état de chargement global pendant que Supabase vérifie la session
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    // Si l'utilisateur n'est pas connecté, redirige vers la page de connexion
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si l'utilisateur est connecté, affiche le contenu protégé
  return <>{children}</>;
};

export default ProtectedRoute;