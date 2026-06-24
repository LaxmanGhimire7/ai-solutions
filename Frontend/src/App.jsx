import { lazy, useEffect, useLayoutEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import PublicNavbar from '@/components/layout/PublicNavbar';
import Footer from '@/components/layout/Footer';
import AdminLayout from '@/components/layout/AdminLayout';
import ChatbotWidget from '@/components/shared/ChatbotWidget';
import RouteBoundary from '@/components/shared/RouteBoundary';
import { useAuth } from '@/hooks/useAuth';
import { routeLoaders, scheduleRoutePreload } from '@/utils/routePreload';

const Home = lazy(routeLoaders['/']);
const Services = lazy(routeLoaders['/services']);
const Projects = lazy(routeLoaders['/projects']);
const Articles = lazy(routeLoaders['/articles']);
const Events = lazy(routeLoaders['/events']);
const Gallery = lazy(routeLoaders['/gallery']);
const Contact = lazy(routeLoaders['/contact']);
const AdminLogin = lazy(routeLoaders['/admin/login']);
const Dashboard = lazy(routeLoaders['/admin/dashboard']);
const ChatSupport = lazy(routeLoaders['/admin/chat']);
const ContentManager = lazy(routeLoaders['/admin/content']);

const publicRoutes = ['/', '/services', '/projects', '/articles', '/events', '/gallery', '/contact'];

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const PublicShell = () => {
  const location = useLocation();

  useEffect(() => scheduleRoutePreload(publicRoutes), []);

  return (
    <div className="public-theme">
      <PublicNavbar />
      <main className="min-h-[calc(100vh-76px)] overflow-x-clip pt-[76px]">
        <RouteBoundary variant="public" resetKey={location.pathname}>
          <Outlet />
        </RouteBoundary>
      </main>
      <ChatbotWidget />
      <Footer />
    </div>
  );
};

const LoginRoute = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <AdminLogin />;
};

const App = () => {
  return (
    <>
      <ScrollToTop />
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

        <Route
          path="/admin/login"
          element={
            <RouteBoundary variant="login" resetKey="admin-login">
              <LoginRoute />
            </RouteBoundary>
          }
        />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="content" element={<ContentManager />} />
          <Route path="chat" element={<ChatSupport />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
