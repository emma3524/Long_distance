import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage       from './pages/LoginPage';
import CheckInFlow     from './pages/CheckInFlow';
import AdminLayout     from './pages/admin/AdminLayout';
import AdminUsers      from './pages/admin/AdminUsers';
import AdminHistory    from './pages/admin/AdminHistory';
import AdminQuestions  from './pages/admin/AdminQuestions';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={
        <RequireAuth><CheckInFlow /></RequireAuth>
      } />

      <Route path="/admin" element={
        <RequireAdmin><AdminLayout /></RequireAdmin>
      }>
        <Route index                  element={<AdminUsers />} />
        <Route path="history/:userId" element={<AdminHistory />} />
        <Route path="questions"       element={<AdminQuestions />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
