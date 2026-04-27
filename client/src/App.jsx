import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Todos from './pages/Todos';
import Emails from './pages/Emails';
import Scale from './pages/Scale';
import Team from './pages/Team';
import InviteAccept from './pages/InviteAccept';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-sm text-gray-400">Loading…</div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireSuperadmin({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'superadmin') return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/invite/:token" element={<InviteAccept />} />
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/todos" element={<RequireAuth><Todos /></RequireAuth>} />
      <Route path="/emails" element={<RequireAuth><Emails /></RequireAuth>} />
      <Route path="/scale" element={<RequireAuth><Scale /></RequireAuth>} />
      <Route path="/team" element={<RequireAuth><RequireSuperadmin><Team /></RequireSuperadmin></RequireAuth>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
