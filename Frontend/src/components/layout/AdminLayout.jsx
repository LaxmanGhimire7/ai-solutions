import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '@/hooks/useAuth';

const AdminLayout = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:ml-64 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
