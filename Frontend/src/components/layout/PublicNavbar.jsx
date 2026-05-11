import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Button from '@/components/ui/Button';

const links = [
  { label: 'Services', to: '/services' },
  { label: 'Projects', to: '/projects' },
  { label: 'Articles', to: '/articles' },
  { label: 'Events', to: '/events' },
  { label: 'Contact', to: '/contact' },
];

const PublicNavbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
          AI-Solutions
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  isActive ? 'text-slate-900' : 'text-slate-600'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/contact" className="hidden md:block">
          <Button size="sm">Contact Us</Button>
        </Link>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 md:hidden"
          aria-label="Open navigation menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4" aria-label="Mobile navigation">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-50 ${
                    isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link to="/contact" onClick={() => setOpen(false)} className="mt-2">
              <Button size="sm" className="w-full">
                Contact Us
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
