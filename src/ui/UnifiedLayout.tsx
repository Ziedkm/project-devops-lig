// src/ui/UnifiedLayout.tsx (Corrected)

import { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
// Make sure you import your corrected sidebar component
import TheSidebar from './Sidebar'; 
import { useRealtime } from '../hooks/useRealtime';

function UnifiedLayout() {
  useRealtime();

  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Mobile backdrop overlay */}
      {isSidebarOpen && (
        <Box
          onClick={handleSidebarToggle}
          sx={{
            display: { xs: 'block', md: 'none' },
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 899,
            opacity: isSidebarOpen ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      )}
      
      <TheSidebar 
        isOpen={isSidebarOpen} 
        onToggle={handleSidebarToggle}
      />
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          bgcolor: '#f9fafb',
          minHeight: '100vh',
          width: '100%',
          // Desktop: Add margin equal to sidebar width
          marginLeft: { 
            xs: 0, 
            md: isSidebarOpen ? '18rem' : '5rem' 
          },
          transition: 'margin-left 0.3s ease-in-out',
        }}
      >
        <Header onOpenSidebar={handleSidebarToggle} />
        <Box sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 },
          width: '100%',
          maxWidth: '100%',
          overflow: 'auto',
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>

  );
}

export default UnifiedLayout;