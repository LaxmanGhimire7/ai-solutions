import { Link, NavLink } from 'react-router-dom';
import { BarChart3, ExternalLink, FileText, HelpCircle, LogOut, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const items = [
  { label: 'Analytics', to: '/admin/dashboard', icon: BarChart3 },
  { label: 'Content', to: '/admin/content', icon: FileText },
  { label: 'Support', to: '/admin/chat', icon: HelpCircle },
];

const AdminSidebar = () => {
  const { admin, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-white/10 bg-black lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-6 py-6">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E95520] text-sm font-semibold text-white">
              AI
            </span>
            <div>
              <div className="font-semibold text-[#F5ECE6]">AI-Solutions</div>
              <div className="mt-0.5 text-xs text-[#746C67]">Admin workspace</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6" aria-label="Admin navigation">
          <p className="px-4 pb-2 text-xs font-semibold uppercase text-[#675F5A]">Workspace</p>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-xl border px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#E95520]/20 ${
                    isActive
                      ? 'border-[#E95520]/30 bg-[#E95520]/12 text-[#F37A49]'
                      : 'border-transparent text-[#948983] hover:border-white/10 hover:bg-white/[0.04] hover:text-white'
                  }`
                }
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
          <Link
            to="/"
            className="flex items-center gap-4 rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-[#948983] transition-colors hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
          >
            <ExternalLink className="h-5 w-5" aria-hidden="true" />
            Public Website
          </Link>
        </nav>

        <div className="space-y-5 px-5 pb-6">
          <Link
            to="/contact"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E95520] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#C94316]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Request
          </Link>

          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E95520]/25 bg-[#E95520]/10 text-sm font-semibold text-[#F37A49]">
                {admin?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-[#F5ECE6]">{admin?.name || 'Admin User'}</div>
                <div className="truncate text-xs text-[#746C67]">{admin?.email || 'Administrator'}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-sm font-medium text-[#948983] transition-colors hover:bg-white/[0.07] hover:text-white"
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
