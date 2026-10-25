import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { getSiteContent } from '../../data/siteContent';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';

const quickLinks = [
  { icon: '📦', title: 'help.trackTitle', text: 'help.trackText', to: '/orders' },
  { icon: '🔄', title: 'help.returnTitle', text: 'help.returnText', to: '/returns' },
  { icon: '🚚', title: 'help.shippingTitle', text: 'help.shippingText', to: '/shipping-policy' },
  { icon: '💬', title: 'help.contactTitle', text: 'help.contactText', to: '/contact' },
];

const HelpCenter = () => {
  const { t, lang } = useLanguage();
  const { fillShipping } = useSettings();
  const { faqGroups } = getSiteContent(lang);
  const [query, setQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('all');
  const [openItem, setOpenItem] = useState(null);

  useEffect(() => {
    document.title = `${t('nav.helpCenter')} — ABDULL`;
    window.scrollTo(0, 0);
    return () => {
      document.title = t('meta.defaultTitle');
    };
  }, [t]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqGroups
      .filter((g) => activeGroup === 'all' || g.id === activeGroup)
      .map((g) => ({
        ...g,
        items: q ? g.items.filter((it) => `${it.q} ${it.a}`.toLowerCase().includes(q)) : g.items,
      }))
      .filter((g) => g.items.length > 0);
  }, [query, activeGroup, faqGroups]);

  return (
    <MainLayout>
      <div className="info-hero" style={{ textAlign: 'center' }}>
        <div className="container">
          <span className="info-eyebrow">{t('nav.helpCenter')}</span>
          <h1 className="info-title">{t('help.title')}</h1>
          <div className="help-search">
            <input
              type="search"
              className="input-field"
              placeholder={t('help.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t('help.searchPlaceholder')}
            />
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBlock: '36px' }}>
        <div className="help-quick-grid">
          {quickLinks.map((l) => (
            <Link key={l.title} to={l.to} className="card help-quick-card">
              <span className="help-quick-icon">{l.icon}</span>
              <div>
                <div style={{ fontWeight: 800 }}>{t(l.title)}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t(l.text)}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="help-topic-pills no-scrollbar">
          <button className={`help-pill${activeGroup === 'all' ? ' active' : ''}`} onClick={() => setActiveGroup('all')}>
            {t('help.allTopics')}
          </button>
          {faqGroups.map((g) => (
            <button key={g.id} className={`help-pill${activeGroup === g.id ? ' active' : ''}`} onClick={() => setActiveGroup(g.id)}>
              {g.icon} {g.title}
            </button>
          ))}
        </div>

        {filteredGroups.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
            <h3 style={{ marginBottom: '6px' }}>{t('help.noMatch', { term: query })}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{t('help.tryAnother')}</p>
            <Link to="/contact" className="btn btn-primary btn-sm">{t('info.contactSupport')}</Link>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <section key={group.id} style={{ marginBottom: '28px' }}>
              <h2 className="help-group-title">
                {group.icon} {group.title}
              </h2>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {group.items.map((item) => {
                  const key = `${group.id}-${item.q}`;
                  const isOpen = openItem === key || query.trim().length > 0;
                  return (
                    <div key={key} className="faq-item">
                      <button
                        className="faq-question"
                        aria-expanded={isOpen}
                        onClick={() => setOpenItem(openItem === key ? null : key)}
                      >
                        <span>{item.q}</span>
                        <span className={`faq-chevron${isOpen ? ' open' : ''}`}>⌄</span>
                      </button>
                      {isOpen && <div className="faq-answer">{fillShipping(item.a)}</div>}
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </MainLayout>
  );
};

export default HelpCenter;
