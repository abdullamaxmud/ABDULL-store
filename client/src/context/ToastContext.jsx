import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Floating Animated Toast Container */}
      <div
        style={{
          position: 'fixed',
          top: 24,
          insetInlineEnd: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          let bg = 'var(--primary)';
          let color = '#ffffff';
          let border = 'transparent';

          if (toast.type === 'success') {
            bg = '#10b981';
          } else if (toast.type === 'error') {
            bg = '#ef4444';
          } else if (toast.type === 'warning') {
            bg = '#f59e0b';
          }

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                backgroundColor: bg,
                color,
                padding: '12px 20px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.2)',
                fontSize: '0.92rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                minWidth: '280px',
                maxWidth: '420px',
                animation: 'fadeIn 0.25s ease-out forwards',
                cursor: 'pointer',
              }}
              onClick={() => removeToast(toast.id)}
            >
              <span style={{ flexGrow: 1 }}>{toast.message}</span>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  opacity: 0.8,
                }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
