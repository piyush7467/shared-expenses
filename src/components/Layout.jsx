import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="py-6 border-t border-gray-900 bg-gray-950/20 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} MoneyMap. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
