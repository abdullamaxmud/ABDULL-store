import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import categoryService from '../../services/categoryService';
import productService from '../../services/productService';
import formatCurrency from '../../utils/formatCurrency';
import PromoBanner from '../common/PromoBanner';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import { categoryName, categoryDescription } from '../../i18n/catalog';

const trendingSearches = [
  'iPhone 15 Pro',
  'AirPods',
  'Summer Dress',
  'Nike',
  'Leather Jacket',
  'PlayStation',
  'Vitamin C Serum',
];

const RECENT_SEARCHES_KEY = 'abdull_recent_searches';

const loadRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveRecentSearch = (term) => {
  const list = [term, ...loadRecentSearches().filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 6);
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list));
  } catch {
    // ignore storage failures
  }
  return list;
};

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(loadRecentSearches);

  const searchContainerRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const { settings, loaded: settingsLoaded, localized } = useSettings();

  // Fallback menu until settings arrive (or if the admin removed every link)
  const menuLinks = settings.menuLinks.length
    ? settings.menuLinks
    : settingsLoaded
    ? []
    : [
        { url: '/shop?hasDiscount=true', label: `⚡ ${t('header.flashSale')}`, highlight: true },
        { url: '/shop?sort=newest', label: `✨ ${t('header.newDrops')}` },
        { url: '/shop', label: t('header.allCatalog') },
      ];
  const menuCategories = settings.showCategoriesInMenu ? categories.filter((c) => c.showInMenu !== false) : [];

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch categories for header:', err.message);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change or click outside
  useEffect(() => {
    setShowCategoryMenu(false);
    setShowUserMenu(false);
    setShowSearchSuggestions(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchSuggestions(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) {
        setShowCategoryMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowSearchSuggestions(false);
        setShowCategoryMenu(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Live product suggestions while typing (debounced)
  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setSuggestLoading(false);
      return undefined;
    }
    setSuggestLoading(true);
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await productService.getProducts({ keyword: term, limit: 6, sort: 'popular' });
        if (!cancelled && res.success) setSuggestions(res.data);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setSuggestLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const runSearch = (term) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches(saveRecentSearch(clean));
    navigate(`/shop?keyword=${encodeURIComponent(clean)}`);
    setShowSearchSuggestions(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    runSearch(searchTerm);
  };

  const handleTagClick = (tag) => {
    setSearchTerm(tag);
    runSearch(tag);
  };

  const clearRecentSearches = () => {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
    setRecentSearches([]);
  };

  return (
    <header className="glass-nav" style={{ boxShadow: isScrolled ? 'var(--shadow-md)' : 'none' }}>
      {/* 1. Ultra-Modern Promotional Countdown Ticker */}
      <PromoBanner />

      {/* 2. Main Navigation Bar */}
      <div className="container" style={{ padding: '12px 20px' }}>
        <div className="header-main-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          {/* Brand Logo with Glowing Diamond Icon */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb, #ff1361)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '1.2rem',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              }}
            >
              ✦
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.65rem',
                  fontWeight: 900,
                  letterSpacing: '-0.5px',
                  color: 'var(--text-main)',
                }}
              >
                ABDULL
              </span>
              <span
                className="header-tagline"
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: '#ff1361',
                  marginTop: '2px',
                }}
              >
                HAUTE COMMERCE
              </span>
            </div>
          </Link>

          {/* Smart Search Bar with Interactive Suggestions */}
          <div
            ref={searchContainerRef}
            className="header-search"
            style={{
              flexGrow: 1,
              maxWidth: '560px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <form onSubmit={handleSearchSubmit} style={{ width: '100%', position: 'relative' }}>
              <input
                type="text"
                placeholder={t('header.searchPlaceholder')}
                aria-label={t('header.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSearchSuggestions(true)}
                style={{
                  width: '100%',
                  paddingBlock: '11px',
                  paddingInlineStart: '18px',
                  paddingInlineEnd: '44px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-active)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'var(--transition)',
                  boxShadow: showSearchSuggestions ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  insetInlineEnd: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'var(--primary)',
                  color: 'var(--bg-surface)',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
                title={t('header.search')}
                aria-label={t('header.search')}
              >
                🔍
              </button>
            </form>

            {/* Instant Search Dropdown: live product matches, recent & trending searches */}
            {showSearchSuggestions && (
              <div className="card search-dropdown" role="listbox">
                {searchTerm.trim().length >= 2 ? (
                  <>
                    <div className="search-dropdown-label">
                      {suggestLoading ? t('header.searching') : suggestions.length ? t('header.products') : t('header.noMatch', { term: searchTerm.trim() })}
                    </div>
                    {suggestions.map((p) => {
                      const price = p.discountPrice > 0 && p.discountPrice < p.price ? p.discountPrice : p.price;
                      return (
                        <Link
                          key={p._id}
                          to={`/product/${p._id}`}
                          className="search-suggestion"
                          onClick={() => {
                            setRecentSearches(saveRecentSearch(searchTerm.trim()));
                            setShowSearchSuggestions(false);
                          }}
                        >
                          <img src={p.images?.[0]} alt="" />
                          <div style={{ minWidth: 0, flexGrow: 1 }}>
                            <div className="search-suggestion-name">{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {p.brand}{p.category?.name ? ` · ${p.category.name}` : ''}
                            </div>
                          </div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', whiteSpace: 'nowrap' }}>{formatCurrency(price)}</div>
                        </Link>
                      );
                    })}
                    <button type="button" className="search-see-all" onClick={() => runSearch(searchTerm)}>
                      {t('header.seeAll', { term: searchTerm.trim() })}
                    </button>
                  </>
                ) : (
                  <>
                    {recentSearches.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <div className="search-dropdown-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>🕘 {t('header.recentSearches')}</span>
                          <button type="button" onClick={clearRecentSearches} className="search-clear">{t('common.clear')}</button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {recentSearches.map((tag) => (
                            <button key={tag} type="button" className="search-chip" onClick={() => handleTagClick(tag)}>
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="search-dropdown-label">🔥 {t('header.trendingSearches')}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {trendingSearches.map((tag) => (
                        <button key={tag} type="button" className="search-chip" onClick={() => handleTagClick(tag)}>
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-icon header-theme-btn"
              title={theme === 'dark' ? t('header.lightMode') : t('header.darkMode')}
              aria-label={theme === 'dark' ? t('header.lightMode') : t('header.darkMode')}
              style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="btn-icon header-wishlist"
              style={{ width: '40px', height: '40px', position: 'relative', textDecoration: 'none' }}
              title={t('nav.wishlist')}
              aria-label={t('nav.wishlist')}
            >
              <span style={{ fontSize: '1.15rem' }}>♡</span>
              {wishlistCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    insetInlineEnd: -4,
                    backgroundColor: '#ff1361',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(255, 19, 97, 0.4)',
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Trigger -> Slides open the Cart Drawer! */}
            <button
              onClick={openCart}
              className="btn-icon"
              style={{
                width: '40px',
                height: '40px',
                position: 'relative',
                background: cartCount > 0 ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                borderColor: cartCount > 0 ? 'var(--accent)' : 'var(--border-subtle)',
              }}
              title={t('header.openBag')}
              aria-label={t('header.openBag')}
            >
              <span style={{ fontSize: '1.15rem' }}>🛍️</span>
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    insetInlineEnd: -4,
                    background: 'var(--fire-gradient)',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(255, 8, 68, 0.5)',
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth Options */}
            {isAuthenticated ? (
              <div style={{ position: 'relative' }} ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    padding: '5px 12px 5px 6px',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    color: 'var(--text-main)',
                  }}
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                    alt={user?.name}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                  <span style={{ fontSize: '0.65rem' }}>▼</span>
                </button>

                {showUserMenu && (
                  <div
                    className="card"
                    style={{
                      position: 'absolute',
                      insetInlineEnd: 0,
                      top: '120%',
                      width: '220px',
                      padding: '10px 0',
                      zIndex: 300,
                      boxShadow: 'var(--shadow-xl)',
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 900 }}>{user?.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: 'var(--accent)',
                        }}
                      >
                        ⚡ {t('header.adminDashboard')}
                      </Link>
                    )}

                    <Link
                      to="/orders"
                      style={{
                        display: 'block',
                        padding: '10px 16px',
                        fontSize: '0.88rem',
                        color: 'var(--text-main)',
                        fontWeight: 600,
                      }}
                    >
                      📦 {t('nav.myOrders')}
                    </Link>

                    <Link
                      to="/profile"
                      style={{
                        display: 'block',
                        padding: '10px 16px',
                        fontSize: '0.88rem',
                        color: 'var(--text-main)',
                        fontWeight: 600,
                      }}
                    >
                      👤 {t('nav.profile')}
                    </Link>

                    <Link to="/wishlist" className="user-menu-link">
                      ♡ {t('nav.wishlist')}
                    </Link>

                    <Link to="/help" className="user-menu-link">
                      ❓ {t('nav.helpCenter')}
                    </Link>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 6, paddingTop: 6 }}>
                      <button
                        onClick={logout}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 16px',
                          fontSize: '0.88rem',
                          background: 'none',
                          border: 'none',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          fontWeight: 700,
                        }}
                      >
                        🚪 {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link to="/login" className="btn btn-outline btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
                  {t('nav.signIn')}
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm header-signup" style={{ borderRadius: 'var(--radius-full)' }}>
                  {t('nav.signUp')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 3. Lower Horizontal Category Strip */}
        <div className="category-strip">
        {/* "All Categories" mega menu (kept outside the scroller so it isn't clipped) */}
        <div ref={categoryMenuRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            type="button"
            className={`category-menu-trigger${showCategoryMenu ? ' open' : ''}`}
            aria-expanded={showCategoryMenu}
            aria-haspopup="true"
            onClick={() => setShowCategoryMenu((v) => !v)}
          >
            ☰ {t('header.allCategories')} <span style={{ fontSize: '0.6rem' }}>▼</span>
          </button>

          {showCategoryMenu && (
            <div className="card category-mega-menu">
              <div className="category-mega-grid">
                {categories.map((cat) => (
                  <Link key={cat._id} to={`/shop?category=${cat.slug}`} className="category-mega-item">
                    <img src={cat.image} alt="" />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{categoryName(cat, t)}</div>
                      <div className="category-mega-desc">{categoryDescription(cat, t)}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="category-mega-footer">
                <Link to="/shop?hasDiscount=true" style={{ color: '#ff1361' }}>⚡ {t('header.todaysDeals')}</Link>
                <Link to="/shop?sort=popular">👑 {t('header.bestSellers')}</Link>
                <Link to="/shop?sort=newest">✨ {t('header.newArrivals')}</Link>
                <Link to="/shop" style={{ marginInlineStart: 'auto', color: 'var(--accent)' }}>{t('header.browseEverything')}</Link>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            fontSize: '0.88rem',
            fontWeight: 700,
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}
          className="no-scrollbar"
        >
          {/* Menu links are managed in Admin → Site Settings → Header menu */}
          {menuLinks.map((link, i) => {
            const style = { color: link.highlight ? '#ff1361' : 'var(--text-main)', fontWeight: link.highlight ? 900 : 700 };
            const label = localized(link.label);
            return /^https?:\/\//i.test(link.url) ? (
              <a key={link._id || i} href={link.url} target="_blank" rel="noopener noreferrer" style={style}>
                {label}
              </a>
            ) : (
              <Link key={link._id || i} to={link.url} style={style}>
                {label}
              </Link>
            );
          })}

          {menuCategories.slice(0, 8).map((cat) => (
            <Link
              key={cat._id}
              to={`/shop?category=${cat.slug}`}
              style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--accent)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}
            >
              {categoryName(cat, t)}
            </Link>
          ))}

          {menuCategories.length > 8 && (
            <Link to="/shop" style={{ color: 'var(--accent)', fontWeight: 800 }}>
              {t('header.more')}
            </Link>
          )}
        </div>

        <div className="category-strip-help">
          <Link to="/orders">📦 {t('nav.trackOrder')}</Link>
          <Link to="/help">❓ {t('nav.help')}</Link>
        </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
