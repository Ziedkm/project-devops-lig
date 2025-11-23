import { Outlet } from 'react-router-dom';
import AdminLayout from '../ui/AdminLayout';
import AdminProtectedRoute from './AdminProtectedRoute';

// This component combines the guard and the layout into one logical unit.
function AdminRoutes() {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        {/* The Outlet here is for nested admin routes, IF you ever have them */}
        <Outlet /> 
      </AdminLayout>
    </AdminProtectedRoute>
  );
}

export default AdminRoutes;