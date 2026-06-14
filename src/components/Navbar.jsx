import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel border-x-0 border-t-0 rounded-none border-b border-themeBorder sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-3 bg-themeSurface/85">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2.5">
            {/* Logo Image */}
            <img src={logoImg} alt="MoneyMap Logo" className="w-9 h-9 object-contain" />
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-themeText to-themeTextSecondary">
              Money<span className="text-accentCyan font-medium">Map</span>
            </span>
          </Link>
          {user && (
            <div className="hidden sm:flex items-center space-x-4 border-l border-themeBorder pl-6">
              <Link to="/" className="text-sm font-semibold text-themeTextSecondary hover:text-themeText transition-colors">
                Dashboard
              </Link>
              <Link to="/personal" className="text-sm font-semibold text-themeTextSecondary hover:text-accentCyan transition-colors">
                My Wallet
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="text-sm p-1.5 rounded-lg border border-themeBorder hover:bg-themeSurfaceVariant transition-all duration-200 cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-themeText">{user.name}</span>
                <span className="text-xs text-themeTextSecondary">{user.email}</span>
              </div>
              
              <div className="w-9 h-9 rounded-full bg-themeSurfaceVariant flex items-center justify-center font-bold text-sm text-accentCyan border border-themeBorder">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <button
                id="logout-btn"
                onClick={handleLogout}
                className="text-xs font-semibold text-themeTextSecondary hover:text-rose-400 border border-themeBorder hover:border-rose-950 px-3 py-1.5 rounded-lg bg-themeSurface/50 hover:bg-rose-950/25 transition-all duration-200 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
