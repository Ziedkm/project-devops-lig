import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';


// --- Our new imports for the layout ---
import UnifiedLayout from './ui/UnifiedLayout';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import MissionsPage from './pages/MissionsPage';
import SettingsPage from './pages/SettingsPage';

// Admin Panel

import AdminDashboard from './pages/admin/AdminDashboard'; // A placeholder page
import EmployeesPage from './pages/admin/EmployeesPage';
import HistoryPage from './pages/admin/HistoryPage';



// --- Your existing imports for authentication ---
import { LoginPage } from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute'; // Make sure this path is correct
import AdminProtectedRoute from './components/AdminProtectedRoute';

const queryClient = new QueryClient();

// We'll keep the theme from my previous example
const theme = createTheme({
  palette: {
    primary: {
      main: '#5295ffff',
    },
  },
  shape: {
    borderRadius: 8,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
    <QueryClientProvider client={queryClient}>
    
      <CssBaseline />
      <Toaster position="top-center" />
      <BrowserRouter>
       <Routes>
            {/* === PUBLIC ROUTE === */}
            <Route path="/login" element={<LoginPage />} />

            {/* === ADMIN PROTECTED ROUTES === */}
            {/* This parent route applies the guard and layout to all children */}
            <Route
              element={
                <AdminProtectedRoute>
                  <UnifiedLayout />
                </AdminProtectedRoute>
              }
            >
              {/* Children routes are relative to the parent */}
              {/* React Router is smart enough to find the nearest parent without a path */}
              <Route path="/admin" element={<Navigate replace to="/admin/dashboard" />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/employees" element={<EmployeesPage />} />
              <Route path="/admin/history" element={<HistoryPage />} />
              {/* e.g., <Route path="/admin/assignments" element={<AssignmentsPage />} /> */}
            </Route>
            

            {/* === REGULAR USER PROTECTED ROUTES === */}
            {/* This parent route applies the guard and layout to all user children */}
            <Route
              element={
                <ProtectedRoute>
                  <UnifiedLayout />
                </ProtectedRoute>
              }
            >
              {/* The root path "/" should be inside the user section */}
              <Route path="/" element={<Navigate replace to="/dashboard" />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/missions" element={<MissionsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* ... other user routes */}
            </Route>
            
            {/* Optional: Add a 404 Not Found page */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
          </Routes>
        </BrowserRouter>
        
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;