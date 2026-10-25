import React from 'react';

const LANGS = [
  { code: 'en', label: 'EN', placeholder: 'English (required)' },
  { code: 'so', label: 'SO', placeholder: 'Soomaali (optional — falls back to English)' },
  { code: 'ar', label: 'AR', placeholder: 'العربية (اختياري)' },
];

/**
 * One shopper-facing text in all three store languages.
 * value: { en, so, ar }   onChange(nextValue)
 */
const I18nField = ({ label, value, onChange, multiline = false, maxLength, required = false, hint }) => {
  const v = value || {};
  const set = (code, text) => onChange({ ...v, [code]: text });

  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <div className="i18n-field">
        {LANGS.map((l) => {
          const common = {
            className: 'input-field',
            value: v[l.code] || '',
            placeholder: l.placeholder,
            maxLength,
            dir: l.code === 'ar' ? 'rtl' : 'ltr',
            lang: l.code,
            required: required && l.code === 'en',
            'aria-label': `${label || 'Text'} (${l.label})`,
            onChange: (e) => set(l.code, e.target.value),
          };
          return (
            <div key={l.code} className="i18n-row">
              <span className="i18n-tag">{l.label}</span>
              {multiline ? <textarea rows={2} {...common} /> : <input type="text" {...common} />}
            </div>
          );
        })}
      </div>
      {hint && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hint}</div>}
    </div>
  );
};

export default I18nField;
