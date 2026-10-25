import React, { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { getSiteContent } from '../../data/siteContent';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';

const sideLinks = [
  { to: '/about', label: 'footer.about' },
  { to: '/help', label: 'nav.helpCenter' },
  { to: '/shipping-policy', label: 'footer.shippingPolicy' },
  { to: '/returns', label: 'footer.returns' },
  { to: '/privacy', label: 'footer.privacy' },
  { to: '/terms', label: 'footer.terms' },
  { to: '/contact', label: 'footer.contact' },
];

const PolicyPage = ({ page }) => {
  const { t, lang } = useLanguage();
  const { fillShipping } = useSettings();
  const content = getSiteContent(lang).policyPages[page];

  useEffect(() => {
    document.title = `${content.title} — ABDULL`;
    window.scrollTo(0, 0);
    return () => {
      document.title = t('meta.defaultTitle');
    };
  }, [content.title, t]);

  return (
    <MainLayout>
      <div className="info-hero">
        <div className="container">
          <div className="info-breadcrumb">
            <Link to="/">{t('nav.home')}</Link> <span>/</span> <span>{content.title}</span>
          </div>
          <span className="info-eyebrow">{content.eyebrow}</span>
          <h1 className="info-title">{content.title}</h1>
          <p className="info-intro">{content.intro}</p>
          {content.updated && <p className="info-updated">{t('info.lastUpdated')} {content.updated}</p>}
        </div>
      </div>

      <div className="container info-layout">
        <aside className="info-sidenav">
          {sideLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `info-sidenav-link${isActive ? ' active' : ''}`}>
              {t(link.label)}
            </NavLink>
          ))}
        </aside>

        <article className="card info-article">
          {content.sections.map((section) => (
            <section key={section.heading} className="info-section">
              <h2>{section.heading}</h2>
              {section.body && section.body.map((p, i) => <p key={i}>{fillShipping(p)}</p>)}
              {section.list && (
                <ul>
                  {section.list.map((li, i) => (
                    <li key={i}>{fillShipping(li)}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <div className="info-cta">
            <div>
              <strong>{t('info.stillQuestions')}</strong>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('info.replyTime')}</div>
            </div>
            <Link to="/contact" className="btn btn-primary btn-sm">
              {t('info.contactSupport')}
            </Link>
          </div>
        </article>
      </div>
    </MainLayout>
  );
};

export default PolicyPage;
