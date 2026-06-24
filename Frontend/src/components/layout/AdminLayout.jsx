import { useEffect } from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '@/hooks/useAuth';
import { connectAdmin, disconnectSocket, joinAdmin } from '@/api/chat';

const AdminLayout = () => {
  const { isAuthenticated, logout, token } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !token) return undefined;

    const socket = connectAdmin(token);
    const handleConnect = () => joinAdmin(token).catch(() => {});
    socket.on('connect', handleConnect);
    if (socket.connected) handleConnect();

    return () => {
      socket.off('connect', handleConnect);
      disconnectSocket();
    };
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-theme min-h-screen bg-slate-50">
      <AdminSidebar />
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#020706]/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:hidden">
        <div className="flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-2 font-semibold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E95520] text-sm text-white">
              AI
            </span>
            Admin
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-slate-400 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#E95520]/20"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>
      <main className="min-h-screen lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
