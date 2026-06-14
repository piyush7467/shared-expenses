import React, { createContext, useState, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center p-4 rounded-xl border backdrop-blur-md shadow-lg transform transition-all duration-300 translate-y-0 opacity-100 animate-[slideIn_0.2s_ease-out] ${
              toast.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                : toast.type === 'warning'
                ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                : 'bg-indigo-950/80 border-indigo-800 text-indigo-300'
            }`}
          >
            {/* Status Icons */}
            <span className="text-lg mr-3">
              {toast.type === 'success' && '✨'}
              {toast.type === 'error' && '❌'}
              {toast.type === 'warning' && '⚠️'}
              {toast.type === 'info' && 'ℹ️'}
            </span>
            
            <div className="flex-grow text-sm font-medium pr-2">{toast.message}</div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-200 transition-colors ml-auto text-xs font-bold"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* Slide-in Animation Style */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
