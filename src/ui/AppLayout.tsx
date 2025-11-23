import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

function AppLayout() {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* The Sidebar is always visible on larger screens and stary on sceen when scrolling */}
      <Sidebar isOpen={false} onToggle={function (): void {
        throw new Error('Function not implemented.');
      } } />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          bgcolor: '#f4f6f8', // A light grey background
          p: 3, 
          overflow: 'auto' 
        }}
      >
        <Header />
        {/* The Outlet is where the routed pages (Dashboard, Calendar, etc.) will be rendered */}
        <Outlet />
      </Box>
    </Box>
  );
}

export default AppLayout;