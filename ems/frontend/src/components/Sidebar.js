import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/', icon: '⬛', label: 'Dashboard', exact: true },
  { path: '/employees', icon: '👥', label: 'Employees' },
  { path: '/departments', icon: '🏢', label: 'Departments' },
  { path: '/attendance', icon: '📅', label: 'Attendance' },
  { path: '/leaves', icon: '🌿', label: 'Leave Management' },
  { path: '/tasks', icon: '✅', label: 'Tasks & Performance' },
];

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">⚡</div>
        <div>
          <div className="logo-text">SmartEMS</div>
          <div className="logo-sub">Management System</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="admin-badge">
          <div className="admin-avatar">{admin?.name?.[0]?.toUpperCase() || 'A'}</div>
          <div>
            <div className="admin-name">{admin?.name || 'Admin'}</div>
            <div className="admin-role">Administrator</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">⏻</button>
        </div>
      </div>
    </aside>
  );
}
