import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import supportService from '../../services/supportService';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import { useT } from '../../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const columns = [
  {
    title: 'footer.shop',
    links: [
      { to: '/shop', label: 'footer.allProducts' },
      { to: '/shop?hasDiscount=true', label: 'footer.flashDeals' },
      { to: '/shop?sort=popular', label: 'header.bestSellers' },
      { to: '/shop?sort=newest', label: 'header.newArrivals' },
      { to: '/shop?sort=top-rated', label: 'footer.topRated' },
    ],
  },
  {
    title: 'footer.customerCare',
    links: [
      { to: '/help', label: 'nav.helpCenter' },
      { to: '/orders', label: 'nav.trackOrder' },
      { to: '/shipping-policy', label: 'footer.shippingPolicy' },
      { to: '/returns', label: 'footer.returns' },
      { to: '/contact', label: 'footer.contact' },
    ],
  },
  {
    title: 'footer.myAccount',
    links: [
      { to: '/profile', label: 'nav.profile' },
      { to: '/orders', label: 'footer.orderHistory' },
      { to: '/wishlist', label: 'nav.wishlist' },
      { to: '/cart', label: 'cart.bag' },
      { to: '/login', label: 'footer.signInRegister' },
    ],
  },
  {
    title: 'footer.company',
    links: [
      { to: '/about', label: 'footer.about' },
      { to: '/privacy', label: 'footer.privacy' },
      { to: '/terms', label: 'footer.terms' },
    ],
  },
];

const perks = [
  { icon: '🚚', title: 'footer.perkShipping', text: 'footer.perkShippingText' },
  { icon: '🔄', title: 'footer.perkReturns', text: 'footer.perkReturnsText' },
  { icon: '🛡️', title: 'footer.perkAuthentic', text: 'footer.perkAuthenticText' },
  { icon: '💬', title: 'footer.perkSupport', text: 'footer.perkSupportText' },
];

const Footer = () => {
  const t = useT();
  const { settings, fillShipping } = useSettings();
  const SUPPORT_EMAIL = settings.supportEmail;
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setSubscribing(true);
      const res = await supportService.subscribe(email.trim());
      if (res.success) {
        setCouponCode(res.data.couponCode);
        showToast(res.message, 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="site-footer">
      {/* Perks strip */}
      <div className="footer-perks">
        <div className="container footer-perks-grid">
          {perks.map((p) => (
            <div key={p.title} className="footer-perk">
              <span className="footer-perk-icon">{p.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{t(p.title)}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fillShipping(t(p.text))}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container" style={{ paddingTop: '48px' }}>
        <div className="footer-main">
          {/* Brand + newsletter */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="footer-logo-mark">✦</span>
              <span>ABDULL</span>
            </Link>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '12px 0 18px' }}>
              {t('footer.tagline')}
            </p>

            <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: '8px' }}>
              {t('footer.newsletterTitle')}
            </div>
            {couponCode ? (
              <div className="footer-coupon">
                🎉 {t('footer.yourCode')} <strong>{couponCode}</strong> — {t('footer.applyAtCheckout')}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="footer-newsletter">
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder={t('footer.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label={t('footer.emailPlaceholder')}
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={subscribing}>
                  {subscribing ? '…' : t('footer.subscribe')}
                </button>
              </form>
            )}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              {t('footer.noSpam')} <Link to="/privacy" style={{ textDecoration: 'underline' }}>{t('footer.privacy')}</Link>
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={t(col.title)}>
              <h4 className="footer-col-title">{t(col.title)}</h4>
              <ul className="footer-links">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to}>{t(l.label)}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="footer-payments">
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>{t('footer.weAccept')}</span>
          {['VISA', 'Mastercard', 'Amex', 'Apple Pay', t('checkout.cod')].map((p) => (
            <span key={p} className="footer-payment-chip">{p}</span>
          ))}
          <span style={{ marginInlineStart: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {t('footer.questions')} <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--accent)', fontWeight: 700 }}>{SUPPORT_EMAIL}</a>
          </span>
        </div>

        <div className="footer-bottom">
          <div>© {new Date().getFullYear()} ABDULL Global Commerce. {t('footer.rights')}</div>
          <LanguageSwitcher variant="list" />
          <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
            <Link to="/privacy">{t('footer.privacyShort')}</Link>
            <Link to="/terms">{t('footer.termsShort')}</Link>
            <Link to="/returns">{t('footer.returnsShort')}</Link>
            <Link to="/help">{t('nav.help')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
