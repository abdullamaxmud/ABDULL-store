import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LanguageProvider>
        <SettingsProvider>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <CartProvider>
                  <WishlistProvider>
                    <AppRoutes />
                  </WishlistProvider>
                </CartProvider>
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </SettingsProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
