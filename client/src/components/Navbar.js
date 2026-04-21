import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const NAV_ITEMS = [
  { to: '/dashboard',      icon: '▣', label: 'Dashboard' },
  { to: '/dsa',            icon: '{ }', label: 'DSA Practice' },
  { to: '/mock-interview', icon: '◈', label: 'Mock Interview' },
  { to: '/companies',      icon: '◎', label: 'Company Prep' },
  { to: '/resume',         icon: '▤', label: 'Resume Builder' },
  { to: '/profile',        icon: '◉', label: 'Profile' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <span className="logo-bracket">&lt;</span>
          <span className="logo-text">IP</span>
          <span className="logo-bracket">/&gt;</span>
        </div>
        {!collapsed && (
          <div className="logo-name">
            <span className="logo-title">Interview</span>
            <span className="logo-subtitle">Prep Platform</span>
          </div>
        )}
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* User quick info */}
      {!collapsed && user && (
        <div className="sidebar-user">
          <div className="user-avatar">
            {user.full_name ? user.full_name[0].toUpperCase() : user.username[0].toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name">{user.full_name || user.username}</span>
            <span className="user-role">{user.target_role || 'Software Engineer'}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-label">{!collapsed && 'NAVIGATION'}</div>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label-text">{item.label}</span>}
            {!collapsed && <span className="nav-arrow">›</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom logout */}
      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={handleLogout} title={collapsed ? 'Logout' : ''}>
          <span className="nav-icon">⏻</span>
          {!collapsed && <span className="nav-label-text">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
