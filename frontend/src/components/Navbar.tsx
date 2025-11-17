import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <span className="navbar-logo-text">F1</span>
          <span className="navbar-title">F1 Data Management System</span>
        </Link>

        <div className="navbar-links">
          <Link
            to="/dashboard"
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link
            to="/views"
            className={`nav-link ${isActive('/views') ? 'active' : ''}`}
          >
            Data Views
          </Link>
          <Link
            to="/crud"
            className={`nav-link ${isActive('/crud') ? 'active' : ''}`}
          >
            Data Management
          </Link>
          <Link
            to="/analytics"
            className={`nav-link ${isActive('/analytics') ? 'active' : ''}`}
          >
            Analytics
          </Link>
          <Link
            to="/export"
            className={`nav-link ${isActive('/export') ? 'active' : ''}`}
          >
            Data Export
          </Link>
          <Link
            to="/external-apis"
            className={`nav-link ${isActive('/external-apis') ? 'active' : ''}`}
          >
            External APIs
          </Link>
        </div>
      </div>

      <div className="navbar-auth">
        <div className="user-info">
          <span className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</span>
          <div className="user-details">
            <p className="username">{user?.username}</p>
            <p className="user-role">{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="nav-button">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;