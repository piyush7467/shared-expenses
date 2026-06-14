import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';
import { Menu, X, LayoutDashboard, Wallet, LogOut, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel border-x-0 border-t-0 rounded-none border-b border-themeBorder sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-3 bg-themeSurface/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Side: Brand Logo and Desktop Navigation */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2.5" onClick={() => setIsMobileMenuOpen(false)}>
            <img src={logoImg} alt="MoneyMap Logo" className="w-9 h-9 object-contain" />
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-themeText to-themeTextSecondary">
              Money<span className="text-accentCyan font-medium">Map</span>
            </span>
          </Link>
          
          {user && (
            <div className="hidden md:flex items-center space-x-6 border-l border-themeBorder pl-6">
              <Link 
                to="/" 
                className="text-sm font-semibold text-themeTextSecondary hover:text-themeText transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link 
                to="/personal" 
                className="text-sm font-semibold text-themeTextSecondary hover:text-accentCyan transition-colors flex items-center gap-1.5"
              >
                <Wallet className="w-4 h-4" />
                My Wallet
              </Link>
            </div>
          )}
        </div>

        {/* Right Side: Theme Toggle & User Info / Hamburger (Mobile) */}
        <div className="flex items-center space-x-3">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-themeBorder hover:bg-themeSurfaceVariant transition-all duration-200 cursor-pointer text-themeText hover:border-accentCyan/50"
            title="Toggle Light/Dark Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-themeTextSecondary" />}
          </button>

          {user && (
            <>
              {/* Desktop User Section */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-themeText leading-tight">{user.name}</span>
                  <span className="text-[10px] text-themeTextSecondary leading-none">{user.email}</span>
                </div>
                
                <div className="w-9 h-9 rounded-xl bg-themeSurfaceVariant flex items-center justify-center font-bold text-sm text-accentCyan border border-themeBorder">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className="text-xs font-semibold text-themeTextSecondary hover:text-rose-400 border border-themeBorder hover:border-rose-950/50 px-3 py-1.5 rounded-xl bg-themeSurface/50 hover:bg-rose-950/25 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl border border-themeBorder hover:bg-themeSurfaceVariant text-themeText transition-all duration-200 cursor-pointer"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {user && isMobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-themeBorder/60">
          <div className="flex flex-col space-y-3 pb-3 animate-fade-in">
            
            {/* Nav Links */}
            <Link 
              to="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-themeSurfaceVariant text-sm font-semibold text-themeTextSecondary hover:text-themeText transition-all duration-200 flex items-center gap-3"
            >
              <LayoutDashboard className="w-4 h-4 text-accentCyan" />
              Dashboard
            </Link>
            
            <Link 
              to="/personal" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-themeSurfaceVariant text-sm font-semibold text-themeTextSecondary hover:text-accentCyan transition-all duration-200 flex items-center gap-3"
            >
              <Wallet className="w-4 h-4 text-accentCyan" />
              My Wallet
            </Link>

            {/* Divider */}
            <div className="border-t border-themeBorder/40 my-2"></div>

            {/* Profile Info & Logout */}
            <div className="px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-themeSurfaceVariant flex items-center justify-center font-bold text-base text-accentCyan border border-themeBorder">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-themeText leading-tight">{user.name}</span>
                  <span className="text-xs text-themeTextSecondary">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="px-3">
              <button
                id="mobile-logout-btn"
                onClick={handleLogout}
                className="w-full justify-center text-sm font-semibold text-rose-400 border border-rose-950/40 hover:bg-rose-950/20 py-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
            
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
