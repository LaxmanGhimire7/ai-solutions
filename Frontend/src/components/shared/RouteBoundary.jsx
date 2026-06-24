import { Component, Suspense } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const loadingStyles = {
  public: 'min-h-[58vh] bg-black',
  admin: 'min-h-[calc(100vh-64px)] bg-[#020706]',
  login: 'min-h-screen bg-[#020706]',
};

export const RouteLoading = ({ variant = 'public' }) => (
  <div
    className={`flex items-center justify-center px-6 py-20 ${loadingStyles[variant] || loadingStyles.public}`}
    role="status"
    aria-live="polite"
    aria-label="Loading page"
  >
    <div className="w-full max-w-lg">
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="route-loading-bar h-full w-1/3 rounded-full bg-[#E95520]" />
      </div>
      <p className="mt-4 text-center text-sm font-medium text-[#A89D96]">Loading workspace...</p>
    </div>
  </div>
);

class RouteErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Route rendering failed:', error, info);
  }

  render() {
    const { children, variant = 'public' } = this.props;
    const { error } = this.state;

    if (!error) return children;

    const isAdmin = variant === 'admin';

    return (
      <div
        className={`flex items-center justify-center px-6 py-20 ${
          isAdmin ? 'min-h-[calc(100vh-64px)] bg-[#020706]' : 'min-h-[58vh] bg-black'
        }`}
      >
        <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0B0B0B] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E95520]/12 text-[#F37A49]">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-xl font-semibold text-[#F5ECE6]">This page could not be displayed</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#A89D96]">
            A temporary browser or network error interrupted the page. Your saved data has not been changed.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E95520] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#C94316]"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Reload Page
            </button>
            <a
              href={isAdmin ? '/admin/dashboard' : '/'}
              className="inline-flex items-center justify-center rounded-lg border border-white/15 px-5 py-2.5 text-sm font-semibold text-[#E8DFD9] transition-colors hover:border-[#E95520]/45 hover:text-[#F37A49]"
            >
              {isAdmin ? 'Return to Dashboard' : 'Return Home'}
            </a>
          </div>
        </div>
      </div>
    );
  }
}

const RouteBoundary = ({ children, variant = 'public', resetKey, suspense = true }) => (
  <RouteErrorBoundary key={resetKey} variant={variant}>
    {suspense ? <Suspense fallback={<RouteLoading variant={variant} />}>{children}</Suspense> : children}
  </RouteErrorBoundary>
);

export default RouteBoundary;
