import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useT } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import useFlashCountdown from '../../utils/useFlashCountdown';

const PromoBanner = () => {
  const t = useT();
  const { settings, loaded, localized, fillShipping } = useSettings();
  const countdown = useFlashCountdown();
  const [activeMessageIndex, setActiveMessageIndex] = useState(0);

  // Messages come from Admin → Site Settings; the built-in ones are only a fallback
  const configured = (settings.announcements || []).map((a) => fillShipping(localized(a.text))).filter(Boolean);
  const messages = configured.length
    ? configured
    : [`⚡ ${t('promo.flash')}`, `📦 ${fillShipping(t('promo.shipping'))}`, `🔥 ${t('promo.firstOrder')}`, `🛡️ ${t('promo.authentic')}`];

  // Rotate messages every 4.5 seconds
  useEffect(() => {
    if (messages.length < 2) return undefined;
    const messageInterval = setInterval(() => {
      setActiveMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4500);
    return () => clearInterval(messageInterval);
  }, [messages.length]);

  if (loaded && settings.announcementEnabled === false) return null;

  const formatPad = (num) => String(num).padStart(2, '0');
  const message = messages[activeMessageIndex % messages.length];

  return (
    <div className="ticker-banner">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
        {/* Rotating announcement */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span style={{ fontSize: '1rem' }} className="animate-pulse-glow">🔥</span>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.6px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {message}
          </span>
        </div>

        {/* Flash-sale countdown (only when an end date is set) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {countdown.active && (
            <>
              <span style={{ fontSize: '0.74rem', color: '#cbd5e1', fontWeight: 600, display: 'none' }} className="md:inline">
                {t('promo.endsIn')}
              </span>
              <div className="countdown-box">
                <span className="countdown-segment">{formatPad(countdown.hours)}</span>
                <span>:</span>
                <span className="countdown-segment">{formatPad(countdown.minutes)}</span>
                <span>:</span>
                <span className="countdown-segment">{formatPad(countdown.seconds)}</span>
              </div>
            </>
          )}

          <Link
            to="/shop?hasDiscount=true"
            style={{
              backgroundColor: '#ff1361',
              color: '#ffffff',
              padding: '2px 10px',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginInlineStart: '6px',
            }}
          >
            {t('promo.shopNow')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
