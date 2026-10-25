import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import I18nField from '../../components/admin/I18nField';
import settingsService from '../../services/settingsService';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import formatDate from '../../utils/formatDate';

const TABS = [
  { id: 'general', label: '⚙️ General & Shipping' },
  { id: 'announcements', label: '📣 Announcement Bar' },
  { id: 'menu', label: '🧭 Header Menu' },
  { id: 'hero', label: '🖼️ Homepage Banners' },
];

const emptyText = () => ({ en: '', so: '', ar: '' });

const newSlide = () => ({
  enabled: true,
  tag: emptyText(),
  headline: { en: 'NEW COLLECTION.', so: '', ar: '' },
  highlight: emptyText(),
  description: emptyText(),
  badge: emptyText(),
  ctaPrimary: { en: 'SHOP NOW', so: 'HADDA IIBSO', ar: 'تسوّق الآن' },
  linkPrimary: '/shop',
  ctaSecondary: emptyText(),
  linkSecondary: '/shop',
  accentColor: '#2563eb',
  productName: '',
  productImage: '',
  productPrice: 0,
  productOriginalPrice: 0,
  productBadge: emptyText(),
  productLink: '',
});

// datetime-local wants "YYYY-MM-DDTHH:mm" in local time
const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Small helpers to edit arrays of items (add / remove / move / patch). */
const move = (list, index, delta) => {
  const next = [...list];
  const target = index + delta;
  if (target < 0 || target >= next.length) return list;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

const ItemControls = ({ index, count, enabled, onMove, onToggle, onRemove }) => (
  <div className="list-editor-actions">
    <button type="button" className="btn btn-outline btn-xs" disabled={index === 0} onClick={() => onMove(-1)} title="Move up" aria-label="Move up">↑</button>
    <button type="button" className="btn btn-outline btn-xs" disabled={index === count - 1} onClick={() => onMove(1)} title="Move down" aria-label="Move down">↓</button>
    <button type="button" className="btn btn-outline btn-xs" onClick={onToggle}>{enabled ? 'Hide' : 'Show'}</button>
    <button type="button" className="btn btn-danger btn-xs" onClick={onRemove}>Remove</button>
  </div>
);

const AdminSettings = () => {
  const [tab, setTab] = useState('general');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [meta, setMeta] = useState({ updatedAt: null, updatedBy: null });
  const { showToast } = useToast();
  const { refresh: refreshStorefront } = useSettings();

  useEffect(() => {
    settingsService
      .getAdmin()
      .then((res) => {
        if (!res.success) return;
        const d = res.data;
        setForm({
          supportEmail: d.supportEmail,
          freeShippingThreshold: d.freeShippingThreshold,
          flatShippingFee: d.flatShippingFee,
          announcementEnabled: d.announcementEnabled,
          announcements: d.announcements || [],
          flashSaleEndsAt: toLocalInput(d.flashSaleEndsAt),
          menuLinks: d.menuLinks || [],
          showCategoriesInMenu: d.showCategoriesInMenu,
          heroSlides: d.heroSlides || [],
        });
        setMeta({ updatedAt: d.updatedAt, updatedBy: d.updatedBy });
      })
      .catch((err) => showToast(err.message, 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const update = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  };

  const patchItem = (field, index, patch) => update({ [field]: form[field].map((it, i) => (i === index ? { ...it, ...patch } : it)) });
  const removeItem = (field, index) => update({ [field]: form[field].filter((_, i) => i !== index) });

  const save = async () => {
    try {
      setSaving(true);
      const payload = {
        ...form,
        freeShippingThreshold: Number(form.freeShippingThreshold) || 0,
        flatShippingFee: Number(form.flatShippingFee) || 0,
        flashSaleEndsAt: form.flashSaleEndsAt ? new Date(form.flashSaleEndsAt).toISOString() : null,
        heroSlides: form.heroSlides.map((s) => ({
          ...s,
          productPrice: Number(s.productPrice) || 0,
          productOriginalPrice: Number(s.productOriginalPrice) || 0,
        })),
      };
      const res = await settingsService.update(payload);
      if (res.success) {
        setDirty(false);
        setMeta({ updatedAt: res.data.updatedAt, updatedBy: null });
        await refreshStorefront();
        showToast('Settings saved — the store is updated.', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return (
      <AdminLayout title="Site Settings">
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>Loading settings…</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Site Settings">
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900 }}>Store Control Center</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Change what shoppers see without touching code. Texts can be entered in English, Somali and Arabic — empty translations fall back to English.
            </p>
          </div>
          {meta.updatedAt && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Last saved {formatDate(meta.updatedAt)}
              {meta.updatedBy?.name ? ` by ${meta.updatedBy.name}` : ''}
            </div>
          )}
        </div>

        <div className="admin-tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`admin-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ---------------- General & shipping ---------------- */}
        {tab === 'general' && (
          <div style={{ maxWidth: '640px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px' }}>Shipping rules</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Used by the bag, checkout, order totals, product pages and the shipping texts on the site.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="input-group">
                <label className="input-label" htmlFor="s-threshold">Free shipping from ($)</label>
                <input id="s-threshold" type="number" min="0" step="0.01" className="input-field" value={form.freeShippingThreshold} onChange={(e) => update({ freeShippingThreshold: e.target.value })} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Set 0 to make shipping always free.</span>
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="s-fee">Shipping fee below that ($)</label>
                <input id="s-fee" type="number" min="0" step="0.01" className="input-field" value={form.flatShippingFee} onChange={(e) => update({ flatShippingFee: e.target.value })} />
              </div>
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '20px 0 12px' }}>Contact</h3>
            <div className="input-group">
              <label className="input-label" htmlFor="s-email">Support email shown on the site</label>
              <input id="s-email" type="email" className="input-field" value={form.supportEmail} onChange={(e) => update({ supportEmail: e.target.value })} />
            </div>
          </div>
        )}

        {/* ---------------- Announcement bar ---------------- */}
        {tab === 'announcements' && (
          <div>
            <label className="toggle-row">
              <input type="checkbox" checked={form.announcementEnabled} onChange={(e) => update({ announcementEnabled: e.target.checked })} />
              Show the announcement bar at the top of every page
            </label>

            <div className="input-group" style={{ maxWidth: '360px' }}>
              <label className="input-label" htmlFor="s-flash">Flash sale ends at (optional)</label>
              <input id="s-flash" type="datetime-local" className="input-field" value={form.flashSaleEndsAt} onChange={(e) => update({ flashSaleEndsAt: e.target.value })} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Shows a live countdown in the bar and the homepage flash-sale section. Leave empty to hide the countdown.
              </span>
              {form.flashSaleEndsAt && (
                <button type="button" className="btn btn-outline btn-xs" style={{ alignSelf: 'flex-start' }} onClick={() => update({ flashSaleEndsAt: '' })}>
                  Clear end date
                </button>
              )}
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '8px 0 6px' }}>Rotating messages</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Tip: write <code>{'{threshold}'}</code> or <code>{'{fee}'}</code> to show your current shipping amounts.
            </p>
            {form.announcements.map((a, i) => (
              <div key={a._id || i} className={`list-editor-item${a.enabled === false ? ' disabled' : ''}`}>
                <div className="list-editor-head">
                  <strong>Message {i + 1}{a.enabled === false ? ' (hidden)' : ''}</strong>
                  <ItemControls
                    index={i}
                    count={form.announcements.length}
                    enabled={a.enabled !== false}
                    onMove={(d) => update({ announcements: move(form.announcements, i, d) })}
                    onToggle={() => patchItem('announcements', i, { enabled: a.enabled === false })}
                    onRemove={() => removeItem('announcements', i)}
                  />
                </div>
                <I18nField value={a.text} maxLength={140} required onChange={(text) => patchItem('announcements', i, { text })} />
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" disabled={form.announcements.length >= 10} onClick={() => update({ announcements: [...form.announcements, { enabled: true, text: emptyText() }] })}>
              + Add message
            </button>
          </div>
        )}

        {/* ---------------- Header menu ---------------- */}
        {tab === 'menu' && (
          <div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              These links appear in the bar under the search box. Use a page on this site (starting with <code>/</code>, e.g. <code>/shop?sort=newest</code> or{' '}
              <code>/shop?category=phones</code>) or a full web address.
            </p>
            {form.menuLinks.map((l, i) => (
              <div key={l._id || i} className={`list-editor-item${l.enabled === false ? ' disabled' : ''}`}>
                <div className="list-editor-head">
                  <strong>Link {i + 1}{l.enabled === false ? ' (hidden)' : ''}</strong>
                  <ItemControls
                    index={i}
                    count={form.menuLinks.length}
                    enabled={l.enabled !== false}
                    onMove={(d) => update({ menuLinks: move(form.menuLinks, i, d) })}
                    onToggle={() => patchItem('menuLinks', i, { enabled: l.enabled === false })}
                    onRemove={() => removeItem('menuLinks', i)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <I18nField label="Label" value={l.label} maxLength={40} required onChange={(label) => patchItem('menuLinks', i, { label })} />
                  <div>
                    <div className="input-group">
                      <label className="input-label">Goes to</label>
                      <input className="input-field" value={l.url} maxLength={300} placeholder="/shop" onChange={(e) => patchItem('menuLinks', i, { url: e.target.value })} />
                    </div>
                    <label className="toggle-row">
                      <input type="checkbox" checked={!!l.highlight} onChange={(e) => patchItem('menuLinks', i, { highlight: e.target.checked })} />
                      Highlight in pink (for sales)
                    </label>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" disabled={form.menuLinks.length >= 12} onClick={() => update({ menuLinks: [...form.menuLinks, { enabled: true, highlight: false, url: '/shop', label: emptyText() }] })}>
              + Add menu link
            </button>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '22px 0' }} />
            <label className="toggle-row">
              <input type="checkbox" checked={form.showCategoriesInMenu} onChange={(e) => update({ showCategoriesInMenu: e.target.checked })} />
              Also list categories after these links
            </label>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Choose which categories appear, and in what order, on the <strong>Categories</strong> page.
            </p>
          </div>
        )}

        {/* ---------------- Homepage banners ---------------- */}
        {tab === 'hero' && (
          <div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              The big rotating banner at the top of the homepage. {form.heroSlides.length === 0 && <strong>No custom banners yet — the built-in ones are showing.</strong>}
            </p>
            {form.heroSlides.map((s, i) => (
              <div key={s._id || i} className={`list-editor-item${s.enabled === false ? ' disabled' : ''}`}>
                <div className="list-editor-head">
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: 14, height: 14, borderRadius: 4, background: s.accentColor, display: 'inline-block' }} />
                    Banner {i + 1}: {s.headline?.en || 'Untitled'}{s.enabled === false ? ' (hidden)' : ''}
                  </strong>
                  <ItemControls
                    index={i}
                    count={form.heroSlides.length}
                    enabled={s.enabled !== false}
                    onMove={(d) => update({ heroSlides: move(form.heroSlides, i, d) })}
                    onToggle={() => patchItem('heroSlides', i, { enabled: s.enabled === false })}
                    onRemove={() => removeItem('heroSlides', i)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <I18nField label="Small tag above the headline" value={s.tag} maxLength={60} onChange={(tag) => patchItem('heroSlides', i, { tag })} />
                  <I18nField label="Badge next to the tag" value={s.badge} maxLength={40} onChange={(badge) => patchItem('heroSlides', i, { badge })} />
                  <I18nField label="Headline" value={s.headline} maxLength={60} required onChange={(headline) => patchItem('heroSlides', i, { headline })} />
                  <I18nField label="Coloured second line" value={s.highlight} maxLength={60} onChange={(highlight) => patchItem('heroSlides', i, { highlight })} />
                </div>
                <I18nField label="Description" value={s.description} maxLength={240} multiline onChange={(description) => patchItem('heroSlides', i, { description })} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <I18nField label="Main button text" value={s.ctaPrimary} maxLength={40} onChange={(ctaPrimary) => patchItem('heroSlides', i, { ctaPrimary })} />
                    <div className="input-group">
                      <label className="input-label">Main button goes to</label>
                      <input className="input-field" value={s.linkPrimary} onChange={(e) => patchItem('heroSlides', i, { linkPrimary: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <I18nField label="Second button text (optional)" value={s.ctaSecondary} maxLength={40} onChange={(ctaSecondary) => patchItem('heroSlides', i, { ctaSecondary })} />
                    <div className="input-group">
                      <label className="input-label">Second button goes to</label>
                      <input className="input-field" value={s.linkSecondary} onChange={(e) => patchItem('heroSlides', i, { linkSecondary: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="input-group" style={{ maxWidth: '220px' }}>
                  <label className="input-label">Accent colour</label>
                  <input type="color" value={s.accentColor} onChange={(e) => patchItem('heroSlides', i, { accentColor: e.target.value })} style={{ width: 60, height: 36, border: 'none', background: 'none' }} />
                </div>

                <details style={{ marginTop: '6px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem' }}>Product card on the right (optional)</summary>
                  <div style={{ marginTop: '12px' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="input-group">
                        <label className="input-label">Product image address</label>
                        <input className="input-field" value={s.productImage} placeholder="https://..." onChange={(e) => patchItem('heroSlides', i, { productImage: e.target.value })} />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Product name</label>
                        <input className="input-field" value={s.productName} maxLength={80} onChange={(e) => patchItem('heroSlides', i, { productName: e.target.value })} />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Price ($)</label>
                        <input type="number" min="0" step="0.01" className="input-field" value={s.productPrice} onChange={(e) => patchItem('heroSlides', i, { productPrice: e.target.value })} />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Old price ($, shown crossed out)</label>
                        <input type="number" min="0" step="0.01" className="input-field" value={s.productOriginalPrice} onChange={(e) => patchItem('heroSlides', i, { productOriginalPrice: e.target.value })} />
                      </div>
                      <I18nField label="Card badge" value={s.productBadge} maxLength={40} onChange={(productBadge) => patchItem('heroSlides', i, { productBadge })} />
                      <div className="input-group">
                        <label className="input-label">Card button goes to</label>
                        <input className="input-field" value={s.productLink} placeholder="/product/..." onChange={(e) => patchItem('heroSlides', i, { productLink: e.target.value })} />
                      </div>
                    </div>
                    {s.productImage && <img src={s.productImage} alt="" style={{ maxHeight: 120, borderRadius: 8, marginTop: 8 }} />}
                  </div>
                </details>
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" disabled={form.heroSlides.length >= 6} onClick={() => update({ heroSlides: [...form.heroSlides, newSlide()] })}>
              + Add banner
            </button>
          </div>
        )}

        <div className="settings-savebar">
          {dirty && <span style={{ fontSize: '0.85rem', color: 'var(--warning)', fontWeight: 700 }}>Unsaved changes</span>}
          <button type="button" className="btn btn-primary" disabled={saving || !dirty} onClick={save}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
