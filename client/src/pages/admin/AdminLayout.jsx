import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { logout } = useAuth();
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <span className="admin-brand">💗 Admin</span>
        <button className="logout-link" onClick={logout}>Sign out</button>
      </header>
      <main className="admin-main">
        <nav className="admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
            Users
          </NavLink>
          <NavLink to="/admin/questions" className={({ isActive }) => isActive ? 'active' : ''}>
            Daily Questions
          </NavLink>
        </nav>
        <Outlet />
      </main>
    </div>
  );
}
