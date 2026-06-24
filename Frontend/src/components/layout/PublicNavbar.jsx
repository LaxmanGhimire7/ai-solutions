import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { preloadRoute } from '@/utils/routePreload';

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
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          onPointerEnter={() => preloadRoute('/')}
          onFocus={() => preloadRoute('/')}
          className="flex items-center gap-3 font-semibold text-[#F5ECE6] focus:outline-none focus:ring-2 focus:ring-[#E95520]/30"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E95520] text-sm font-semibold text-white">
            AI
          </span>
          <span className="text-base">AI-Solutions</span>
        </Link>

        <nav className="hidden items-center rounded-lg border border-white/15 bg-[#111111] p-1 md:flex" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onPointerEnter={() => preloadRoute(link.to)}
              onFocus={() => preloadRoute(link.to)}
              className={({ isActive }) =>
                `rounded-md px-4 py-2.5 text-sm font-medium transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-[#E95520]/20 ${
                  isActive ? 'bg-[#E95520] text-white' : 'text-[#A89D96]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/contact"
          onPointerEnter={() => preloadRoute('/contact')}
          onFocus={() => preloadRoute('/contact')}
          className="hidden md:block"
        >
          <Button size="sm">
            Request Callback
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>

        <button
          type="button"
          className="rounded-lg border border-white/15 bg-[#111111] p-2 text-[#F5ECE6] transition-colors hover:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#E95520]/20 md:hidden"
          aria-label="Open navigation menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-black shadow-2xl md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4" aria-label="Mobile navigation">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                onPointerEnter={() => preloadRoute(link.to)}
                onFocus={() => preloadRoute(link.to)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                    isActive ? 'bg-[#E95520] text-white' : 'text-[#C8BDB6] hover:bg-white/[0.06]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link to="/contact" onClick={() => setOpen(false)} className="mt-2">
              <Button size="sm" className="w-full">Request Callback</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
