import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import PublicNavbar from '@/components/layout/PublicNavbar';
import Footer from '@/components/layout/Footer';
import AdminLayout from '@/components/layout/AdminLayout';
import ChatbotWidget from '@/components/shared/ChatbotWidget';
import Skeleton from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';

const Home = lazy(() => import('@/pages/Home'));
const Services = lazy(() => import('@/pages/Services'));
const Projects = lazy(() => import('@/pages/Projects'));
const Articles = lazy(() => import('@/pages/Articles'));
const Events = lazy(() => import('@/pages/Events'));
const Gallery = lazy(() => import('@/pages/Gallery'));
const Contact = lazy(() => import('@/pages/Contact'));
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ChatSupport = lazy(() => import('@/pages/ChatSupport'));

const PageFallback = () => (
  <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
    <Skeleton className="h-10 w-64" />
    <Skeleton className="mt-6 h-40 w-full" />
  </div>
);

const PublicShell = () => (
  <>
    <PublicNavbar />
    <main className="pt-16">
      <Outlet />
    </main>
    <ChatbotWidget />
    <Footer />
  </>
);

const LoginRoute = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <AdminLogin />;
};

const App = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<PublicShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/events" element={<Events />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        <Route path="/admin/login" element={<LoginRoute />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="chat" element={<ChatSupport />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
