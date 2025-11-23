import type { ReactNode } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText, Paper } from '@mui/material';

const AdminSidebar = () => (
  <Paper 
    elevation={0} 
    square 
    sx={{ 
      width: 240, 
      flexShrink: 0, 
      bgcolor: 'background.paper', 
      borderRight: '1px solid #e0e0e0', 
      height: '100vh' 
    }}
  >
    <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        Admin Panel
      </Typography>
    </Box>
    <List>
      <ListItem disablePadding>
        <ListItemButton component={NavLink} to="/admin/dashboard">
          <ListItemText primary="Dashboard" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton component={NavLink} to="/admin/employees">
          <ListItemText primary="Employees" />
        </ListItemButton>
      </ListItem>
      {/* Add more admin links here in the future */}
    </List>
  </Paper>
);

interface AdminLayoutProps {
    children: ReactNode;
}

function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Box sx={{ display: 'flex' }}>
      <AdminSidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* Render the page content that is passed in */}   
        <Outlet /> {/* <-- MUST BE PRESENT */}
        {children}
      </Box>
    </Box>
  );
}

export default AdminLayout;