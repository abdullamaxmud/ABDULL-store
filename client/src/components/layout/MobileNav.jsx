import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useT } from '../../context/LanguageContext';

const MobileNav = () => {
  const { cartCount, openCart } = useCart();
  const { isAuthenticated } = useAuth();
  const t = useT();

  const navItemStyle = ({ isActive }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    color: isActive ? '#ff1361' : 'var(--text-muted)',
    fontSize: '0.72rem',
    fontWeight: 800,
    textDecoration: 'none',
    position: 'relative',
    flexGrow: 1,
    height: '100%',
    transition: 'all 0.2s ease',
  });

  return (
    <nav className="mobile-nav-bar" aria-label={t('nav.mobileNav')}>
      <NavLink to="/" style={navItemStyle}>
        <span style={{ fontSize: '1.25rem' }}>🏠</span>
        <span>{t('nav.home')}</span>
      </NavLink>

      <NavLink to="/shop" style={navItemStyle}>
        <span style={{ fontSize: '1.25rem' }}>🏷️</span>
        <span>{t('nav.catalog')}</span>
      </NavLink>

      <NavLink to="/wishlist" style={navItemStyle}>
        <span style={{ fontSize: '1.25rem' }}>♡</span>
        <span>{t('nav.wishlist')}</span>
      </NavLink>

      {/* Cart button opens the Slide-Over Cart Drawer! */}
      <button
        onClick={openCart}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          color: cartCount > 0 ? '#ff1361' : 'var(--text-muted)',
          fontSize: '0.72rem',
          fontWeight: 800,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          flexGrow: 1,
          height: '100%',
        }}
        title={t('header.openBag')}
        aria-label={t('header.openBag')}
      >
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <span style={{ fontSize: '1.25rem' }}>🛍️</span>
          {cartCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -6,
                insetInlineEnd: -8,
                background: 'var(--fire-gradient)',
                color: '#ffffff',
                fontSize: '0.62rem',
                fontWeight: 900,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(255, 8, 68, 0.4)',
              }}
            >
              {cartCount}
            </span>
          )}
        </div>
        <span>{t('nav.bag')}</span>
      </button>

      <NavLink to={isAuthenticated ? '/profile' : '/login'} style={navItemStyle}>
        <span style={{ fontSize: '1.25rem' }}>👤</span>
        <span>{isAuthenticated ? t('nav.account') : t('nav.signIn')}</span>
      </NavLink>
    </nav>
  );
};

export default MobileNav;
