import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Globe button + dropdown that switches the storefront language.
 * `variant="list"` renders the options inline (used in the footer).
 */
const LanguageSwitcher = ({ variant = 'dropdown' }) => {
  const { lang, setLang, languages, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = languages.find((l) => l.code === lang);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (variant === 'list') {
    return (
      <div className="lang-list" role="group" aria-label={t('language.choose')}>
        {languages.map((l) => (
          <button
            key={l.code}
            type="button"
            lang={l.code}
            className={`lang-list-btn${l.code === lang ? ' active' : ''}`}
            aria-pressed={l.code === lang}
            onClick={() => setLang(l.code)}
          >
            {l.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn-icon lang-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t('language.choose')}: ${current.label}`}
        title={t('language.choose')}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">🌐</span>
        <span className="lang-trigger-code">{current.short}</span>
      </button>

      {open && (
        <ul className="card lang-menu" role="listbox" aria-label={t('language.choose')}>
          {languages.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                lang={l.code}
                aria-selected={l.code === lang}
                className={`lang-option${l.code === lang ? ' active' : ''}`}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
              >
                <span>{l.label}</span>
                {l.code === lang && <span aria-hidden="true">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
