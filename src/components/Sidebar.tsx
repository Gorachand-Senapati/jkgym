import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserCircle, ShoppingBag, Activity, FileText, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const { currentUser } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Assuming whitelogo.jpeg has a white background (light theme) and darklogo.jpeg has a dark background (dark theme). 
  // If the names imply the color of the logo itself, swap them if necessary.
  const logoSrc = theme === 'light' ? '/whitelogo.jpeg' : '/darklogo.jpeg';

  return (
    <div className="sidebar glass-panel">
      <div className="sidebar-header">
        <img 
          src={logoSrc} 
          alt="JK Multi Gym" 
          className="logo" 
          onClick={toggleTheme}
          style={{ cursor: 'pointer' }}
          title="Click to toggle Light/Dark Mode"
        />
        <h2 className="brand-name">JK MULTI GYM</h2>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/members" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Members</span>
        </NavLink>
        {currentUser?.role === 'owner' && (
          <NavLink to="/employees" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <UserCircle size={20} />
            <span>Employees</span>
          </NavLink>
        )}
        <NavLink to="/billing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CreditCard size={20} />
          <span>Billing & Offers</span>
        </NavLink>
        <NavLink to="/inventory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ShoppingBag size={20} />
          <span>Supplements</span>
        </NavLink>
        <NavLink to="/therapy" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Activity size={20} />
          <span>Therapy Sessions</span>
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileText size={20} />
          <span>Reports</span>
        </NavLink>
      </nav>


    </div>
  );
};
