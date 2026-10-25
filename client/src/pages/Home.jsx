import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import MainLayout from '../layouts/MainLayout';
import HeroSlider from '../components/home/HeroSlider';
import CategoryStories from '../components/home/CategoryStories';
import formatCurrency from '../utils/formatCurrency';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import supportService from '../services/supportService';
import RecentlyViewed from '../components/product/RecentlyViewed';
import MoreToLove from '../components/home/MoreToLove';
import { useT } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import useFlashCountdown from '../utils/useFlashCountdown';
import { categoryName } from '../i18n/catalog';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flashTab, setFlashTab] = useState('all');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');

  const { addToCart } = useCart();
  const { showToast } = useToast();
  const t = useT();
  const { fillShipping } = useSettings();

  // Live ticking countdown for Flash Sale section
  // Real countdown to the end date set in Admin → Site Settings (hidden when none is set)
  const saleTime = useFlashCountdown();

  const formatPad = (num) => String(num).padStart(2, '0');

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [featuredRes, dealsRes, trendingRes, catsRes] = await Promise.all([
          productService.getFeatured(),
          productService.getDeals(),
          productService.getTrending(),
          categoryService.getCategories(),
        ]);

        if (featuredRes.success) setFeaturedProducts(featuredRes.data);
        if (dealsRes.success) setFlashDeals(dealsRes.data);
        if (trendingRes.success) setTrendingProducts(trendingRes.data);
        if (catsRes.success) setCategories(catsRes.data);
      } catch (err) {
        console.error('Error loading homepage feeds:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    try {
      const res = await supportService.subscribe(newsletterEmail.trim());
      if (res.success) setCouponCode(res.data.couponCode);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const spotlightItem = flashDeals[0] || trendingProducts[0];

  return (
    <MainLayout>
      {/* 1. Shein-Style Category Stories Bubbles (High-Converting Top Strip) */}
      <CategoryStories categories={categories} />

      {/* 2. Cyber-Editorial Hero Slider Carousel */}
      <HeroSlider />

      {/* 3. Luxury Trust & Value Proposition Strip */}
      <section
        style={{
          padding: '24px 0',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--accent-light)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  flexShrink: 0,
                }}
              >
                🚀
              </div>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {t('home.perkShipping')}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {fillShipping(t('home.perkShippingText'))}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--success-light)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  flexShrink: 0,
                }}
              >
                💵
              </div>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {t('checkout.cod')}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {t('home.perkCodText')}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--danger-light)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  flexShrink: 0,
                }}
              >
                🛡️
              </div>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {t('footer.perkAuthentic')}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {t('home.perkAuthenticText')}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--warning-light)',
                  color: 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  flexShrink: 0,
                }}
              >
                🔄
              </div>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {t('home.perkReturns')}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {t('home.perkReturnsText')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Ultra-Modern Flash Sale Section with Live Countdown Timer */}
      <section style={{ padding: '60px 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          {/* Header Row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span
                  style={{
                    background: 'var(--fire-gradient)',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    letterSpacing: '0.5px',
                    boxShadow: '0 2px 10px rgba(255, 8, 68, 0.35)',
                  }}
                >
                  ⚡ {t('home.limitedFlash')}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--danger)' }}>
                  🔥 {t('home.stockClaimed')}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.5px',
                    color: 'var(--text-main)',
                  }}
                >
                  {t('home.lightningDeals')}
                </h2>

                {/* Live Countdown Box */}
                {saleTime.active && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                    {t('promo.endsIn')}
                  </span>
                  <span style={{ fontWeight: 900, color: '#ff1361', fontSize: '0.9rem' }}>
                    {formatPad(saleTime.hours)}h : {formatPad(saleTime.minutes)}m : {formatPad(saleTime.seconds)}s
                  </span>
                </div>
                )}
              </div>
            </div>

            <Link
              to="/shop?hasDiscount=true"
              className="btn btn-outline btn-sm"
              style={{ borderRadius: 'var(--radius-full)', fontWeight: 800 }}
            >
              {t('home.viewAllDeals', { count: flashDeals.length })}
            </Link>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : flashDeals.slice(0, 8).map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        </div>
      </section>

      {/* 5. Deal Spotlight Interactive Banner */}
      {spotlightItem && (
        <section
          style={{
            padding: '60px 0',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div className="container">
            <div
              className="card"
              style={{
                padding: '40px',
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(255, 19, 97, 0.08) 100%), var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-active)',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  alignItems: 'center',
                  gap: '40px',
                }}
              >
                {/* Visual */}
                <div style={{ position: 'relative' }}>
                  <img
                    src={spotlightItem.images?.[0] || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=700&q=80'}
                    alt={spotlightItem.name}
                    style={{
                      width: '100%',
                      maxHeight: '340px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      background: 'var(--fire-gradient)',
                      color: '#ffffff',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 900,
                      fontSize: '0.82rem',
                    }}
                  >
                    ⭐ {t('home.spotlight')}
                  </div>
                </div>

                {/* Details */}
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)' }}>
                    {spotlightItem.brand || 'ABDULL Signature'}
                  </span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                      fontWeight: 900,
                      color: 'var(--text-main)',
                      lineHeight: 1.2,
                      margin: '8px 0 16px 0',
                    }}
                  >
                    {spotlightItem.name}
                  </h3>
                  <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                    {spotlightItem.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '24px' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: '#ff1361' }}>
                      {formatCurrency(spotlightItem.discountPrice > 0 ? spotlightItem.discountPrice : spotlightItem.price)}
                    </span>
                    {spotlightItem.discountPrice > 0 && (
                      <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        {formatCurrency(spotlightItem.price)}
                      </span>
                    )}
                    <span
                      style={{
                        backgroundColor: 'var(--success-light)',
                        color: 'var(--success)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                      }}
                    >
                      ● {t('product.inStockReady')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                    <button
                      onClick={() => addToCart(spotlightItem, 1)}
                      className="btn btn-flash"
                      style={{ padding: '14px 32px', borderRadius: 'var(--radius-full)', fontSize: '0.98rem' }}
                    >
                      ⚡ {t('home.oneClickAdd')}
                    </button>
                    <Link
                      to={`/product/${spotlightItem._id}`}
                      className="btn btn-outline"
                      style={{ padding: '14px 28px', borderRadius: 'var(--radius-full)' }}
                    >
                      {t('home.viewSpecs')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. Browse by Category Hub */}
      <section id="categories" style={{ padding: '60px 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px auto' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)' }}>
              {t('home.exploreCatalogs')}
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2.2rem',
                fontWeight: 900,
                color: 'var(--text-main)',
                letterSpacing: '-0.5px',
                margin: '6px 0 10px 0',
              }}
            >
              {t('home.shopByDepartment')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {t('home.departmentText')}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}
          >
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/shop?category=${cat.slug}`}
                className="card"
                style={{
                  padding: '24px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  borderRadius: 'var(--radius-xl)',
                }}
              >
                <div
                  style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '50%',
                    padding: '3px',
                    background: 'linear-gradient(135deg, var(--border-subtle), var(--accent))',
                    marginBottom: '16px',
                  }}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--bg-surface)',
                    }}
                  />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {categoryName(cat, t)}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700 }}>
                  {t('home.exploreDept')}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Trending Marketplace Best Sellers */}
      <section style={{ padding: '60px 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '32px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.4rem' }}>👑</span>
                <span className="badge badge-accent">{t('home.topRatedWorldwide')}</span>
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '2rem',
                  fontWeight: 900,
                  color: 'var(--text-main)',
                  letterSpacing: '-0.5px',
                }}
              >
                {t('home.bestSellersTitle')}
              </h2>
            </div>
            <Link
              to="/shop?sort=popular"
              className="btn btn-outline btn-sm"
              style={{ borderRadius: 'var(--radius-full)', fontWeight: 800 }}
            >
              {t('home.seeAllBestSellers')}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : trendingProducts.slice(0, 8).map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        </div>
      </section>

      {/* 7b. Recently viewed (only renders when the shopper has history) */}
      <RecentlyViewed />

      {/* 7c. "More to Love" endless discovery feed */}
      <MoreToLove />

      {/* 8. VIP Club / Newsletter Incentive Banner (Shein style coupon drop) */}
      <section
        style={{
          padding: '60px 0',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div
            className="card"
            style={{
              padding: '48px 32px',
              textAlign: 'center',
              maxWidth: '760px',
              margin: '0 auto',
              background: 'linear-gradient(135deg, rgba(255, 19, 97, 0.06), rgba(37, 99, 235, 0.06)), var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-active)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <span
              style={{
                background: 'var(--fire-gradient)',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 900,
                letterSpacing: '0.5px',
                display: 'inline-block',
                marginBottom: '14px',
              }}
            >
              🎁 {t('home.vipReward')}
            </span>

            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                fontWeight: 900,
                color: 'var(--text-main)',
                lineHeight: 1.15,
                marginBottom: '12px',
              }}
            >
              {t('home.vipTitle')}
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '520px', margin: '0 auto 28px auto' }}>
              {t('home.vipText')}
            </p>

            {couponCode ? (
              <div
                style={{
                  backgroundColor: 'var(--success-light)',
                  border: '1px solid var(--success)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>🎉</span>
                <span style={{ color: 'var(--success)', fontWeight: 800, fontSize: '1.1rem' }}>
                  {t('home.usePromoBefore')} <strong>{couponCode}</strong> {t('home.usePromoAfter')}
                </span>
              </div>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                style={{
                  display: 'flex',
                  maxWidth: '460px',
                  margin: '0 auto',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <input
                  type="email"
                  required
                  placeholder={t('home.emailPlaceholder')}
                  aria-label={t('home.emailPlaceholder')}
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  style={{
                    flexGrow: 1,
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-active)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-flash"
                  style={{
                    padding: '14px 28px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 800,
                  }}
                >
                  {t('home.claim')}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
