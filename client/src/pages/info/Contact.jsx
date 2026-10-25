import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import supportService from '../../services/supportService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import { useT } from '../../context/LanguageContext';

// Values are stored in English (the server's enum); labels are translated
const topics = ['Order Issue', 'Returns & Refunds', 'Shipping', 'Product Question', 'Partnership', 'Other'];

const Contact = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const t = useT();
  const { settings } = useSettings();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    topic: 'Order Issue',
    orderNumber: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = `${t('footer.contact')} — ABDULL`;
    window.scrollTo(0, 0);
    return () => {
      document.title = t('meta.defaultTitle');
    };
  }, [t]);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.name, email: f.email || user.email }));
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.message.trim().length < 10) {
      setError(t('contact.tooShort'));
      return;
    }
    try {
      setSending(true);
      const res = await supportService.sendContactMessage(form);
      if (res.success) {
        setSent(true);
        showToast(t('contact.sentToast'), 'success');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <MainLayout>
      <div className="info-hero">
        <div className="container">
          <div className="info-breadcrumb">
            <Link to="/">{t('nav.home')}</Link> <span>/</span> <span>{t('footer.contact')}</span>
          </div>
          <span className="info-eyebrow">{t('footer.customerCare')}</span>
          <h1 className="info-title">{t('footer.contact')}</h1>
          <p className="info-intro">{t('contact.intro')}</p>
        </div>
      </div>

      <div className="container contact-layout">
        <div className="card" style={{ padding: '28px' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
              <h2 style={{ marginBottom: '8px' }}>{t('contact.received')}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '22px' }}>
                {t('contact.thanks', { name: form.name.split(' ')[0] || '' })} <strong>{form.email}</strong>
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/help" className="btn btn-outline btn-sm">{t('contact.browseHelp')}</Link>
                <Link to="/shop" className="btn btn-primary btn-sm">{t('cart.continueShopping')}</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '18px' }}>{t('contact.sendTitle')}</h2>

              {error && <div className="form-error">⚠️ {error}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label" htmlFor="c-name">{t('contact.name')} *</label>
                  <input id="c-name" name="name" required maxLength={80} className="input-field" value={form.name} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="c-email">{t('auth.email')} *</label>
                  <input id="c-email" type="email" name="email" required maxLength={100} className="input-field" value={form.email} onChange={handleChange} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label" htmlFor="c-topic">{t('contact.topic')}</label>
                  <select id="c-topic" name="topic" className="input-field" value={form.topic} onChange={handleChange}>
                    {topics.map((topic) => (
                      <option key={topic} value={topic}>{t(`contact.topics.${topic}`)}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="c-order">{t('contact.orderNumber')}</label>
                  <input id="c-order" name="orderNumber" maxLength={40} className="input-field" placeholder={t('contact.orderPlaceholder')} value={form.orderNumber} onChange={handleChange} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="c-message">{t('contact.message')} *</label>
                <textarea id="c-message" name="message" required rows={6} maxLength={2000} className="input-field" placeholder={t('contact.messagePlaceholder')} value={form.message} onChange={handleChange} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'flex-end', direction: 'ltr' }}>{form.message.length}/2000</span>
              </div>

              <button type="submit" className="btn btn-primary" disabled={sending} style={{ width: '100%' }}>
                {sending ? t('contact.sending') : t('contact.send')}
              </button>
            </form>
          )}
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card contact-channel">
            <span className="help-quick-icon">✉️</span>
            <div>
              <div style={{ fontWeight: 800 }}>{t('contact.emailTitle')}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{settings.supportEmail}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('contact.emailText')}</div>
            </div>
          </div>
          <div className="card contact-channel">
            <span className="help-quick-icon">📦</span>
            <div>
              <div style={{ fontWeight: 800 }}>{t('contact.orderHelp')}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>{t('contact.orderHelpText')}</div>
              <Link to="/orders" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.88rem' }}>{t('contact.goToOrders')}</Link>
            </div>
          </div>
          <div className="card contact-channel">
            <span className="help-quick-icon">❓</span>
            <div>
              <div style={{ fontWeight: 800 }}>{t('contact.quickAnswers')}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>{t('contact.quickAnswersText')}</div>
              <Link to="/help" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.88rem' }}>{t('contact.visitHelp')}</Link>
            </div>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
};

export default Contact;
