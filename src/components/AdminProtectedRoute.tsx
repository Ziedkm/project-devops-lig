import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useUser } from '../hooks/useUser';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { isLoading, isAuthenticated, role } = useUser();

  // 1. While the hook is fetching, show a loading spinner.
  // This is the most important state.
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 2. After loading, if the user is authenticated AND has the admin role, show the page.
  if (isAuthenticated && role === 'admin') {
    return <>{children}</>;
  }

  // 3. In ALL other cases (not authenticated, or not an admin), redirect.
  // This is the safe default.
  return <Navigate to="/login" replace />;
}

export default AdminProtectedRoute;