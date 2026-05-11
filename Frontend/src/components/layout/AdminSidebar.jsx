import { NavLink } from 'react-router-dom';
import { BarChart3, Inbox, LogOut, MessageSquare, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const items = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: BarChart3 },
  { label: 'Inquiries', to: '/admin/dashboard', icon: Inbox },
  { label: 'Chat Support', to: '/admin/chat', icon: MessageSquare },
  { label: 'Settings', to: '/admin/dashboard', icon: Settings },
];

const AdminSidebar = () => {
  const { admin, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-slate-100 bg-white lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="font-semibold text-slate-900">AI-Solutions</div>
          <div className="mt-1 text-xs text-slate-400">Admin Panel</div>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6" aria-label="Admin navigation">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-sm font-medium text-slate-900">{admin?.name || 'Admin'}</div>
            <button
              type="button"
              onClick={logout}
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
