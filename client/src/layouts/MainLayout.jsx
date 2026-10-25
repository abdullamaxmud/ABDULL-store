import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MobileNav from '../components/layout/MobileNav';
import CartDrawer from '../components/cart/CartDrawer';

const MainLayout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flexGrow: 1 }}>{children}</main>
      <Footer />
      <MobileNav />
      {/* Global Slide-Over Cart Drawer */}
      <CartDrawer />
    </div>
  );
};

export default MainLayout;
